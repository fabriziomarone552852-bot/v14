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
    import backend.domains.feedback.models  # noqa: F401
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
    import backend.domains.social.models  # noqa: F401

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
            """
            CREATE TABLE IF NOT EXISTS shopping_product_brands (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES shopping_products(id) ON DELETE CASCADE,
                brand_id INTEGER NOT NULL REFERENCES shopping_suppliers(id) ON DELETE CASCADE,
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                CONSTRAINT uq_shopping_product_brands UNIQUE (product_id, brand_id)
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_shopping_product_brands_product_id ON shopping_product_brands(product_id);",
            "CREATE INDEX IF NOT EXISTS ix_shopping_product_brands_brand_id ON shopping_product_brands(brand_id);",
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'shopping_products' AND column_name = 'brand_id'
                ) THEN
                    INSERT INTO shopping_product_brands (product_id, brand_id, created_at)
                    SELECT id, brand_id, NOW()
                    FROM shopping_products
                    WHERE brand_id IS NOT NULL
                    ON CONFLICT DO NOTHING;
                END IF;
            END $$;
            """,
            "ALTER TABLE shopping_products DROP COLUMN IF EXISTS brand_id CASCADE;",
            """
            DO $$
            DECLARE
                rec RECORD;
                canonical_id INTEGER;
            BEGIN
                -- Deduplicazione e compattazione dei record multipli in shopping_products
                FOR rec IN (
                    SELECT name_normalized, MIN(id) AS min_id, ARRAY_AGG(id ORDER BY id) AS all_ids
                    FROM shopping_products
                    GROUP BY name_normalized
                    HAVING COUNT(*) > 1
                ) LOOP
                    canonical_id := rec.min_id;

                    -- 1. Unisci i brand collegati evitando duplicati (product_id, brand_id)
                    INSERT INTO shopping_product_brands (product_id, brand_id, notes, created_at, updated_at)
                    SELECT canonical_id, spb.brand_id, spb.notes, spb.created_at, spb.updated_at
                    FROM shopping_product_brands spb
                    WHERE spb.product_id = ANY(rec.all_ids)
                      AND spb.product_id != canonical_id
                    ON CONFLICT (product_id, brand_id) DO NOTHING;

                    -- Cancella i legami dei duplicati
                    DELETE FROM shopping_product_brands
                    WHERE product_id = ANY(rec.all_ids)
                      AND product_id != canonical_id;

                    -- 2. Riassegna shopping_list_items al canonical_id
                    UPDATE shopping_list_items
                    SET product_id = canonical_id
                    WHERE product_id = ANY(rec.all_ids)
                      AND product_id != canonical_id;

                    -- 3. Riassegna inventory_batch al canonical_id
                    UPDATE inventory_batch
                    SET product_id = canonical_id
                    WHERE product_id = ANY(rec.all_ids)
                      AND product_id != canonical_id;

                    -- 4. Elimina i record prodotto duplicati
                    DELETE FROM shopping_products
                    WHERE id = ANY(rec.all_ids)
                      AND id != canonical_id;
                END LOOP;
            END $$;
            """,
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_shopping_products_name_normalized ON shopping_products(name_normalized);",
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
            """
            CREATE TABLE IF NOT EXISTS feedback_reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                report_type VARCHAR(50) NOT NULL DEFAULT 'bug',
                severity VARCHAR(20) NOT NULL DEFAULT 'medium',
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                steps_to_reproduce TEXT,
                app_version VARCHAR(30) NOT NULL,
                platform VARCHAR(50) NOT NULL,
                current_route VARCHAR(255) NOT NULL,
                error_context TEXT,
                screenshot_url VARCHAR(500),
                status VARCHAR(20) NOT NULL DEFAULT 'new',
                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                resolved_at TIMESTAMP WITH TIME ZONE
            );
            """,
            "CREATE INDEX IF NOT EXISTS ix_feedback_reports_user_id ON feedback_reports(user_id);",
            "CREATE INDEX IF NOT EXISTS ix_feedback_reports_status ON feedback_reports(status);",
            "CREATE INDEX IF NOT EXISTS ix_feedback_reports_created_at ON feedback_reports(created_at DESC);",
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