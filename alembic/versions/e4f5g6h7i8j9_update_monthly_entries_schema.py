"""update monthly_entries schema

Revision ID: e4f5g6h7i8j9
Revises: d3e4f5g6h7i8
Create Date: 2026-08-19 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e4f5g6h7i8j9'
down_revision: Union[str, Sequence[str], None] = 'd3e4f5g6h7i8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rimuovi vecchi vincoli e indici se presenti
    op.execute("ALTER TABLE monthly_entries DROP CONSTRAINT IF EXISTS monthly_entries_feel_type_fkey")
    op.execute("ALTER TABLE monthly_entries DROP CONSTRAINT IF EXISTS uq_monthly_entries_user_year_month_feel_type")
    op.execute("DROP INDEX IF EXISTS idx_monthly_entries_feel_type")
    op.execute("DROP INDEX IF EXISTS idx_monthly_entries_user_year_month")

    # Rimuovi vecchie colonne
    op.execute("ALTER TABLE monthly_entries DROP COLUMN IF EXISTS feel_type")
    op.execute("ALTER TABLE monthly_entries DROP COLUMN IF EXISTS feel_value")

    # Aggiungi nuove colonne se non esistono già
    # monthly_type è NOT NULL ma usiamo un default temporaneo 'MJ' per righe esistenti
    op.execute("ALTER TABLE monthly_entries ADD COLUMN IF NOT EXISTS monthly_type VARCHAR(2) NOT NULL DEFAULT 'MJ'")
    op.execute("ALTER TABLE monthly_entries ADD COLUMN IF NOT EXISTS monthly_field TEXT")

    # Aggiungi check constraint se non esiste
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'ck_monthly_entries_type_valid'
            ) THEN
                ALTER TABLE monthly_entries ADD CONSTRAINT ck_monthly_entries_type_valid
                CHECK (monthly_type IN ('MJ','MS','MA','MD','MT','SC','SF','SA','SH','SS','SD','SM','SW','EP','EN','OM','PM','Q1','Q2','Q3','Q4','Q5','Q6','TG'));
            END IF;
        END $$;
    """)

    # Aggiungi indici se non esistono
    op.execute("CREATE INDEX IF NOT EXISTS ix_monthly_entries_user_year_month ON monthly_entries (user_id, year, month)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_monthly_entries_monthly_type ON monthly_entries (monthly_type)")
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_monthly_entries_unique
        ON monthly_entries (user_id, year, month, monthly_type)
        WHERE monthly_type NOT IN ('EP', 'EN', 'PM', 'TG')
    """)




def downgrade() -> None:
    op.drop_index('ix_monthly_entries_unique', table_name='monthly_entries')
    op.drop_index('ix_monthly_entries_monthly_type', table_name='monthly_entries')
    op.drop_index('ix_monthly_entries_user_year_month', table_name='monthly_entries')
    op.drop_constraint('ck_monthly_entries_type_valid', 'monthly_entries', type_='check')
    op.drop_column('monthly_entries', 'monthly_field')
    op.drop_column('monthly_entries', 'monthly_type')
    op.add_column('monthly_entries', sa.Column('feel_type', sa.INTEGER(), nullable=False))
    op.add_column('monthly_entries', sa.Column('feel_value', sa.INTEGER(), nullable=False))
