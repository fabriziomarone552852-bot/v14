"""Set must_change_password default to false.

Revision ID: b2c3d4e5f6g7
Revises: 5b4d913d14f4
Create Date: 2026-08-07 19:27:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = '5b4d913d14f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Imposta il default della colonna must_change_password a false e aggiorna gli utenti esistenti."""
    op.alter_column(
        'users',
        'must_change_password',
        server_default=sa.text('false'),
    )
    op.execute("UPDATE users SET must_change_password = false WHERE must_change_password = true")


def downgrade() -> None:
    """Ripristina il default a true."""
    op.alter_column(
        'users',
        'must_change_password',
        server_default=sa.text('true'),
    )
