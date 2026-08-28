"""
PostgreSQL Sequence Synchronization Utility.

Aggiorna automaticamente le sequenze degli ID (autoincrement) di PostgreSQL
al valore massimo presente nella tabella (MAX(id)), prevenendo errori di
chiave duplicata ('duplicate key value violates unique constraint') dopo
l'esecuzione di seed o inserimenti con ID espliciti.
"""
from __future__ import annotations

import logging
from typing import List, Optional
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Elenco standard delle tabelle relazionali principali del sistema
DEFAULT_SYNC_TABLES: List[str] = [
    "users",
    "user_categories",
    "config_codes",
    "tasks",
    "events",
    "countdowns",
    "habits",
    "habit_periods",
    "habit_logs",
    "daily_entries",
    "monthly_entries",
    "yearly_entries",
    "shopping_groups",
    "shopping_group_members",
    "shopping_lists",
    "shopping_list_items",
    "shopping_suppliers",
    "shopping_products",
    "inventory_batch",
    "notifications",
    "shared_activity_log",
    "system_metadata",
    "bingo_cards",
]


def sync_table_id_sequence(db: Session, table_name: str, id_column: str = "id") -> bool:
    """
    Sincronizza la sequenza PostgreSQL associata alla colonna specificata.
    Ritorna True se eseguito con successo su PostgreSQL, False altrimenti.
    """
    bind = db.get_bind()
    if bind.dialect.name != "postgresql":
        return False

    try:
        with db.begin_nested():
            seq_name = db.execute(
                text("SELECT pg_get_serial_sequence(:table_name, :id_column)"),
                {"table_name": table_name, "id_column": id_column}
            ).scalar()
            if not seq_name:
                return False

            query = text(f"""
                SELECT setval(
                    :seq_name,
                    COALESCE((SELECT MAX({id_column}) FROM {table_name}), 1),
                    (SELECT MAX({id_column}) IS NOT NULL FROM {table_name})
                )
            """)
            db.execute(query, {"seq_name": seq_name})
        return True
    except Exception as exc:
        logger.debug("Sincronizzazione sequenza per %s non applicabile: %s", table_name, exc)
        return False


def sync_all_table_sequences(db: Session, table_names: Optional[List[str]] = None) -> int:
    """
    Sincronizza le sequenze di tutte le tabelle fornite (o della lista di default).
    Ritorna il numero di tabelle sincronizzate con successo.
    """
    bind = db.get_bind()
    if bind.dialect.name != "postgresql":
        return 0

    tables = table_names or DEFAULT_SYNC_TABLES
    synced_count = 0

    for table in tables:
        if sync_table_id_sequence(db, table):
            synced_count += 1

    return synced_count
