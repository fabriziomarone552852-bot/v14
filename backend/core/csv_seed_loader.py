"""
CSV Seed Loader.

Utility per caricare i dati di seed predefiniti direttamente dai file CSV
presenti nella cartella `backend/seeds/`.
"""
from __future__ import annotations

import csv
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Optional

SEEDS_DIR = Path(__file__).resolve().parent.parent / "seeds"


def _read_csv(filename: str) -> List[Dict[str, str]]:
    """Legge un file CSV con delimitatore ';' e codifica UTF-8/UTF-8-SIG (case-insensitive filename)."""
    file_path = SEEDS_DIR / filename
    if not file_path.is_file():
        # Prova varianti maiuscole/minuscole
        candidates = list(SEEDS_DIR.glob("*"))
        matched = next((c for c in candidates if c.name.lower() == filename.lower()), None)
        if matched and matched.is_file():
            file_path = matched
        else:
            return []

    rows: List[Dict[str, str]] = []
    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            rows.append({k.strip(): (v.strip() if v else "") for k, v in row.items() if k})
    return rows


def _parse_int(val: Optional[str]) -> Optional[int]:
    if not val or val.upper() in ("NULL", "NONE", ""):
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _parse_int_nonzero(val: Optional[str]) -> Optional[int]:
    parsed = _parse_int(val)
    if parsed == 0:
        return None
    return parsed


def _parse_decimal(val: Optional[str]) -> Optional[Decimal]:
    if not val or val.upper() in ("NULL", "NONE", ""):
        return None
    cleaned = str(val).replace(",", ".").strip()
    try:
        return Decimal(cleaned)
    except Exception:
        return None


def _parse_bool(val: Optional[str]) -> bool:
    if not val:
        return False
    return str(val).strip().lower() in ("t", "true", "1", "yes", "si", "sì")


def _parse_date(val: Optional[str]) -> Optional[date]:
    if not val or val.upper() in ("NULL", "NONE", ""):
        return None
    s = str(val).strip()
    # Formato DD/MM/YYYY o YYYY-MM-DD
    for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y %H:%M"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    return None


def _parse_datetime(val: Optional[str]) -> Optional[datetime]:
    if not val or val.upper() in ("NULL", "NONE", ""):
        return None
    s = str(val).strip()
    for fmt in (
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(s, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return None


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




def load_seed_shopping_suppliers() -> List[Dict[str, Any]]:
    """
    Carica i negozi e brand da shopping_suppliers.csv.
    Campi: id, name_normalized, type_code (1=Fornitore, 2=Brand, 3=Entrambi), status_id, created_by_user_id, created_at.
    """
    rows = _read_csv("shopping_suppliers.csv")
    suppliers: List[Dict[str, Any]] = []
    for r in rows:
        sid = _parse_int(r.get("id"))
        name = r.get("name_normalized", "").strip().lower()
        if not name:
            continue

        type_code = _parse_int(r.get("type_code")) or 1
        status_id = _parse_int(r.get("status_id"))
        created_by = _parse_int(r.get("created_by_user_id")) or 1
        created_at = _parse_datetime(r.get("created_at")) or datetime.now(timezone.utc)

        suppliers.append({
            "id": sid,
            "name_normalized": name,
            "type_code": type_code,
            "status_id": status_id,
            "created_by_user_id": created_by,
            "created_at": created_at,
        })
    return suppliers


def load_seed_suppliers() -> List[str]:
    """
    Ritorna la lista dei nomi dei negozi/fornitori (type_code 1 o 3)
    letta da shopping_suppliers.csv per la retrocompatibilità.
    """
    suppliers = load_seed_shopping_suppliers()
    if suppliers:
        return [s["name_normalized"] for s in suppliers if s["type_code"] in (1, 3)]
    return ["coop", "carni e affini", "md", "lidl", "eurospin", "famila"]


def load_seed_shopping_products() -> List[Dict[str, Any]]:
    """
    Carica i prodotti da shopping_products.csv.
    Risolve il brand da brand_id2 (se numerico) o brand_id (nome testuale del marchio).
    """
    rows = _read_csv("shopping_products.csv")
    products: List[Dict[str, Any]] = []
    for r in rows:
        pid = _parse_int(r.get("id"))
        name = r.get("name_normalized", "").strip().lower()
        if not name:
            continue

        # brand_id numerico da brand_id2 o brand_id
        numeric_brand_id = _parse_int_nonzero(r.get("brand_id2")) or _parse_int_nonzero(r.get("brand_id"))
        brand_name_text = r.get("brand_id", "").strip().lower() if not _parse_int(r.get("brand_id")) else ""
        created_by = _parse_int(r.get("created_by_user_id")) or 1
        created_at = _parse_datetime(r.get("created_at")) or datetime.now(timezone.utc)

        products.append({
            "id": pid,
            "name_normalized": name,
            "brand_id": numeric_brand_id,
            "brand_name_text": brand_name_text,
            "created_by_user_id": created_by,
            "created_at": created_at,
        })
    return products


def load_seed_inventory_batches() -> List[Dict[str, Any]]:
    """
    Carica i lotti d'acquisto e prezzi storici da inventory_batch.csv.
    Converte list_item_id=0 -> None, decimali con virgola e date DD/MM/YYYY.
    """
    rows = _read_csv("inventory_batch.csv")
    batches: List[Dict[str, Any]] = []
    for r in rows:
        bid = _parse_int(r.get("id"))
        product_id = _parse_int(r.get("product_id"))
        if not product_id:
            continue

        list_item_id = _parse_int_nonzero(r.get("list_item_id"))
        purchase_date = _parse_date(r.get("purchase_date")) or date.today()
        quantity_purchased = _parse_decimal(r.get("quantity_purchased")) or Decimal("1")
        purchase_price = _parse_decimal(r.get("purchase_price")) or Decimal("0")
        supplier_id = _parse_int_nonzero(r.get("supplier_id"))
        is_on_sale = _parse_bool(r.get("is_on_sale"))
        expiration_date = _parse_date(r.get("expiration_date"))
        created_by = _parse_int(r.get("created_by_user_id")) or 1
        purchased_by = _parse_int(r.get("purchased_by_user_id")) or created_by
        created_at = _parse_date(r.get("created_at")) or purchase_date
        updated_at = _parse_date(r.get("updated_at")) or created_at

        batches.append({
            "id": bid,
            "product_id": product_id,
            "list_item_id": list_item_id,
            "purchase_date": purchase_date,
            "quantity_purchased": quantity_purchased,
            "purchase_price": purchase_price,
            "supplier_id": supplier_id,
            "is_on_sale": is_on_sale,
            "expiration_date": expiration_date,
            "created_by_user_id": created_by,
            "purchased_by_user_id": purchased_by,
            "created_at": created_at,
            "updated_at": updated_at,
        })
    return batches
