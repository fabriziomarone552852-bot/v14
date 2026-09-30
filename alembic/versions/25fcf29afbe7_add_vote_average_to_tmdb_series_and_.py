"""Add vote_average to tmdb_series and tmdb_episodes

Revision ID: 25fcf29afbe7
Revises: 4f099aed880c
Create Date: 2026-09-30 16:48:41.222414

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25fcf29afbe7'
down_revision: Union[str, Sequence[str], None] = '4f099aed880c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('tmdb_series', sa.Column('vote_average', sa.Float(), nullable=True))
    op.add_column('tmdb_episodes', sa.Column('vote_average', sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('tmdb_episodes', 'vote_average')
    op.drop_column('tmdb_series', 'vote_average')
