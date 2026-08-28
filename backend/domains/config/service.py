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

from backend.core.csv_seed_loader import load_seed_config_codes, load_seed_configs


@register_seeder
def seed_default_configs(db: Session) -> None:
    """Popola le configurazioni applicative di default se assenti leggendole da config.csv."""
    configs = load_seed_configs()
    for cfg in configs:
        key = cfg["key"]
        existing = repo.get_config_by_key(db, key)
        if existing is None:
            default_val = cfg["value"]
            if key == "max_subtask_depth" and hasattr(settings, "default_max_subtask_depth"):
                default_val = str(settings.default_max_subtask_depth)
            elif key == "price_stats_lookback_days" and hasattr(settings, "default_price_stats_lookback_days"):
                default_val = str(settings.default_price_stats_lookback_days)

            repo.create_config(
                db,
                key=key,
                value=default_val,
                descrizione=cfg.get("descrizione", ""),
            )


@register_seeder
def seed_default_config_codes(db: Session) -> None:
    """Popola i codici di configurazione (ConfigCode) di default se assenti leggendoli da config_codes.csv."""
    config_codes = load_seed_config_codes()
    repo.bulk_create_config_codes_if_missing(db, config_codes)

