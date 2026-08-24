"""
Central Seeder Registry.

Fornisce un registro dinamico ed estensibile in cui i domini possono registrare
le proprie funzioni di popolamento dei dati di sistema iniziali.
"""
from __future__ import annotations

from typing import Callable, List
from sqlalchemy.orm import Session

SeederFunc = Callable[[Session], None]

_SYSTEM_SEEDERS: List[SeederFunc] = []


def register_seeder(func: SeederFunc) -> SeederFunc:
    """
    Decoratore o funzione per registrare una funzione di seed di sistema.
    """
    if func not in _SYSTEM_SEEDERS:
        _SYSTEM_SEEDERS.append(func)
    return func


def run_all_system_seeders(db: Session) -> int:
    """
    Esegue in sequenza tutti i seeder di sistema registrati.
    Ritorna il numero di seeder eseguiti.
    """
    for seeder in _SYSTEM_SEEDERS:
        seeder(db)
    return len(_SYSTEM_SEEDERS)


__all__ = ["register_seeder", "run_all_system_seeders"]
