"""
CSV Seed Loader.

Utility leggera per caricare i dati di seed predefiniti direttamente dai file CSV
presenti nella cartella `backend/seeds/`.
"""
from __future__ import annotations

import csv
from pathlib import Path
from typing import Any, Dict, List

SEEDS_DIR = Path(__file__).resolve().parent.parent / "seeds"


def _read_csv(filename: str) -> List[Dict[str, str]]:
    """Legge un file CSV con delimitatore ';' e codifica UTF-8/UTF-8-SIG."""
    file_path = SEEDS_DIR / filename
    if not file_path.is_file():
        return []

    rows: List[Dict[str, str]] = []
    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            rows.append({k.strip(): (v.strip() if v else "") for k, v in row.items() if k})
    return rows


def load_seed_user_categories() -> List[Dict[str, Any]]:
    """Carica le categorie utente di default dal file user_categories.csv."""
    rows = _read_csv("user_categories.csv")
    result: List[Dict[str, Any]] = []
    for r in rows:
        genre_val = int(r["genre"]) if r.get("genre") else 3
        result.append({
            "category_name": r.get("category_name", ""),
            "colore": r.get("colore") or "#68EEB4",
            "genre": genre_val,
        })
    return result


def load_seed_config_codes() -> List[Dict[str, Any]]:
    """Carica i codici di configurazione da config_codes.csv."""
    rows = _read_csv("config_codes.csv")
    result: List[Dict[str, Any]] = []
    for r in rows:
        active_val = r.get("active", "").lower() in ("true", "1", "yes") if r.get("active") else True
        sort_order_raw = r.get("sort_order", "")
        sort_order = int(sort_order_raw) if sort_order_raw else None

        item: Dict[str, Any] = {
            "code_type": r.get("code_type", ""),
            "code_value": r.get("code_value", ""),
            "code_name": r.get("code_name", ""),
            "description": r.get("description", ""),
            "active": active_val,
        }
        if sort_order is not None:
            item["sort_order"] = sort_order
        result.append(item)
    return result


def load_seed_suppliers() -> List[str]:
    """Carica l'elenco dei nomi dei fornitori di default da suppliers.csv."""
    rows = _read_csv("suppliers.csv")
    return [r["supplier_name"] for r in rows if r.get("supplier_name")]


def load_seed_configs() -> List[Dict[str, str]]:
    """Carica le configurazioni applicative da config.csv."""
    rows = _read_csv("config.csv")
    return [
        {
            "key": r.get("key", ""),
            "value": r.get("value", ""),
            "descrizione": r.get("descrizione", ""),
        }
        for r in rows
        if r.get("key")
    ]


def load_seed_users(default_max_subtask_depth: int = 10) -> List[Dict[str, Any]]:
    """Carica gli utenti di sistema predefiniti da users.csv."""
    rows = _read_csv("users.csv")
    users: List[Dict[str, Any]] = []
    for r in rows:
        uid = int(r["id"]) if r.get("id") else len(users) + 1
        is_su = r.get("is_superuser", "").lower() in ("true", "1", "yes")
        must_cp = r.get("must_change_password", "").lower() in ("true", "1", "yes")
        depth = int(r["max_subtask_depth_user"]) if r.get("max_subtask_depth_user") else default_max_subtask_depth

        users.append({
            "id": uid,
            "username": r.get("username", ""),
            "email": r.get("email", ""),
            "password": r.get("password", ""),
            "is_superuser": is_su,
            "must_change_password": must_cp,
            "max_subtask_depth_user": depth,
        })
    return users
