"""Service del dominio Admin."""
from __future__ import annotations


def get_admin_ping() -> dict[str, str]:
    return {"message": "admin ok"}
