"""
Central model registry for SQLAlchemy.

Importa esplicitamente tutti i modelli di dominio così che SQLAlchemy
possa risolvere correttamente relationship e mapper string-based.
"""
from __future__ import annotations
import logging

logger = logging.getLogger(__name__)


def import_all_models() -> None:
    import backend.domains.audit.models  # noqa: F401
    import backend.domains.bingo.models  # noqa: F401
    import backend.domains.categories.models  # noqa: F401
    import backend.domains.config.models  # noqa: F401
    import backend.domains.countdowns.models  # noqa: F401
    import backend.domains.events.models  # noqa: F401
    import backend.domains.habits.models  # noqa: F401
    import backend.domains.monthly_entries.models  # noqa: F401
    import backend.domains.notifications.models  # noqa: F401
    import backend.domains.planning.models  # noqa: F401
    import backend.domains.shopping.models  # noqa: F401
    import backend.domains.system_boot.models  # noqa: F401
    import backend.domains.tasks.models  # noqa: F401
    import backend.domains.users.models  # noqa: F401
    import backend.domains.yearly_entries.models  # noqa: F401

    ensure_database_schema_compat()


def ensure_database_schema_compat() -> None:
    """Esegue controlli di compatibilità schema idempotenti all'avvio."""
    try:
        from backend.core.database import engine
        from sqlalchemy import text
        with engine.begin() as conn:
            # Compatibilità shopping_suppliers: rimuove eventuale vincolo not-null o colonna name obsoleta
            try:
                conn.execute(text("ALTER TABLE shopping_suppliers ALTER COLUMN name DROP NOT NULL;"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE shopping_suppliers DROP COLUMN IF EXISTS name;"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE shopping_suppliers ADD COLUMN IF NOT EXISTS type_code INTEGER NOT NULL DEFAULT 1;"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_shopping_suppliers_type_code ON shopping_suppliers (type_code);"))
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE shopping_products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES shopping_suppliers(id) ON DELETE SET NULL;"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS ix_shopping_products_brand_id ON shopping_products (brand_id);"))
            except Exception:
                pass
    except Exception as exc:
        logger.debug("ensure_database_schema_compat skipped or failed: %s", exc)


__all__ = ["import_all_models", "ensure_database_schema_compat"]