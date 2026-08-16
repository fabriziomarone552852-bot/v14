"""add yearly_entries and bingo

Revision ID: a1b2c3d4e5f6
Revises: b2c3d4e5f6g7
Create Date: 2026-08-13 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6g7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Tabella yearly_entries
    op.create_table(
        'yearly_entries',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('yearly_type', sa.String(2), nullable=False),
        sa.Column('yearly_field', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "yearly_type IN ('OY','P1','P2','P3','PR','MJ','MS','MA','MD','MT','SC','SF','SA','SH','SS','SD','SM','SW','EP','EN','Q1','Q2','Q3','Q4','Q5','Q6','TG')",
            name='ck_yearly_entries_type_valid'
        )
    )
    op.create_index('ix_yearly_entries_user_year', 'yearly_entries', ['user_id', 'year'])
    op.create_index('ix_yearly_entries_yearly_type', 'yearly_entries', ['yearly_type'])
    op.create_index(
        'ix_yearly_entries_unique', 'yearly_entries', ['user_id', 'year', 'yearly_type'],
        unique=True,
        postgresql_where=sa.text("yearly_type NOT IN ('PR', 'EP', 'EN', 'TG')")
    )

    # Tabella bingo
    op.create_table(
        'bingo',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('testo', sa.Text(), nullable=True),
        sa.Column('done', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_bingo_user_year', 'bingo', ['user_id', 'year'])

def downgrade() -> None:
    op.drop_index('ix_bingo_user_year', table_name='bingo')
    op.drop_table('bingo')
    op.drop_index('ix_yearly_entries_unique', table_name='yearly_entries')
    op.drop_index('ix_yearly_entries_yearly_type', table_name='yearly_entries')
    op.drop_index('ix_yearly_entries_user_year', table_name='yearly_entries')
    op.drop_table('yearly_entries')
