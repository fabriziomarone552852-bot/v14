"""
Repository del dominio Config.

Gestisce le query e la persistenza per Config e ConfigCode.
"""
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session

from backend.domains.config.models import Config, ConfigCode


def get_config_by_key(db: Session, key: str) -> Optional[Config]:
    return db.query(Config).filter(Config.key == key).first()


def create_config(db: Session, key: str, value: str, descrizione: Optional[str] = None) -> Config:
    obj = Config(key=key, value=value, descrizione=descrizione)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_config_code(db: Session, code_type: str, code_value: str) -> Optional[ConfigCode]:
    return (
        db.query(ConfigCode)
        .filter(
            ConfigCode.code_type == code_type,
            ConfigCode.code_value == code_value,
        )
        .first()
    )


def create_config_code(db: Session, payload: dict) -> ConfigCode:
    obj = ConfigCode(**payload)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def bulk_create_config_codes_if_missing(db: Session, codes: List[dict]) -> None:
    for code in codes:
        payload = {"sort_order": None, **code}
        existing = get_config_code(db, payload["code_type"], payload["code_value"])
        if existing is None:
            obj = ConfigCode(**payload)
            db.add(obj)
    db.commit()
