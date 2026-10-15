"""Alter quantity columns in inventory_batch and shopping_list_items to NUMERIC(12, 3)

Revision ID: b1c2d3e4f5a6
Revises: z9y8x7w6v5u4
Create Date: 2026-10-15 20:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = 'z9y8x7w6v5u4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Aggiorna quantity_purchased in inventory_batch a NUMERIC(12, 3)
    op.alter_column(
        'inventory_batch',
        'quantity_purchased',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Numeric(precision=12, scale=3),
        existing_nullable=False,
    )

    # 2. Aggiorna quantity in shopping_list_items a NUMERIC(12, 3)
    op.alter_column(
        'shopping_list_items',
        'quantity',
        existing_type=sa.Numeric(precision=12, scale=2),
        type_=sa.Numeric(precision=12, scale=3),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'shopping_list_items',
        'quantity',
        existing_type=sa.Numeric(precision=12, scale=3),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=True,
    )
    op.alter_column(
        'inventory_batch',
        'quantity_purchased',
        existing_type=sa.Numeric(precision=12, scale=3),
        type_=sa.Numeric(precision=12, scale=2),
        existing_nullable=False,
    )
