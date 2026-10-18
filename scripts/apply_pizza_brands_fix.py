"""
Script di allineamento lotti 'pizza' nel database di produzione (family-smart).
Assegna brand_id = 36 ('bufalina') al lotto 96 e brand_id = 38 ('emozione') al lotto 97.
"""
import os
import sys

# Forza prod se non specificato
if not os.environ.get("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql+psycopg://PostGre:Password-Robusta@192.168.11.20:5432/family-smart"

from sqlalchemy import create_engine, text

def main():
    db_url = os.environ["DATABASE_URL"]
    print(f"Connecting to database: {db_url}")
    engine = create_engine(db_url, connect_args={"connect_timeout": 5})
    
    with engine.begin() as conn:
        print("1. Esecuzione migrazione colonna brand_id se mancante...")
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'inventory_batch' AND column_name = 'brand_id'
                ) THEN
                    ALTER TABLE inventory_batch ADD COLUMN brand_id BIGINT REFERENCES shopping_suppliers(id) ON DELETE SET NULL;
                    CREATE INDEX IF NOT EXISTS ix_inventory_batch_brand_id ON inventory_batch (brand_id);
                END IF;
            END $$;
        """))

        print("2. Aggiornamento brand per i lotti 'pizza' (id 96 -> bufalina/36, id 97 -> emozione/38)...")
        res1 = conn.execute(text("UPDATE inventory_batch SET brand_id = 36 WHERE id = 96 AND product_id = 80"))
        res2 = conn.execute(text("UPDATE inventory_batch SET brand_id = 38 WHERE id = 97 AND product_id = 80"))
        print(f"Righe aggiornate: lotto 96 = {res1.rowcount}, lotto 97 = {res2.rowcount}")

        print("3. Verifica finale...")
        rows = conn.execute(text("""
            SELECT b.id, b.product_id, b.brand_id, s.name_normalized as brand_name, b.supplier_id, b.purchase_price
            FROM inventory_batch b
            LEFT JOIN shopping_suppliers s ON b.brand_id = s.id
            WHERE b.product_id = 80
            ORDER BY b.id ASC
        """)).mappings().all()
        for r in rows:
            print(" ->", dict(r))

    print("Completato con successo!")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERRORE: {e}", file=sys.stderr)
        sys.exit(1)
