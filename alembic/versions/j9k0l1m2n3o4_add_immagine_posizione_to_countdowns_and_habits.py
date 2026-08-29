"""add immagine_posizione to countdowns and habits

Revision ID: j9k0l1m2n3o4
Revises: i8j9k0l1m2n3
Create Date: 2026-08-29 01:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'j9k0l1m2n3o4'
down_revision: Union[str, Sequence[str], None] = 'i8j9k0l1m2n3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE countdowns ADD COLUMN IF NOT EXISTS immagine_posizione VARCHAR(50)")
    op.execute("ALTER TABLE habits ADD COLUMN IF NOT EXISTS immagine_posizione VARCHAR(50)")


def downgrade() -> None:
    op.execute("ALTER TABLE countdowns DROP COLUMN IF EXISTS immagine_posizione")
    op.execute("ALTER TABLE habits DROP COLUMN IF EXISTS immagine_posizione")
