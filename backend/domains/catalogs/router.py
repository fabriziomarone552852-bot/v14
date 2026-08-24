"""
Router principale del dominio Catalogs.

Include sia il router pubblico (/catalogs) sia il router amministrativo (/admin/catalogs).
"""
from fastapi import APIRouter

from backend.domains.catalogs.router_admin import router as admin_catalogs_router
from backend.domains.catalogs.router_public import router as catalogs_router

router = APIRouter()
router.include_router(catalogs_router)
router.include_router(admin_catalogs_router)

__all__ = ["router", "catalogs_router", "admin_catalogs_router"]
