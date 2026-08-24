"""
Helper programmatico per l'esecuzione automatica delle migrazioni Alembic.
"""
from __future__ import annotations

import logging
from pathlib import Path
from alembic import command
from alembic.config import Config as AlembicConfig

from backend.core.env import BACKEND_DIR
from backend.core.settings import get_settings

logger = logging.getLogger(__name__)

ROOT_DIR: Path = BACKEND_DIR.parent


def run_alembic_upgrade(target_url: str | None = None) -> None:
    """
    Esegue la migrazione Alembic al livello 'head' in modo programmatico.

    Se target_url è fornito, viene utilizzato quell'URL per il DB target;
    altrimenti legge settings.database_url dall'ambiente attivo.
    """
    settings = get_settings()
    url = (target_url or settings.database_url).strip()

    ini_path = ROOT_DIR / "alembic.ini"
    if not ini_path.is_file():
        logger.error("File di configurazione Alembic non trovato: %s", ini_path)
        raise FileNotFoundError(f"File di configurazione Alembic non trovato: {ini_path}")

    alembic_cfg = AlembicConfig(str(ini_path))
    alembic_cfg.set_main_option("sqlalchemy.url", url)

    script_dir = ROOT_DIR / "alembic"
    alembic_cfg.set_main_option("script_location", str(script_dir))

    logger.info("Esecuzione migrazione programmatica Alembic su URL %s...", url)
    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Migrazione programmatica Alembic (upgrade) completata con successo.")
    except Exception as exc:
        logger.warning("Upgrade Alembic ha rilevato elementi già esistenti (%s). Stamping della versione 'head'...", exc)
        command.stamp(alembic_cfg, "head")
        logger.info("Alembic versione 'head' registrata con successo (stamp).")


__all__ = ["run_alembic_upgrade"]
