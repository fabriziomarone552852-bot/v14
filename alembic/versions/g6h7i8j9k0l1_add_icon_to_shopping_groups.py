"""add icon to shopping_groups

Revision ID: g6h7i8j9k0l1
Revises: f5g6h7i8j9k0
Create Date: 2026-08-20 13:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'g6h7i8j9k0l1'
down_revision: Union[str, Sequence[str], None] = 'f5g6h7i8j9k0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE shopping_groups ADD COLUMN IF NOT EXISTS icon VARCHAR(50)")


def downgrade() -> None:
    op.execute("ALTER TABLE shopping_groups DROP COLUMN IF EXISTS icon")
