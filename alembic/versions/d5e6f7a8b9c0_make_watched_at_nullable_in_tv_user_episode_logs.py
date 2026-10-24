"""make watched_at nullable in tv_user_episode_logs

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-10-23

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd5e6f7a8b9c0'
down_revision = 'c4d5e6f7a8b9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c['name']: c for c in inspector.get_columns('tv_user_episode_logs')}

    if 'watched_at' in cols and not cols['watched_at']['nullable']:
        op.alter_column(
            'tv_user_episode_logs',
            'watched_at',
            existing_type=sa.DateTime(timezone=True),
            nullable=True
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = {c['name']: c for c in inspector.get_columns('tv_user_episode_logs')}

    if 'watched_at' in cols and cols['watched_at']['nullable']:
        # Riempie eventuali NULL prima di rimettere NOT NULL
        op.execute("UPDATE tv_user_episode_logs SET watched_at = NOW() WHERE watched_at IS NULL")
        op.alter_column(
            'tv_user_episode_logs',
            'watched_at',
            existing_type=sa.DateTime(timezone=True),
            nullable=False
        )
