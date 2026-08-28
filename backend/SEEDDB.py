"""
SEEDDB.py — inserimento dati iniziali.

Uso:
    python -m backend.SEEDDB --env dev
    python -m backend.SEEDDB --env test
    python -m backend.SEEDDB --env prod
    python -m backend.SEEDDB             # menu interattivo
"""
from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence

from dotenv import dotenv_values
from sqlalchemy import or_, text

from backend.core.env import BACKEND_DIR
from backend.core.database import build_engine, build_session_factory
from backend.core.models import import_all_models
from backend.core.deps import get_password_hash
from backend.domains.categories.models import UserCategory
from backend.domains.config import Config, ConfigCode
from backend.domains.shopping.models import InventoryBatch, ShoppingProduct, ShoppingSupplier
from backend.domains.users.models import User


VALID_ENVS = ("dev", "test", "prod")


def _parse_args() -> str | None:
    parser = argparse.ArgumentParser(
        description="Seed dei dati iniziali per l'ambiente selezionato.",
    )
    parser.add_argument(
        "--env",
        choices=VALID_ENVS,
        metavar="{dev|test|prod}",
        help="Ambiente target: dev, test oppure prod.",
    )
    args, _ = parser.parse_known_args()
    return args.env


def _pick_env_interactive() -> str:
    print("\n╔══════════════════════════════════════════════════════════════╗")
    print("║         SEEDDB — Selezione ambiente target                  ║")
    print("╠══════════════════════════════════════════════════════════════╣")
    print("║  [1] dev                                                   ║")
    print("║  [2] test                                                  ║")
    print("║  [3] prod                                                  ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    while True:
        raw = input("\n  Scegli (1/2/3) oppure digita 'dev'/'test'/'prod': ").strip().lower()
        if raw in VALID_ENVS:
            return raw
        if raw in ("1", "2", "3"):
            return VALID_ENVS[int(raw) - 1]
        print(f"  ✗ Valore non valido. Ammessi: {', '.join(VALID_ENVS)} oppure 1/2/3.")


def _confirm_prod() -> bool:
    print("\n  ⚠️  Stai per eseguire il seed sul database di PRODUZIONE.")
    answer = input("     Digita 'PROD' per confermare: ").strip()
    return answer == "PROD"


def _load_env_values(target_env: str) -> dict[str, str]:
    env_file = BACKEND_DIR / f".env.{target_env}"

    if not env_file.is_file():
        print(f"\n  ✗ File '{env_file}' non trovato.")
        sys.exit(1)

    env_values = {
        key: value
        for key, value in dotenv_values(env_file).items()
        if value is not None
    }

    database_url = str(env_values.get("DATABASE_URL", "")).strip()
    if not database_url:
        print(f"\n  ✗ DATABASE_URL non trovata in '{env_file.name}'.")
        sys.exit(1)

    return env_values


def _get_default_max_subtask_depth(env_values: dict[str, str]) -> int:
    raw = env_values.get("DEFAULT_MAX_SUBTASK_DEPTH", "10")
    try:
        return int(str(raw).strip())
    except (TypeError, ValueError):
        print(f"\n  ✗ DEFAULT_MAX_SUBTASK_DEPTH non valido: {raw!r}")
        sys.exit(1)


from backend.core.csv_seed_loader import (
    load_seed_config_codes,
    load_seed_configs,
    load_seed_inventory_batches,
    load_seed_shopping_products,
    load_seed_shopping_suppliers,
    load_seed_user_categories,
    load_seed_users,
)
from backend.core.sequence_sync import sync_all_table_sequences, sync_table_id_sequence


def _build_password_hash(password: str) -> str:
    return get_password_hash(password)


def _find_existing_user(db, payload: dict) -> User | None:
    normalized_username = payload["username"].strip().lower()
    normalized_email = payload["email"].strip().lower()

    user = db.query(User).filter(User.id == payload["id"]).first()
    if user is not None:
        return user

    return (
        db.query(User)
        .filter(
            or_(
                User.username == normalized_username,
                User.email == normalized_email,
            )
        )
        .first()
    )


def _insert_default_user_if_missing(db, payload: dict) -> User:
    existing = _find_existing_user(db, payload)
    if existing is not None:
        return existing

    user = User(
        id=payload["id"],
        username=payload["username"].strip().lower(),
        email=payload["email"].strip().lower(),
        password_hash=_build_password_hash(payload["password"]),
        max_subtask_depth_user=payload["max_subtask_depth_user"],
        is_superuser=payload.get("is_superuser", False),
        must_change_password=payload.get("must_change_password", False),
    )
    db.add(user)
    db.flush()
    return user


def _seed_default_users(db, default_users: Sequence[dict]) -> list[User]:
    users: list[User] = []
    for payload in default_users:
        users.append(_insert_default_user_if_missing(db, payload))
    db.flush()
    return users


def _seed_default_user_categories_for_user(db, user_id: int) -> int:
    inserted = 0
    categories = load_seed_user_categories()

    for item in categories:
        normalized_category_name = item["category_name"].strip().lower()

        existing = (
            db.query(UserCategory)
            .filter(
                UserCategory.user_id == user_id,
                UserCategory.category_name == normalized_category_name,
            )
            .first()
        )
        if existing is not None:
            continue

        db.add(
            UserCategory(
                user_id=user_id,
                category_name=normalized_category_name,
                colore=item["colore"],
                genre=item["genre"],
            )
        )
        db.flush()
        inserted += 1

    return inserted


def _seed_default_user_categories(db, users: Sequence[User]) -> dict[int, int]:
    inserted_by_user: dict[int, int] = {}
    for user in users:
        inserted_by_user[user.id] = _seed_default_user_categories_for_user(db, user.id)
    return inserted_by_user


def _ensure_config(db, default_max_subtask_depth: int) -> bool:
    inserted = False
    configs = load_seed_configs()

    for cfg in configs:
        key = cfg["key"]
        existing = db.query(Config).filter(Config.key == key).first()
        if existing is None:
            val = cfg["value"]
            if key == "max_subtask_depth":
                val = str(default_max_subtask_depth)
            db.add(
                Config(
                    key=key,
                    value=val,
                    descrizione=cfg.get("descrizione", ""),
                )
            )
            inserted = True

    if inserted:
        db.flush()
    return inserted


def _seed_config_codes(db) -> dict[tuple[str, str], int]:
    code_ids: dict[tuple[str, str], int] = {}
    codes = load_seed_config_codes()

    for code in codes:
        payload = {"sort_order": None, **code}

        existing = (
            db.query(ConfigCode)
            .filter(
                ConfigCode.code_type == payload["code_type"],
                ConfigCode.code_value == payload["code_value"],
            )
            .first()
        )

        if existing is not None:
            code_ids[(existing.code_type, existing.code_value)] = existing.id
            continue

        obj = ConfigCode(**payload)
        db.add(obj)
        db.flush()
        code_ids[(obj.code_type, obj.code_value)] = obj.id

    return code_ids


def _get_code_id(code_ids: dict[tuple[str, str], int], code_type: str, code_value: str) -> int:
    key = (code_type, code_value)
    if key not in code_ids:
        raise RuntimeError(f"ConfigCode mancante: {code_type}.{code_value}")
    return code_ids[key]


def _seed_shopping_suppliers(db, supplier_status_id: int, fallback_user_id: int) -> tuple[dict[str, int], int]:
    """Popola tutti i negozi e marchi da shopping_suppliers.csv mantenendo gli ID."""
    suppliers_data = load_seed_shopping_suppliers()
    suppliers_by_name: dict[str, int] = {}
    inserted = 0

    for item in suppliers_data:
        normalized = item["name_normalized"]
        existing = db.query(ShoppingSupplier).filter(
            or_(
                ShoppingSupplier.id == item["id"],
                ShoppingSupplier.name_normalized == normalized,
            )
        ).first()

        if existing is not None:
            suppliers_by_name[normalized] = existing.id
            continue

        obj = ShoppingSupplier(
            id=item["id"],
            name_normalized=normalized,
            type_code=item["type_code"],
            status_id=supplier_status_id,
            created_by_user_id=item.get("created_by_user_id") or fallback_user_id,
            created_at=item.get("created_at"),
        )
        db.add(obj)
        db.flush()
        suppliers_by_name[normalized] = obj.id
        inserted += 1

    return suppliers_by_name, inserted


def _seed_shopping_products(db, suppliers_by_name: dict[str, int], fallback_user_id: int) -> int:
    """Popola i prodotti da shopping_products.csv collegandoli ai marchi corretti."""
    products_data = load_seed_shopping_products()
    inserted = 0

    for item in products_data:
        normalized = item["name_normalized"]
        existing = db.query(ShoppingProduct).filter(
            or_(
                ShoppingProduct.id == item["id"],
                ShoppingProduct.name_normalized == normalized,
            )
        ).first()

        if existing is not None:
            continue

        # Risoluzione brand_id
        brand_id = item.get("brand_id")
        if not brand_id and item.get("brand_name_text"):
            brand_id = suppliers_by_name.get(item["brand_name_text"])

        obj = ShoppingProduct(
            id=item["id"],
            name_normalized=normalized,
            brand_id=brand_id,
            created_by_user_id=item.get("created_by_user_id") or fallback_user_id,
            created_at=item.get("created_at"),
        )
        db.add(obj)
        db.flush()
        inserted += 1

    return inserted


def _seed_inventory_batches(db, fallback_user_id: int) -> int:
    """Popola i lotti di spesa e lo storico prezzi da inventory_batch.csv."""
    batches_data = load_seed_inventory_batches()
    inserted = 0

    for item in batches_data:
        existing = db.query(InventoryBatch).filter(InventoryBatch.id == item["id"]).first()
        if existing is not None:
            continue

        obj = InventoryBatch(
            id=item["id"],
            product_id=item["product_id"],
            list_item_id=item["list_item_id"],
            purchase_date=item["purchase_date"],
            quantity_purchased=item["quantity_purchased"],
            purchase_price=item["purchase_price"],
            supplier_id=item["supplier_id"],
            is_on_sale=item["is_on_sale"],
            expiration_date=item["expiration_date"],
            created_by_user_id=item.get("created_by_user_id") or fallback_user_id,
            purchased_by_user_id=item.get("purchased_by_user_id") or fallback_user_id,
            created_at=item.get("created_at"),
            updated_at=item.get("updated_at"),
        )
        db.add(obj)
        db.flush()
        inserted += 1

    return inserted


def seed_database(
    session_factory,
    env_values: dict[str, str],
) -> None:
    """
    session_factory: factory SQLAlchemy esplicita per il DB target.
    env_values: valori letti deterministicamente da .env.<env>.
    """
    default_max_subtask_depth = _get_default_max_subtask_depth(env_values)
    default_users = load_seed_users(default_max_subtask_depth)

    print("=" * 70)
    print("AVVIO SEED DATI INIZIALI (Smart Agenda API)")
    print("=" * 70)

    import_all_models()

    db = session_factory()
    try:
        print("[1/7] Verifica o creazione utenti di default (da users.csv)...")
        seed_users = _seed_default_users(db, default_users)
        db.commit()
        sync_table_id_sequence(db, "users")
        db.commit()

        for user in seed_users:
            db.refresh(user)
            print(
                f"-> Utente pronto: id={user.id}, "
                f"username={user.username}, email={user.email}, "
                f"is_superuser={user.is_superuser}, "
                f"must_change_password={user.must_change_password}"
            )

        seed_owner = seed_users[0]

        print("[2/7] Seed user_categories di default (da user_categories.csv)...")
        inserted_user_categories = _seed_default_user_categories(db, seed_users)
        db.commit()
        for user in seed_users:
            print(
                f"-> User categories inserite per {user.username}: "
                f"{inserted_user_categories.get(user.id, 0)}."
            )

        print("[3/7] Seed configurazioni amministrative di base (da config.csv)...")
        inserted_config = _ensure_config(db, default_max_subtask_depth)
        db.commit()
        print(f"-> Config base inserita: {1 if inserted_config else 0}.")

        print("[4/7] Seed ConfigCode globali (da config_codes.csv)...")
        code_ids = _seed_config_codes(db)
        db.commit()
        print(f"-> ConfigCode disponibili/allineati: {len(code_ids)}.")

        print("[5/7] Seed negozi e marchi shopping (da shopping_suppliers.csv)...")
        supplier_status_id = _get_code_id(code_ids, "supplier_status", "active")
        suppliers_by_name, inserted_suppliers = _seed_shopping_suppliers(
            db=db,
            supplier_status_id=supplier_status_id,
            fallback_user_id=seed_owner.id,
        )
        db.commit()
        print(
            f"-> Negozi e brand inseriti: {inserted_suppliers} (totale attivi: {len(suppliers_by_name)})."
        )

        print("[6/7] Seed catalogo prodotti (da shopping_products.csv)...")
        inserted_products = _seed_shopping_products(
            db=db,
            suppliers_by_name=suppliers_by_name,
            fallback_user_id=seed_owner.id,
        )
        db.commit()
        print(
            f"-> Prodotti inseriti: {inserted_products}."
        )

        print("[7/7] Seed storico acquisti e lotti (da inventory_batch.csv)...")
        inserted_batches = _seed_inventory_batches(
            db=db,
            fallback_user_id=seed_owner.id,
        )
        db.commit()
        print(
            f"-> Lotti acquisto inseriti: {inserted_batches}."
        )

        print("\nSincronizzazione finale di tutte le sequenze e contatori PostgreSQL...")
        synced_count = sync_all_table_sequences(db)
        db.commit()
        print(f"-> Sequenze PostgreSQL sincronizzate: {synced_count} tabelle.")

    except Exception as exc:
        db.rollback()
        print(f"ERROR durante il seed dei dati iniziali: {exc}")
        sys.exit(1)
    finally:
        db.close()

    print("=" * 70)
    print("SEED COMPLETATO CON SUCCESSO! Sistema pronto.")
    print("=" * 70)


if __name__ == "__main__":
    chosen_env = _parse_args()

    if chosen_env is None:
        chosen_env = _pick_env_interactive()

    if chosen_env == "prod" and not _confirm_prod():
        print("\n  Operazione annullata.\n")
        sys.exit(0)

    env_values = _load_env_values(chosen_env)
    database_url = env_values["DATABASE_URL"].strip()
    engine = build_engine(database_url)
    session_factory = build_session_factory(engine)

    try:
        seed_database(session_factory=session_factory, env_values=env_values)
    finally:
        engine.dispose()