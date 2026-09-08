"""add pin_status and is_default to shopping_lists

Revision ID: k0l1m2n3o4p5
Revises: j9k0l1m2n3o4
Create Date: 2026-09-02 01:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'k0l1m2n3o4p5'
down_revision: Union[str, Sequence[str], None] = 'j9k0l1m2n3o4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Aggiunta colonna pin_status (PN = Pinnata, FV = Favorita, PF = Pinnata e Favorita)
    op.execute("ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS pin_status VARCHAR(2)")

    # 2. Aggiunta colonna is_default (True per la lista speciale di sistema 'Senza lista')
    op.execute("ALTER TABLE shopping_lists ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE")

    # 3. Auto-provisioning della lista di sistema 'Senza lista' per tutti gli utenti esistenti nel DB
    # Nota: user_id e la colonna reale nel DB, visibility_id = 1 (private), status_id = 1 (active)
    op.execute("""
        INSERT INTO shopping_lists (user_id, visibility_id, status_id, name, is_completed, is_default, created_at, updated_at)
        SELECT u.id, 1, 1, 'Senza lista', false, true, NOW(), NOW()
        FROM users u
        WHERE NOT EXISTS (
            SELECT 1 FROM shopping_lists sl 
            WHERE sl.user_id = u.id AND sl.is_default = true AND sl.deleted_at IS NULL
        )
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE shopping_lists DROP COLUMN IF EXISTS pin_status")
    op.execute("ALTER TABLE shopping_lists DROP COLUMN IF EXISTS is_default")
