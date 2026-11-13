"""add watch_providers and providers_synced_at to tmdb_series

Revision ID: h4c5d6e7f8a9
Revises: g3b4c5d6e7f8
Create Date: 2026-10-29 12:40:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'h4c5d6e7f8a9'
down_revision: Union[str, None] = 'g3b4c5d6e7f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    series_columns = [c["name"] for c in inspector.get_columns("tmdb_series")]
    if "watch_providers" not in series_columns:
        op.add_column(
            "tmdb_series",
            sa.Column("watch_providers", sa.JSON(), nullable=True),
        )
    if "providers_synced_at" not in series_columns:
        op.add_column(
            "tmdb_series",
            sa.Column("providers_synced_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    series_columns = [c["name"] for c in inspector.get_columns("tmdb_series")]
    if "providers_synced_at" in series_columns:
        op.drop_column("tmdb_series", "providers_synced_at")
    if "watch_providers" in series_columns:
        op.drop_column("tmdb_series", "watch_providers")
