"""add streaming_providers to users and watch_providers to tmdb_movies

Revision ID: g3b4c5d6e7f8
Revises: f2a3b4c5d6e7
Create Date: 2026-10-29 00:05:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'g3b4c5d6e7f8'
down_revision: Union[str, None] = 'f2a3b4c5d6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    user_columns = [c["name"] for c in inspector.get_columns("users")]
    if "streaming_providers" not in user_columns:
        op.add_column(
            "users",
            sa.Column("streaming_providers", sa.JSON(), nullable=True),
        )

    movie_columns = [c["name"] for c in inspector.get_columns("tmdb_movies")]
    if "watch_providers" not in movie_columns:
        op.add_column(
            "tmdb_movies",
            sa.Column("watch_providers", sa.JSON(), nullable=True),
        )
    if "providers_synced_at" not in movie_columns:
        op.add_column(
            "tmdb_movies",
            sa.Column("providers_synced_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    movie_columns = [c["name"] for c in inspector.get_columns("tmdb_movies")]
    if "providers_synced_at" in movie_columns:
        op.drop_column("tmdb_movies", "providers_synced_at")
    if "watch_providers" in movie_columns:
        op.drop_column("tmdb_movies", "watch_providers")

    user_columns = [c["name"] for c in inspector.get_columns("users")]
    if "streaming_providers" in user_columns:
        op.drop_column("users", "streaming_providers")
