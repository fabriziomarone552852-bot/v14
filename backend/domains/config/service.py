"""
Service del dominio Config.

Gestisce la configurazione applicativa dinamica, i codici di registro (ConfigCode)
e il popolamento automatico dei dati di sistema predefiniti.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from backend.core.seeders import register_seeder
from backend.core.settings import get_settings
from backend.domains.config import repository as repo

settings = get_settings()
# ... (DEFAULT_CONFIG_CODES unchanged) ...
@register_seeder
def seed_default_configs(db: Session) -> None:
    """Popola le configurazioni applicative di default se assenti."""
    existing = repo.get_config_by_key(db, "max_subtask_depth")
    if existing is None:
        repo.create_config(
            db,
            key="max_subtask_depth",
            value=str(settings.default_max_subtask_depth),
            descrizione="Numero massimo di livelli consentiti per la nidificazione dei sottotask.",
        )


@register_seeder
def seed_default_config_codes(db: Session) -> None:
    """Popola i codici di configurazione (ConfigCode) di default se assenti."""
    repo.bulk_create_config_codes_if_missing(db, DEFAULT_CONFIG_CODES)
