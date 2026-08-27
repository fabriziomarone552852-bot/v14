"""add google_calendar integration table and google_event_id to events

Revision ID: i8j9k0l1m2n3
Revises: h7i8j9k0l1m2
Create Date: 2026-08-27 11:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'i8j9k0l1m2n3'
down_revision: Union[str, Sequence[str], None] = 'h7i8j9k0l1m2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Aggiunge colonna google_event_id a events
    op.execute("ALTER TABLE events ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_events_google_event_id ON events (google_event_id)")

    # 2. Crea tabella user_google_auth se non esiste
    op.execute("""
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
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_google_auth_user_id ON user_google_auth (user_id)")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS user_google_auth")
    op.execute("DROP INDEX IF EXISTS ix_events_google_event_id")
    op.execute("ALTER TABLE events DROP COLUMN IF EXISTS google_event_id")
