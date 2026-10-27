"""add movie tracker domain and extend media lists

Revision ID: e1f2a3b4c5d6
Revises: d5e6f7a8b9c0
Create Date: 2026-10-24 09:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd5e6f7a8b9c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    # 1. Tabella tmdb_movies
    if "tmdb_movies" not in existing_tables:
        op.create_table(
            "tmdb_movies",
            sa.Column("tmdb_id", sa.Integer(), primary_key=True, autoincrement=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("original_title", sa.String(length=255), nullable=True),
            sa.Column("overview", sa.Text(), nullable=True),
            sa.Column("poster_path", sa.String(length=255), nullable=True),
            sa.Column("backdrop_path", sa.String(length=255), nullable=True),
            sa.Column("genres", sa.String(length=255), nullable=True),
            sa.Column("runtime", sa.Integer(), nullable=True),
            sa.Column("release_date", sa.Date(), nullable=True),
            sa.Column("italy_release_date", sa.Date(), nullable=True),
            sa.Column("vote_average", sa.Float(), nullable=True),
            sa.Column("collection_id", sa.Integer(), nullable=True),
            sa.Column("collection_name", sa.String(length=255), nullable=True),
            sa.Column("collection_poster_path", sa.String(length=255), nullable=True),
            sa.Column("collection_backdrop_path", sa.String(length=255), nullable=True),
            sa.Column(
                "last_sync_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.func.now(),
            ),
        )
        op.create_index("ix_tmdb_movies_collection_id", "tmdb_movies", ["collection_id"], if_not_exists=True)

    # 2. Tabella user_movie_tracking
    if "user_movie_tracking" not in existing_tables:
        op.create_table(
            "user_movie_tracking",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("movie_tmdb_id", sa.Integer(), sa.ForeignKey("tmdb_movies.tmdb_id", ondelete="CASCADE"), nullable=False),
            sa.Column("status", sa.String(length=50), nullable=False, server_default="to_watch"),
            sa.Column("custom_poster_path", sa.String(length=255), nullable=True),
            sa.Column("custom_backdrop_path", sa.String(length=255), nullable=True),
            sa.Column("is_rewatching", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("added_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.UniqueConstraint("user_id", "movie_tmdb_id", name="ux_user_movie_tracking"),
        )
        op.create_index("ix_user_movie_tracking_user_id", "user_movie_tracking", ["user_id"], if_not_exists=True)
        op.create_index("ix_user_movie_tracking_movie_tmdb_id", "user_movie_tracking", ["movie_tmdb_id"], if_not_exists=True)
        op.create_index("ix_user_movie_tracking_status", "user_movie_tracking", ["status"], if_not_exists=True)

    # 3. Tabella movie_user_logs
    if "movie_user_logs" not in existing_tables:
        op.create_table(
            "movie_user_logs",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("movie_tmdb_id", sa.Integer(), sa.ForeignKey("tmdb_movies.tmdb_id", ondelete="CASCADE"), nullable=False),
            sa.Column("rating", sa.Float(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("review_visibility", sa.String(length=50), nullable=False, server_default="friends_only"),
            sa.Column("viewing_platform_id", sa.Integer(), sa.ForeignKey("tv_user_platforms.id", ondelete="SET NULL"), nullable=True),
            sa.Column("watched_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_movie_user_logs_user_id", "movie_user_logs", ["user_id"], if_not_exists=True)
        op.create_index("ix_movie_user_logs_movie_tmdb_id", "movie_user_logs", ["movie_tmdb_id"], if_not_exists=True)

    # 4. Tabella tracker_movie_quotes
    if "tracker_movie_quotes" not in existing_tables:
        op.create_table(
            "tracker_movie_quotes",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("movie_tmdb_id", sa.Integer(), sa.ForeignKey("tmdb_movies.tmdb_id", ondelete="CASCADE"), nullable=False),
            sa.Column("quote_text", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index("ix_tracker_movie_quotes_user_id", "tracker_movie_quotes", ["user_id"], if_not_exists=True)
        op.create_index("ix_tracker_movie_quotes_movie_tmdb_id", "tracker_movie_quotes", ["movie_tmdb_id"], if_not_exists=True)

    # 5. Estensione media_list_items per Liste Miste (Film e Serie TV)
    if "media_list_items" in existing_tables:
        media_cols = {c["name"] for c in inspector.get_columns("media_list_items")}
        if "movie_tmdb_id" not in media_cols:
            op.add_column(
                "media_list_items",
                sa.Column("movie_tmdb_id", sa.Integer(), sa.ForeignKey("tmdb_movies.tmdb_id", ondelete="CASCADE"), nullable=True),
            )
            op.create_index("ix_media_list_items_movie_tmdb_id", "media_list_items", ["movie_tmdb_id"], if_not_exists=True)
        if "media_type" not in media_cols:
            op.add_column(
                "media_list_items",
                sa.Column("media_type", sa.String(length=20), nullable=False, server_default="tv"),
            )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "media_list_items" in existing_tables:
        media_cols = {c["name"] for c in inspector.get_columns("media_list_items")}
        if "movie_tmdb_id" in media_cols:
            op.drop_index("ix_media_list_items_movie_tmdb_id", table_name="media_list_items", if_exists=True)
            op.drop_column("media_list_items", "movie_tmdb_id")
        if "media_type" in media_cols:
            op.drop_column("media_list_items", "media_type")

    if "tracker_movie_quotes" in existing_tables:
        op.drop_index("ix_tracker_movie_quotes_movie_tmdb_id", table_name="tracker_movie_quotes", if_exists=True)
        op.drop_index("ix_tracker_movie_quotes_user_id", table_name="tracker_movie_quotes", if_exists=True)
        op.drop_table("tracker_movie_quotes", if_exists=True)

    if "movie_user_logs" in existing_tables:
        op.drop_index("ix_movie_user_logs_movie_tmdb_id", table_name="movie_user_logs", if_exists=True)
        op.drop_index("ix_movie_user_logs_user_id", table_name="movie_user_logs", if_exists=True)
        op.drop_table("movie_user_logs", if_exists=True)

    if "user_movie_tracking" in existing_tables:
        op.drop_index("ix_user_movie_tracking_status", table_name="user_movie_tracking", if_exists=True)
        op.drop_index("ix_user_movie_tracking_movie_tmdb_id", table_name="user_movie_tracking", if_exists=True)
        op.drop_index("ix_user_movie_tracking_user_id", table_name="user_movie_tracking", if_exists=True)
        op.drop_table("user_movie_tracking", if_exists=True)

    if "tmdb_movies" in existing_tables:
        op.drop_index("ix_tmdb_movies_collection_id", table_name="tmdb_movies", if_exists=True)
        op.drop_table("tmdb_movies", if_exists=True)
