"""move viewing_platform to episode logs

Revision ID: b3c4d5e6f7a8
Revises: 9887b53d6bfe
Create Date: 2026-10-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b3c4d5e6f7a8'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Aggiunge viewing_platform_id a tv_user_episode_logs (idempotente)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    episode_cols = [c['name'] for c in inspector.get_columns('tv_user_episode_logs')]
    if 'viewing_platform_id' not in episode_cols:
        op.add_column(
            'tv_user_episode_logs',
            sa.Column('viewing_platform_id', sa.Integer(), nullable=True)
        )
    existing_fks = [fk.get('name') for fk in inspector.get_foreign_keys('tv_user_episode_logs')]
    if 'fk_episode_log_platform' not in existing_fks:
        has_platform_fk = any('viewing_platform_id' in fk.get('constrained_columns', []) for fk in inspector.get_foreign_keys('tv_user_episode_logs'))
        if not has_platform_fk:
            try:
                op.create_foreign_key(
                    'fk_episode_log_platform',
                    'tv_user_episode_logs',
                    'tv_user_platforms',
                    ['viewing_platform_id'],
                    ['id'],
                    ondelete='SET NULL'
                )
            except Exception:
                pass
    existing_indexes = [idx.get('name') for idx in inspector.get_indexes('tv_user_episode_logs')]
    if 'ix_tv_user_episode_logs_viewing_platform_id' not in existing_indexes:
        try:
            op.create_index(
                'ix_tv_user_episode_logs_viewing_platform_id',
                'tv_user_episode_logs',
                ['viewing_platform_id'],
                unique=False
            )
        except Exception:
            pass

    # 2. Rimuove viewing_platform_id da tv_user_series_logs (idempotente)
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    series_cols = [c['name'] for c in inspector.get_columns('tv_user_series_logs')]
    if 'viewing_platform_id' in series_cols:
        with op.batch_alter_table('tv_user_series_logs') as batch_op:
            fks = inspector.get_foreign_keys('tv_user_series_logs')
            for fk in fks:
                if 'viewing_platform_id' in fk.get('constrained_columns', []):
                    try:
                        batch_op.drop_constraint(fk['name'], type_='foreignkey')
                    except Exception:
                        pass
            batch_op.drop_column('viewing_platform_id')


def downgrade() -> None:
    # 1. Riaggiungi viewing_platform_id a tv_user_series_logs
    op.add_column(
        'tv_user_series_logs',
        sa.Column('viewing_platform_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_series_log_platform',
        'tv_user_series_logs',
        'tv_user_platforms',
        ['viewing_platform_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # 2. Rimuovi da tv_user_episode_logs
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    episode_cols = [c['name'] for c in inspector.get_columns('tv_user_episode_logs')]
    if 'viewing_platform_id' in episode_cols:
        with op.batch_alter_table('tv_user_episode_logs') as batch_op:
            fks = inspector.get_foreign_keys('tv_user_episode_logs')
            for fk in fks:
                if 'viewing_platform_id' in fk.get('constrained_columns', []):
                    try:
                        batch_op.drop_constraint(fk['name'], type_='foreignkey')
                    except Exception:
                        pass
            batch_op.drop_index('ix_tv_user_episode_logs_viewing_platform_id')
            batch_op.drop_column('viewing_platform_id')
