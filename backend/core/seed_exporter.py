"""
Modulo per l'esportazione / dump dei dati delle tabelle del database
nei file CSV di seed (backend/seeds/) e archiviazione su disco (NAS/local storage).

Supporta:
- config.csv
- config_codes.csv
- user_categories.csv
- shopping_suppliers.csv
- shopping_products.csv
- shopping_product_brands.csv (nuovo 7° file per N:N e note)
- inventory_batch.csv
"""
from __future__ import annotations

import csv
import io
import os
import shutil
import zipfile
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.core.env import BACKEND_DIR
from backend.domains.categories.models import UserCategory
from backend.domains.config.models import Config, ConfigCode
from backend.domains.shopping.models.catalog import (
    ShoppingProduct,
    ShoppingProductBrand,
    ShoppingSupplier,
)
from backend.domains.shopping.models.inventory import InventoryBatch

SEEDS_DIR = BACKEND_DIR / "seeds"

# Cartella di backup su NAS o percorso configurato
BACKUPS_BASE_DIR = Path(os.environ.get("BACKUP_STORAGE_DIR", str(BACKEND_DIR.parent / "backups")))
BACKUPS_CSV_DIR = BACKUPS_BASE_DIR / "csv"


def _format_val(val: Any) -> str:
    """Formatta i valori generici per il CSV in standard coerente con i seed."""
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "t" if val else "f"
    if isinstance(val, (int,)):
        return str(val)
    if isinstance(val, (Decimal, float)):
        s = f"{val:f}" if isinstance(val, Decimal) else str(val)
        if "." in s:
            s = s.rstrip("0").rstrip(".") if "." in s else s
        return s.replace(".", ",")
    if isinstance(val, datetime):
        return val.strftime("%d/%m/%Y %H:%M")
    if isinstance(val, date):
        return val.strftime("%d/%m/%Y")
    # Stringhe
    s_val = str(val).strip()
    return s_val if s_val else "NULL"


def _format_price(val: Any) -> str:
    """Formatta i prezzi a 2 cifre decimali fisse (es. 12,30 o 2,50)."""
    if val is None:
        return "NULL"
    try:
        d = Decimal(str(val))
        return f"{d:.2f}".replace(".", ",")
    except Exception:
        return _format_val(val)


def _format_quantity(val: Any) -> str:
    """Formatta le quantità fino a 3 cifre decimali preservando la precisione (es. 1,500 o 0,350 -> 1,5 o 0,35 / 1,235)."""
    if val is None:
        return "NULL"
    try:
        d = Decimal(str(val))
        # Formatta fino a 3 decimali rimuovendo solo gli zeri superflui oltre l'intero (es. 1,000 -> 1, 1,500 -> 1,5, 1,234 -> 1,234)
        s = f"{d:.3f}".rstrip("0").rstrip(".")
        return s.replace(".", ",")
    except Exception:
        return _format_val(val)




def dump_all_seeds_from_db(db: Session) -> Dict[str, Any]:
    """
    Estrae tutti i dati attuali dalle tabelle e ricrea da zero i 7 file CSV in backend/seeds/,
    archiviando contestualmente uno snapshot nella cartella di backup del NAS e generando
    il conteggio esatto dei record esportati.
    """
    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    BACKUPS_CSV_DIR.mkdir(parents=True, exist_ok=True)

    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    snapshot_dir = BACKUPS_CSV_DIR / f"snapshot_{timestamp_str}"
    snapshot_dir.mkdir(parents=True, exist_ok=True)

    counts: Dict[str, int] = {}
    csv_contents: Dict[str, str] = {}

    # 1. config.csv (key;value;descrizione)
    configs = db.query(Config).order_by(Config.key.asc()).all()
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow(["key", "value", "descrizione"])
    for c in configs:
        writer.writerow([c.key, c.value or "", c.descrizione or ""])
    csv_contents["config.csv"] = out.getvalue()
    counts["config"] = len(configs)

    # 2. config_codes.csv (code_type;code_value;code_name;description;active;sort_order)
    codes = db.query(ConfigCode).order_by(ConfigCode.code_type.asc(), ConfigCode.sort_order.asc().nullslast(), ConfigCode.id.asc()).all()
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow(["code_type", "code_value", "code_name", "description", "active", "sort_order"])
    for cd in codes:
        writer.writerow([
            cd.code_type,
            cd.code_value,
            cd.code_name,
            cd.description or "",
            "True" if cd.active else "False",
            cd.sort_order if cd.sort_order is not None else "",
        ])
    csv_contents["config_codes.csv"] = out.getvalue()
    counts["config_codes"] = len(codes)

    # 3. user_categories.csv (id;category_name;colore;genre)
    user_cats = db.query(UserCategory).order_by(UserCategory.id.asc()).all()
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow(["id", "category_name", "colore", "genre"])
    for uc in user_cats:
        writer.writerow([
            uc.id,
            uc.category_name,
            uc.colore or "#68EEB4",
            uc.genre,
        ])
    csv_contents["user_categories.csv"] = out.getvalue()
    counts["user_categories"] = len(user_cats)

    # 4. shopping_suppliers.csv (id;name_normalized;status_id;created_by_user_id;updated_by_user_id;created_at;updated_at;deleted_at;type_code)
    suppliers = (
        db.query(ShoppingSupplier)
        .filter(ShoppingSupplier.deleted_at.is_(None))
        .order_by(ShoppingSupplier.id.asc())
        .all()
    )
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow([
        "id", "name_normalized", "status_id", "created_by_user_id",
        "updated_by_user_id", "created_at", "updated_at", "deleted_at", "type_code"
    ])
    for s in suppliers:
        writer.writerow([
            s.id,
            s.name_normalized,
            s.status_id,
            s.created_by_user_id,
            s.updated_by_user_id or "NULL",
            _format_val(s.created_at),
            _format_val(s.updated_at),
            _format_val(s.deleted_at),
            s.type_code,
        ])
    csv_contents["shopping_suppliers.csv"] = out.getvalue()
    counts["shopping_suppliers"] = len(suppliers)

    # 5. shopping_products.csv (id;name_normalized;brand_id;created_by_user_id;updated_by_user_id;created_at;updated_at;deleted_at;brand_id2)
    # Manteniamo la compatibilità con le colonne storiche valorizzando brand_id col nome del primo brand collegato
    products = (
        db.query(ShoppingProduct)
        .filter(ShoppingProduct.deleted_at.is_(None))
        .order_by(ShoppingProduct.id.asc())
        .all()
    )
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow([
        "id", "name_normalized", "brand_id", "created_by_user_id",
        "updated_by_user_id", "created_at", "updated_at", "deleted_at", "brand_id2"
    ])
    for p in products:
        first_brand_name = ""
        first_brand_id = "NULL"
        if p.product_brands:
            b_link = p.product_brands[0]
            if b_link.brand:
                first_brand_name = b_link.brand.name_normalized
                first_brand_id = str(b_link.brand.id)

        writer.writerow([
            p.id,
            p.name_normalized,
            first_brand_name,
            p.created_by_user_id,
            p.updated_by_user_id or "NULL",
            _format_val(p.created_at),
            _format_val(p.updated_at),
            _format_val(p.deleted_at),
            first_brand_id,
        ])
    csv_contents["shopping_products.csv"] = out.getvalue()
    counts["shopping_products"] = len(products)

    # 6. shopping_product_brands.csv (id;product_id;brand_id;notes;created_at;updated_at) -> 7° FILE PONTE
    product_brands = (
        db.query(ShoppingProductBrand)
        .join(ShoppingProduct, ShoppingProductBrand.product_id == ShoppingProduct.id)
        .filter(ShoppingProduct.deleted_at.is_(None))
        .order_by(ShoppingProductBrand.id.asc())
        .all()
    )
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow(["id", "product_id", "brand_id", "notes", "created_at", "updated_at"])
    for pb in product_brands:
        writer.writerow([
            pb.id,
            pb.product_id,
            pb.brand_id,
            pb.notes or "",
            _format_val(pb.created_at),
            _format_val(pb.updated_at),
        ])
    csv_contents["shopping_product_brands.csv"] = out.getvalue()
    counts["shopping_product_brands"] = len(product_brands)

    # 7. inventory_batch.csv
    batches = (
        db.query(InventoryBatch)
        .filter(InventoryBatch.deleted_at.is_(None))
        .order_by(InventoryBatch.id.asc())
        .all()
    )
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\n")
    writer.writerow([
        "id", "product_id", "list_item_id", "purchase_date", "quantity_purchased",
        "purchase_price", "supplier_id", "is_on_sale", "expiration_date",
        "created_by_user_id", "updated_by_user_id", "purchased_by_user_id",
        "deleted_by_user_id", "created_at", "updated_at", "deleted_at"
    ])
    for b in batches:
        writer.writerow([
            b.id,
            b.product_id,
            b.list_item_id or 0,
            _format_val(b.purchase_date),
            _format_quantity(b.quantity_purchased),
            _format_price(b.purchase_price),
            b.supplier_id or "NULL",
            "t" if b.is_on_sale else "f",
            _format_val(b.expiration_date),
            b.created_by_user_id or 1,
            b.updated_by_user_id or "NULL",
            b.purchased_by_user_id or (b.created_by_user_id or 1),
            b.deleted_by_user_id or "NULL",
            _format_val(b.created_at),
            _format_val(b.updated_at),
            _format_val(b.deleted_at),
        ])
    csv_contents["inventory_batch.csv"] = out.getvalue()
    counts["inventory_batch"] = len(batches)

    # Scrittura su filesystem (utf-8-sig) sia in backend/seeds che nello snapshot su NAS
    for fname, content in csv_contents.items():
        # Scrivi in seeds/
        target_seed_file = SEEDS_DIR / fname
        with open(target_seed_file, "w", encoding="utf-8-sig") as f:
            f.write(content)

        # Scrivi nello snapshot su NAS
        target_snapshot_file = snapshot_dir / fname
        with open(target_snapshot_file, "w", encoding="utf-8-sig") as f:
            f.write(content)

    # Genera anche uno zip compresso nello snapshot per facilitare il download immediato
    zip_path = snapshot_dir / f"seeds_{timestamp_str}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname, content in csv_contents.items():
            zf.writestr(fname, content.encode("utf-8-sig"))

    return {
        "timestamp": timestamp_str,
        "counts": counts,
        "seeds_dir": str(SEEDS_DIR),
        "snapshot_dir": str(snapshot_dir),
        "zip_filename": zip_path.name,
    }


def create_seeds_zip_in_memory(db: Session) -> io.BytesIO:
    """Restituisce un archivio ZIP in memoria con i 7 file CSV pronti per il download."""
    # Prima ci assicuriamo che i file siano generati/aggiornati
    res = dump_all_seeds_from_db(db)
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname in [
            "config.csv",
            "config_codes.csv",
            "user_categories.csv",
            "shopping_suppliers.csv",
            "shopping_products.csv",
            "shopping_product_brands.csv",
            "inventory_batch.csv",
        ]:
            fpath = SEEDS_DIR / fname
            if fpath.is_file():
                zf.write(fpath, arcname=fname)
                
    zip_buffer.seek(0)
    return zip_buffer
