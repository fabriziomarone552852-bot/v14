"""add rotazione to bingo

Revision ID: d3e4f5g6h7i8
Revises: c1d2e3f4g5h6
Create Date: 2026-08-15 11:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'd3e4f5g6h7i8'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4g5h6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute("ALTER TABLE bingo ADD COLUMN IF NOT EXISTS rotazione INTEGER")

def downgrade() -> None:
    op.drop_column('bingo', 'rotazione')

