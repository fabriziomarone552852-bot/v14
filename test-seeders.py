from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from backend.core.seeders import _SYSTEM_SEEDERS, run_all_system_seeders
from backend.core.models import import_all_models
from backend.core.settings import get_settings

# Importa tutti i modelli prima di usare i seeder
import_all_models()

# Importa esplicitamente i moduli con le costanti necessarie
from backend.domains.config import service as config_service  # noqa: F401
from backend.domains.monthly_entries import service as monthly_service  # noqa: F401
from backend.domains.shopping import service as shopping_service  # noqa: F401

# Importa i seeder (questo registra le funzioni)
import backend.core.bootstrap_seeders  # noqa: F401

# Usa le settings del progetto
settings = get_settings()
print(f"Database URL: {settings.database_url}")

engine = create_engine(settings.database_url)

print(f"\nSeeder registrati: {len(_SYSTEM_SEEDERS)}")
for seeder in _SYSTEM_SEEDERS:
    print(f"  - {seeder.__name__}")

with Session(engine) as db:
    count = run_all_system_seeders(db)
    print(f"\nSeeder eseguiti: {count}")
    print("✅ Seed completato con successo!")