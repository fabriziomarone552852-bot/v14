"""Create shopping_product_brands table and refactor shopping_products

Revision ID: n3o4p5q6r7s8
Revises: fbc749dd477f
Create Date: 2026-10-03 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'n3o4p5q6r7s8'
down_revision: Union[str, Sequence[str], None] = 'fbc749dd477f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crea tabella ponte shopping_product_brands
    op.create_table(
        'shopping_product_brands',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['brand_id'], ['shopping_suppliers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['shopping_products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'brand_id', name='uq_shopping_product_brands')
    )
    op.create_index(op.f('ix_shopping_product_brands_brand_id'), 'shopping_product_brands', ['brand_id'], unique=False)
    op.create_index(op.f('ix_shopping_product_brands_product_id'), 'shopping_product_brands', ['product_id'], unique=False)

    # 2. Migra i dati legacy se presenti
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'shopping_products' AND column_name = 'brand_id'
            ) THEN
                INSERT INTO shopping_product_brands (product_id, brand_id, created_at)
                SELECT id, brand_id, NOW()
                FROM shopping_products
                WHERE brand_id IS NOT NULL
                ON CONFLICT DO NOTHING;
            END IF;
        END $$;
    """)

    # 3. Rimuovi la colonna brand_id da shopping_products se presente
    op.execute("ALTER TABLE shopping_products DROP COLUMN IF EXISTS brand_id CASCADE;")

    # 4. Deduplicazione e compattazione record multipli in shopping_products
    op.execute("""
        DO $$
        DECLARE
            rec RECORD;
            canonical_id INTEGER;
        BEGIN
            FOR rec IN (
                SELECT name_normalized, MIN(id) AS min_id, ARRAY_AGG(id ORDER BY id) AS all_ids
                FROM shopping_products
                GROUP BY name_normalized
                HAVING COUNT(*) > 1
            ) LOOP
                canonical_id := rec.min_id;

                -- 1. Unisci i brand collegati evitando duplicati (product_id, brand_id)
                INSERT INTO shopping_product_brands (product_id, brand_id, notes, created_at, updated_at)
                SELECT canonical_id, spb.brand_id, spb.notes, spb.created_at, spb.updated_at
                FROM shopping_product_brands spb
                WHERE spb.product_id = ANY(rec.all_ids)
                  AND spb.product_id != canonical_id
                ON CONFLICT (product_id, brand_id) DO NOTHING;

                -- Cancella i legami dei duplicati
                DELETE FROM shopping_product_brands
                WHERE product_id = ANY(rec.all_ids)
                  AND product_id != canonical_id;

                -- 2. Riassegna shopping_list_items al canonical_id
                UPDATE shopping_list_items
                SET product_id = canonical_id
                WHERE product_id = ANY(rec.all_ids)
                  AND product_id != canonical_id;

                -- 3. Riassegna inventory_batch al canonical_id
                UPDATE inventory_batch
                SET product_id = canonical_id
                WHERE product_id = ANY(rec.all_ids)
                  AND product_id != canonical_id;

                -- 4. Elimina i record prodotto duplicati
                DELETE FROM shopping_products
                WHERE id = ANY(rec.all_ids)
                  AND id != canonical_id;
            END LOOP;
        END $$;
    """)

    # 5. Crea indice UNIQUE su name_normalized
    op.create_index(
        'uq_shopping_products_name_normalized',
        'shopping_products',
        ['name_normalized'],
        unique=True
    )



def downgrade() -> None:
    op.add_column('shopping_products', sa.Column('brand_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_shopping_products_brand_id', 'shopping_products', 'shopping_suppliers', ['brand_id'], ['id'], ondelete='SET NULL')
    op.create_index('ix_shopping_products_brand_id', 'shopping_products', ['brand_id'], unique=False)

    op.execute("""
        UPDATE shopping_products sp
        SET brand_id = spb.brand_id
        FROM shopping_product_brands spb
        WHERE sp.id = spb.product_id;
    """)

    op.drop_index(op.f('ix_shopping_product_brands_product_id'), table_name='shopping_product_brands')
    op.drop_index(op.f('ix_shopping_product_brands_brand_id'), table_name='shopping_product_brands')
    op.drop_table('shopping_product_brands')
