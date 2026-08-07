from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from backend.core.seeders import _SYSTEM_SEEDERS
from backend.core.models import import_all_models
from backend.core.settings import get_settings

# Importa tutti i modelli
import_all_models()

# Importa i seeder
import backend.core.bootstrap_seeders  # noqa: F401

settings = get_settings()
engine = create_engine(settings.database_url)

print(f"Seeder registrati: {len(_SYSTEM_SEEDERS)}")
for seeder in _SYSTEM_SEEDERS:
    print(f"  - {seeder.__name__}")

# Esegui solo i seeder che non hanno dipendenze mancanti
print("\nEsecuzione seeder...")
with Session(engine) as db:
    for i, seeder in enumerate(_SYSTEM_SEEDERS, 1):
        try:
            print(f"  [{i}/{len(_SYSTEM_SEEDERS)}] Esecuzione {seeder.__name__}...", end=" ")
            seeder(db)
            db.commit()
            print("✅")
        except Exception as e:
            print(f"❌ Errore: {e}")
            db.rollback()

print("\n✅ Test completato!")