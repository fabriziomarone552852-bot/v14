"""Add brand_id column to inventory_batch

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-10-18 08:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Aggiunge brand_id a inventory_batch in modo idempotente
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_batch' AND column_name = 'brand_id'
            ) THEN
                ALTER TABLE inventory_batch ADD COLUMN brand_id BIGINT REFERENCES shopping_suppliers(id) ON DELETE SET NULL;
                CREATE INDEX IF NOT EXISTS ix_inventory_batch_brand_id ON inventory_batch (brand_id);
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'inventory_batch' AND column_name = 'brand_id'
            ) THEN
                DROP INDEX IF EXISTS ix_inventory_batch_brand_id;
                ALTER TABLE inventory_batch DROP COLUMN IF EXISTS brand_id;
            END IF;
        END $$;
    """)
