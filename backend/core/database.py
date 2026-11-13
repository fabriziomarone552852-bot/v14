"""
Core database infrastructure.

Contiene:
- Base dichiarativa SQLAlchemy condivisa
- Engine applicativo
- Session factory condivisa
- Factory esplicite per engine/session multi-ambiente
"""
from __future__ import annotations

import logging
import time
from typing import Any

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from backend.core.settings import get_settings, Settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Classe base per tutti i modelli SQLAlchemy (stile 2.x)."""
    pass


def _build_engine_kwargs(database_url: str, settings: Settings) -> dict[str, Any]:
    engine_kwargs: dict[str, Any] = {
        "pool_pre_ping": True,
    }

    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs.update(
            {
                "pool_size": settings.db_pool_size,
                "max_overflow": settings.db_max_overflow,
                "pool_recycle": settings.db_pool_recycle,
                "pool_timeout": settings.db_pool_timeout,
                "connect_args": {
                    "connect_timeout": 15,
                    "keepalives": 1,
                    "keepalives_idle": 60,
                    "keepalives_interval": 10,
                    "keepalives_count": 5,
                },
            }
        )

    return engine_kwargs


def build_engine(database_url: str, settings: Settings | None = None) -> Engine:
    """
    Costruisce un Engine SQLAlchemy esplicito per la URL passata.

    Usare questa factory negli script multi-ambiente (BOOTDB/SEEDDB),
    così non dipendono dall'engine globale risolto a import time.
    """
    resolved_settings = settings or get_settings()
    normalized_url = database_url.strip()
    engine_kwargs = _build_engine_kwargs(normalized_url, resolved_settings)
    new_engine = create_engine(normalized_url, **engine_kwargs)

    if not normalized_url.startswith("sqlite"):
        @event.listens_for(new_engine, "do_connect")
        def _retry_on_transient_connect_timeout(dialect, conn_rec, cargs, cparams):
            try:
                return dialect.connect(*cargs, **cparams)
            except Exception as first_exc:
                logger.warning(
                    "Timeout o errore transitorio di connessione DB (%s), nuovo tentativo tra 0.5s...",
                    first_exc,
                )
                time.sleep(0.5)
                return dialect.connect(*cargs, **cparams)

    return new_engine


def build_session_factory(engine: Engine) -> sessionmaker:
    """
    Costruisce una session factory legata all'engine passato.
    """
    return sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )


settings = get_settings()
database_url = settings.database_url.strip()

engine = build_engine(database_url, settings=settings)
SessionLocal = build_session_factory(engine)

__all__ = [
    "Base",
    "engine",
    "SessionLocal",
    "build_engine",
    "build_session_factory",
]