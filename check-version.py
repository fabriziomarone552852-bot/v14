from sqlalchemy import create_engine, text

engine = create_engine('postgresql://PostGre:Password-Robusta@localhost:5433/family-smart')

with engine.connect() as conn:
    result = conn.execute(text('SELECT * FROM alembic_version;'))
    print("Alembic version:", result.fetchall())