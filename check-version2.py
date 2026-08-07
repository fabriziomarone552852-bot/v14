from sqlalchemy import create_engine, text

engine = create_engine('postgresql://PostGre:Password-Robusta@localhost:5433/family-smart')

with engine.connect() as conn:
    # Vedi tutte le tabelle
    result = conn.execute(text("""
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_type = 'BASE TABLE' 
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    """))
    print("Tabelle nel database:")
    for row in result.fetchall():
        print(f"  {row[1]}.{row[0]}")