"""Merge heads

Revision ID: bb7c81e3047f
Revises: 9887b53d6bfe, n3o4p5q6r7s8
Create Date: 2026-10-09 23:12:35.828148

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bb7c81e3047f'
down_revision: Union[str, Sequence[str], None] = ('9887b53d6bfe', 'n3o4p5q6r7s8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
