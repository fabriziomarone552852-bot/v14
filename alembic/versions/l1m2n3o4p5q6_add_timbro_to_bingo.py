"""add timbro to bingo

Revision ID: l1m2n3o4p5q6
Revises: k0l1m2n3o4p5
Create Date: 2026-09-14 10:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'l1m2n3o4p5q6'
down_revision: Union[str, Sequence[str], None] = 'k0l1m2n3o4p5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE bingo ADD COLUMN IF NOT EXISTS timbro TEXT")


def downgrade() -> None:
    op.drop_column('bingo', 'timbro')
