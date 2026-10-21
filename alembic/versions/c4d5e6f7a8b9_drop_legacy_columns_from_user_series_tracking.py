"""drop legacy columns from user_series_tracking

Revision ID: c4d5e6f7a8b9
Revises: b3c4d5e6f7a8
Create Date: 2026-10-21

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c4d5e6f7a8b9'
down_revision = 'b3c4d5e6f7a8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns('user_series_tracking')]

    if 'review_visibility' in cols:
        op.drop_column('user_series_tracking', 'review_visibility')

    if 'rating' in cols:
        op.drop_column('user_series_tracking', 'rating')

    if 'notes' in cols:
        op.drop_column('user_series_tracking', 'notes')


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    cols = [c['name'] for c in inspector.get_columns('user_series_tracking')]

    if 'review_visibility' not in cols:
        op.add_column(
            'user_series_tracking',
            sa.Column('review_visibility', sa.String(length=50), nullable=True, server_default='friends_only')
        )
    if 'rating' not in cols:
        op.add_column(
            'user_series_tracking',
            sa.Column('rating', sa.Integer(), nullable=True)
        )
    if 'notes' not in cols:
        op.add_column(
            'user_series_tracking',
            sa.Column('notes', sa.Text(), nullable=True)
        )
