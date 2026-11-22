"""add tv_user_season_logs table

Revision ID: k7e8f9a0b1c2
Revises: j6d7e8f9a0b1
Create Date: 2026-11-19 19:45:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "k7e8f9a0b1c2"
down_revision: Union[str, None] = "j6d7e8f9a0b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "tv_user_season_logs" not in tables:
        op.create_table(
            "tv_user_season_logs",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column(
                "series_tmdb_id",
                sa.Integer(),
                sa.ForeignKey("tmdb_series.tmdb_id", ondelete="CASCADE"),
                nullable=False,
            ),
            sa.Column("season_number", sa.Integer(), nullable=False),
            sa.Column("rating", sa.Float(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column(
                "review_visibility",
                sa.String(length=50),
                nullable=False,
                server_default="friends_only",
            ),
            sa.Column(
                "viewing_platform_id",
                sa.Integer(),
                sa.ForeignKey("tv_user_platforms.id", ondelete="SET NULL"),
                nullable=True,
            ),
            sa.Column("watched_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("NOW()"),
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("NOW()"),
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    existing_indexes = {
        idx["name"] for idx in inspector.get_indexes("tv_user_season_logs")
    }
    index_specs = [
        ("ix_tv_user_season_logs_id", ["id"]),
        ("ix_tv_user_season_logs_user_id", ["user_id"]),
        ("ix_tv_user_season_logs_series_tmdb_id", ["series_tmdb_id"]),
        ("ix_tv_user_season_logs_season_number", ["season_number"]),
        (
            "ix_tv_user_season_logs_user_series_season",
            ["user_id", "series_tmdb_id", "season_number"],
        ),
    ]
    for idx_name, columns in index_specs:
        if idx_name not in existing_indexes:
            op.create_index(idx_name, "tv_user_season_logs", columns)


def downgrade() -> None:
    for idx_name in [
        "ix_tv_user_season_logs_user_series_season",
        "ix_tv_user_season_logs_season_number",
        "ix_tv_user_season_logs_series_tmdb_id",
        "ix_tv_user_season_logs_user_id",
        "ix_tv_user_season_logs_id",
    ]:
        op.drop_index(idx_name, table_name="tv_user_season_logs", if_exists=True)

    op.drop_table("tv_user_season_logs", if_exists=True)
