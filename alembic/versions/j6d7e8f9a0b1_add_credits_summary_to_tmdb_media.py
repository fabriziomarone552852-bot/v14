"""add credits_summary to tmdb_series and tmdb_movies

Revision ID: j6d7e8f9a0b1
Revises: i5c6d7e8f9a0
Create Date: 2026-11-14 19:55:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'j6d7e8f9a0b1'
down_revision: Union[str, None] = 'i5c6d7e8f9a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    series_columns = [c["name"] for c in inspector.get_columns("tmdb_series")]
    if "credits_summary" not in series_columns:
        op.add_column(
            "tmdb_series",
            sa.Column("credits_summary", sa.JSON(), nullable=True),
        )

    movie_columns = [c["name"] for c in inspector.get_columns("tmdb_movies")]
    if "credits_summary" not in movie_columns:
        op.add_column(
            "tmdb_movies",
            sa.Column("credits_summary", sa.JSON(), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    movie_columns = [c["name"] for c in inspector.get_columns("tmdb_movies")]
    if "credits_summary" in movie_columns:
        op.drop_column("tmdb_movies", "credits_summary")

    series_columns = [c["name"] for c in inspector.get_columns("tmdb_series")]
    if "credits_summary" in series_columns:
        op.drop_column("tmdb_series", "credits_summary")
