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
    op.execute("""
        CREATE TABLE IF NOT EXISTS yearly_entries (
            id SERIAL NOT NULL,
            user_id INTEGER NOT NULL,
            year INTEGER NOT NULL,
            yearly_type VARCHAR(2) NOT NULL,
            yearly_field TEXT,
            PRIMARY KEY (id),
            FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT ck_yearly_entries_type_valid CHECK (yearly_type IN ('OY','P1','P2','P3','PR','MJ','MS','MA','MD','MT','SC','SF','SA','SH','SS','SD','SM','SW','EP','EN','Q1','Q2','Q3','Q4','Q5','Q6','TG'))
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_yearly_entries_user_year ON yearly_entries (user_id, year)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_yearly_entries_yearly_type ON yearly_entries (yearly_type)")
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_yearly_entries_unique
        ON yearly_entries (user_id, year, yearly_type)
        WHERE yearly_type NOT IN ('PR', 'EP', 'EN', 'TG')
    """)

    # Tabella bingo
    op.execute("""
        CREATE TABLE IF NOT EXISTS bingo (
            id SERIAL NOT NULL,
            user_id INTEGER NOT NULL,
            year INTEGER NOT NULL,
            testo TEXT,
            done BOOLEAN NOT NULL DEFAULT false,
            PRIMARY KEY (id),
            FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_bingo_user_year ON bingo (user_id, year)")

def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_bingo_user_year")
    op.drop_table('bingo')
    op.execute("DROP INDEX IF EXISTS ix_yearly_entries_unique")
    op.execute("DROP INDEX IF EXISTS ix_yearly_entries_yearly_type")
    op.execute("DROP INDEX IF EXISTS ix_yearly_entries_user_year")
    op.drop_table('yearly_entries')

