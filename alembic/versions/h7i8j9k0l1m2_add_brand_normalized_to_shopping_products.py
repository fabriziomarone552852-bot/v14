"""add type_code to shopping_suppliers and brand_id to shopping_products, drop name from shopping_suppliers

Revision ID: h7i8j9k0l1m2
Revises: g6h7i8j9k0l1
Create Date: 2026-08-25 18:05:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'h7i8j9k0l1m2'
down_revision: Union[str, Sequence[str], None] = 'g6h7i8j9k0l1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Rimuove eventuale colonna temporanea brand_normalized se presente
    op.execute("ALTER TABLE shopping_products DROP COLUMN IF EXISTS brand_normalized")
    
    # 2. Aggiunge colonna type_code a shopping_suppliers (1=Fornitore, 2=Produttore/Brand, 3=Entrambi)
    op.execute("ALTER TABLE shopping_suppliers ADD COLUMN IF NOT EXISTS type_code INTEGER NOT NULL DEFAULT 1")
    op.execute("CREATE INDEX IF NOT EXISTS ix_shopping_suppliers_type_code ON shopping_suppliers (type_code)")

    # 3. Rimuove la colonna 'name' da shopping_suppliers per usare esclusivamente 'name_normalized'
    op.execute("ALTER TABLE shopping_suppliers DROP COLUMN IF EXISTS name")

    # 4. Aggiunge colonna brand_id a shopping_products con Foreign Key verso shopping_suppliers.id
    op.execute("ALTER TABLE shopping_products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES shopping_suppliers(id) ON DELETE SET NULL")
    op.execute("CREATE INDEX IF NOT EXISTS ix_shopping_products_brand_id ON shopping_products (brand_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_shopping_products_brand_id")
    op.execute("ALTER TABLE shopping_products DROP CONSTRAINT IF EXISTS fk_shopping_products_brand_id")
    op.execute("ALTER TABLE shopping_products DROP COLUMN IF EXISTS brand_id")

    op.execute("ALTER TABLE shopping_suppliers ADD COLUMN IF NOT EXISTS name VARCHAR(255)")
    op.execute("UPDATE shopping_suppliers SET name = name_normalized WHERE name IS NULL")

    op.execute("DROP INDEX IF EXISTS ix_shopping_suppliers_type_code")
    op.execute("ALTER TABLE shopping_suppliers DROP COLUMN IF EXISTS type_code")
