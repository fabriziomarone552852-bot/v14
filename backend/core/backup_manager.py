"""
Modulo per il Backup e Restore Generale del Database su NAS e/o archiviazione locale.

Caratteristiche:
- Dump completo in JSON compresso (.json.gz o .zip) di tutte le tabelle del DB secondo l'ordine topologico di SQLAlchemy.
- Gestione di date, datetime, Decimal, UUID e booleani.
- Salvataggio automatico nella cartella NAS (/app/backups o BACKUP_STORAGE_DIR).
- Elenco storico dei backup con metadati (dimensione, data, conteggio record).
- Restore transazionale atomico con cancellazione ordinata (chiavi esterne rispettate) o merge.
- Sincronizzazione automatica finale di tutte le sequenze PostgreSQL (sync_all_table_sequences).
"""
from __future__ import annotations

import gzip
import json
import logging
import os
import shutil
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, insert, inspect, select, text
from sqlalchemy.orm import Session

from backend.core.database import Base
from backend.core.env import BACKEND_DIR
from backend.core.models import import_all_models
from backend.core.sequence_sync import sync_all_table_sequences

logger = logging.getLogger(__name__)

# Assicuriamoci che tutti i modelli siano noti
import_all_models()

BACKUPS_BASE_DIR = Path(os.environ.get("BACKUP_STORAGE_DIR", str(BACKEND_DIR.parent / "backups")))
BACKUPS_SYSTEM_DIR = BACKUPS_BASE_DIR / "database"


def _json_serial(obj: Any) -> Any:
    """Serializzatore custom per tipi non JSON-nativi."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return str(obj)
    if isinstance(obj, bytes):
        return obj.hex()
    raise TypeError(f"Type {type(obj)} not serializable")


def find_backup_file(filename: str) -> Optional[Path]:
    """
    Cerca in modo sicuro un file di backup per nome all'interno di BACKUPS_BASE_DIR
    (nelle sottocartelle database, daily, weekly o altrove).
    Previene categoricamente directory traversal.
    """
    clean_name = Path(filename).name
    if not clean_name or clean_name != filename or not clean_name.endswith(".json.gz"):
        return None

    # Controllo rapido nei percorsi standard più frequenti
    for candidate_dir in (BACKUPS_SYSTEM_DIR, BACKUPS_BASE_DIR / "daily", BACKUPS_BASE_DIR / "weekly", BACKUPS_BASE_DIR):
        target = candidate_dir / clean_name
        if target.is_file():
            return target

    # Fallback ricerca ricorsiva controllata
    base_resolved = BACKUPS_BASE_DIR.resolve()
    for p in BACKUPS_BASE_DIR.glob(f"**/{clean_name}"):
        if p.is_file():
            try:
                if p.resolve().is_relative_to(base_resolved):
                    return p
            except Exception:
                pass
    return None


def rotate_backups(subdir: str = "daily", keep: int = 2) -> List[str]:
    """
    Politica di retention FIFO (max N copie):
    mantiene solo gli ultimi `keep` file di backup (.json.gz) nella cartella specificata
    ordinati per data di modifica discendente ed elimina i più obsoleti.
    Restituisce l'elenco dei nomi di file eliminati.
    """
    target_dir = BACKUPS_BASE_DIR / subdir
    if not target_dir.is_dir():
        return []

    files = sorted(
        [f for f in target_dir.glob("*.json.gz") if f.is_file()],
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    deleted = []
    if len(files) > keep:
        for old_file in files[keep:]:
            try:
                old_file.unlink()
                deleted.append(old_file.name)
                logger.info("Rotazione backup %s: rimosso file eccedente %s", subdir, old_file.name)
            except Exception as e:
                logger.warning("Impossibile eliminare backup eccedente %s: %s", old_file, e)
    return deleted


def create_full_database_backup(
    db: Session,
    note: Optional[str] = None,
    subdir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Estrae tutte le tabelle registrate nel sistema in ordine topologico
    e salva un file compresso .json.gz nella cartella di destinazione (database, daily, weekly).
    Crea automaticamente la cartella target se non esiste.
    """
    target_category = (subdir or "database").strip().lower()
    target_dir = BACKUPS_BASE_DIR / target_category
    target_dir.mkdir(parents=True, exist_ok=True)

    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    filename = f"backup_vita_{timestamp_str}.json.gz"
    filepath = target_dir / filename

    tables_data: Dict[str, List[Dict[str, Any]]] = {}
    table_counts: Dict[str, int] = {}
    total_records = 0

    sorted_tables = Base.metadata.sorted_tables
    inspector = inspect(db.get_bind())
    existing_db_tables = set(inspector.get_table_names())

    for table in sorted_tables:
        tname = table.name
        if tname not in existing_db_tables:
            # Tabella non presente nel DB reale, saltala con sicurezza
            continue

        # Ispeziona le colonne realmente esistenti nella tabella del DB fisico
        real_cols = {c["name"] for c in inspector.get_columns(tname)}
        # Seleziona solo le colonne del modello che esistono fisicamente sul database
        valid_cols = [c for c in table.columns if c.name in real_cols]
        if not valid_cols:
            continue

        stmt = select(*valid_cols)
        try:
            rows = db.execute(stmt).mappings().all()
        except Exception as q_exc:
            logger.warning("Salto backup tabella %s per errore query: %s", tname, q_exc)
            continue

        serialized_rows = []
        for r in rows:
            row_dict = {}
            for col_name, val in r.items():
                if isinstance(val, (datetime, date)):
                    row_dict[col_name] = val.isoformat()
                elif isinstance(val, Decimal):
                    row_dict[col_name] = str(val)
                elif isinstance(val, bytes):
                    row_dict[col_name] = val.hex()
                else:
                    row_dict[col_name] = val
            serialized_rows.append(row_dict)

        tables_data[tname] = serialized_rows
        table_counts[tname] = len(serialized_rows)
        total_records += len(serialized_rows)


    metadata = {
        "app": "Vita (Smart Agenda)",
        "version": "15.4.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "total_records": total_records,
        "tables_count": len(sorted_tables),
        "note": note or "",
        "category": target_category,
        "table_counts": table_counts,
    }

    full_payload = {
        "metadata": metadata,
        "data": tables_data,
    }

    # Scrittura compressa con gzip
    json_bytes = json.dumps(full_payload, default=_json_serial, indent=None).encode("utf-8")
    with gzip.open(filepath, "wb") as f:
        f.write(json_bytes)

    file_size_bytes = filepath.stat().st_size
    file_size_kb = round(file_size_bytes / 1024, 2)

    return {
        "filename": filename,
        "path": str(filepath),
        "category": target_category,
        "created_at": metadata["created_at"],
        "size_kb": file_size_kb,
        "total_records": total_records,
        "table_counts": table_counts,
    }


def list_database_backups() -> List[Dict[str, Any]]:
    """
    Restituisce l'elenco cronologico di tutti i file di backup presenti nelle cartelle di archiviazione
    (database, daily, weekly), ordinati per data discendente.
    Garantisce la creazione difensiva di tutte le cartelle se non esistono.
    """
    for sub in ("database", "daily", "weekly"):
        (BACKUPS_BASE_DIR / sub).mkdir(parents=True, exist_ok=True)

    results = []
    seen_filenames = set()

    # Esplora ricorsivamente tutti i file .json.gz in BACKUPS_BASE_DIR
    for file_p in BACKUPS_BASE_DIR.glob("**/*.json.gz"):
        if not file_p.is_file() or file_p.name in seen_filenames:
            continue
        seen_filenames.add(file_p.name)

        try:
            stat = file_p.stat()
            mod_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
            size_kb = round(stat.st_size / 1024, 2)
            category = file_p.parent.name if file_p.parent != BACKUPS_BASE_DIR else "database"

            records_count = None
            note = None
            try:
                with gzip.open(file_p, "rt", encoding="utf-8") as f:
                    chunk = f.read(4096)
                    meta_start = chunk.find('"metadata":')
                    if meta_start != -1:
                        data_parsed = json.loads(chunk + '}}')
                        if "metadata" in data_parsed:
                            records_count = data_parsed["metadata"].get("total_records")
                            note = data_parsed["metadata"].get("note")
                            if "category" in data_parsed["metadata"]:
                                category = data_parsed["metadata"]["category"]
            except Exception:
                pass

            results.append({
                "filename": file_p.name,
                "category": category,
                "created_at": mod_time,
                "size_kb": size_kb,
                "total_records": records_count,
                "note": note,
            })
        except Exception as exc:
            logger.warning("Errore lettura info backup %s: %s", file_p.name, exc)

    results.sort(key=lambda x: x["created_at"], reverse=True)
    return results


def delete_database_backup(filename: str) -> bool:
    """Elimina in modo sicuro un file di backup dalla cartella di archiviazione."""
    target = find_backup_file(filename)
    if target and target.is_file():
        target.unlink()
        return True
    return False


def restore_full_database_backup(db: Session, filename: str) -> Dict[str, Any]:
    """
    Ripristina il database completo da un file di backup .json.gz (ricercato in modo sicuro).
    Esegue un'operazione transazionale atomica:
    1. Legge e convalida il backup.
    2. Svuota tutte le tabelle in ordine inverso rispetto alle dipendenze (foreign key).
    3. Reinserisce i dati in ordine diretto.
    4. Sincronizza tutte le sequenze autoincrement in PostgreSQL.
    """
    target = find_backup_file(filename)
    if not target or not target.is_file():
        raise FileNotFoundError(f"File di backup '{filename}' non trovato nella directory di archiviazione")

    with gzip.open(target, "rt", encoding="utf-8") as f:
        full_payload = json.load(f)

    tables_data = full_payload.get("data", {})
    metadata = full_payload.get("metadata", {})

    sorted_tables = Base.metadata.sorted_tables
    reversed_tables = list(reversed(sorted_tables))

    restored_counts: Dict[str, int] = {}

    try:
        # Disabilita temporaneamente i controlli di integrità se postgres o svuota a cascata
        # Svuotamento in ordine inverso di foreign key
        for table in reversed_tables:
            db.execute(delete(table))
        db.flush()

        # Reinserimento in ordine diretto di dipendenza
        for table in sorted_tables:
            tname = table.name
            rows = tables_data.get(tname, [])
            if not rows:
                restored_counts[tname] = 0
                continue

            # Prepariamo i valori per le colonne
            table_cols = {col.name: col for col in table.columns}
            cleaned_rows = []

            for r in rows:
                row_dict = {}
                for k, v in r.items():
                    if k in table_cols:
                        col_type = str(table_cols[k].type).lower()
                        if v is not None:
                            if "date" in col_type or "time" in col_type:
                                try:
                                    row_dict[k] = datetime.fromisoformat(v) if "time" in col_type else date.fromisoformat(v)
                                except Exception:
                                    row_dict[k] = v
                            elif "numeric" in col_type or "decimal" in col_type:
                                row_dict[k] = Decimal(str(v))
                            else:
                                row_dict[k] = v
                        else:
                            row_dict[k] = None
                cleaned_rows.append(row_dict)

            # Inserimento a blocchi se molti record
            batch_size = 500
            for i in range(0, len(cleaned_rows), batch_size):
                batch = cleaned_rows[i:i + batch_size]
                db.execute(insert(table), batch)

            restored_counts[tname] = len(cleaned_rows)
            db.flush()

        # Sincronizzazione sequenze ID autoincrement
        synced_sequences = sync_all_table_sequences(db)
        db.commit()

        return {
            "status": "success",
            "message": f"Ripristino completato con successo da {filename}",
            "restored_tables_count": len(restored_counts),
            "total_restored_records": sum(restored_counts.values()),
            "synced_sequences_count": len(synced_sequences),
            "restored_counts": restored_counts,
        }
    except Exception as exc:
        db.rollback()
        logger.error("Errore critico durante il ripristino del database: %s", exc, exc_info=True)
        raise RuntimeError(f"Ripristino fallito: {exc}")
