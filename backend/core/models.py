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
    import backend.domains.google_calendar.models  # noqa: F401
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

        statements = [
            "ALTER TABLE shopping_suppliers ALTER COLUMN name DROP NOT NULL;",
            "ALTER TABLE shopping_suppliers DROP COLUMN IF EXISTS name;",
            "ALTER TABLE shopping_suppliers ADD COLUMN IF NOT EXISTS type_code INTEGER NOT NULL DEFAULT 1;",
            "CREATE INDEX IF NOT EXISTS ix_shopping_suppliers_type_code ON shopping_suppliers (type_code);",
            "ALTER TABLE shopping_products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES shopping_suppliers(id) ON DELETE SET NULL;",
            "CREATE INDEX IF NOT EXISTS ix_shopping_products_brand_id ON shopping_products (brand_id);",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);",
            "CREATE INDEX IF NOT EXISTS ix_events_google_event_id ON events (google_event_id);",
            """
            CREATE TABLE IF NOT EXISTS user_google_auth (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                google_email VARCHAR(255),
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_expiry TIMESTAMP WITH TIME ZONE,
                sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                calendar_id VARCHAR(255) NOT NULL DEFAULT 'primary',
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_user_google_auth_user_id ON user_google_auth(user_id);",
        ]

        for stmt in statements:
            try:
                with engine.begin() as conn:
                    conn.execute(text(stmt))
            except Exception as stmt_exc:
                logger.debug("Statement compat [%s...] skipped: %s", stmt[:30].strip(), stmt_exc)
    except Exception as exc:
        logger.debug("ensure_database_schema_compat skipped or failed: %s", exc)


__all__ = ["import_all_models", "ensure_database_schema_compat"]