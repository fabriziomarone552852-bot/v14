"""Add is_rewatching column to user_series_tracking

Revision ID: d4e5f6a7b8c9
Revises: c2d3e4f5a6b7
Create Date: 2026-10-18 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Aggiunge is_rewatching a user_series_tracking in modo idempotente
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_series_tracking' AND column_name = 'is_rewatching'
            ) THEN
                ALTER TABLE user_series_tracking ADD COLUMN is_rewatching BOOLEAN DEFAULT FALSE NOT NULL;
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_series_tracking' AND column_name = 'is_rewatching'
            ) THEN
                ALTER TABLE user_series_tracking DROP COLUMN IF EXISTS is_rewatching;
            END IF;
        END $$;
    """)
