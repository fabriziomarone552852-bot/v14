# Selezione ambiente + caricamento .env in base ad APP_ENV (nessuna scrittura su disco).
# DEVE stare in cima, prima di qualsiasi import che legga le variabili d'ambiente.
import backend.core.env as _env  # noqa: F401
from backend.core.models import import_all_models

import_all_models()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.core.models import ensure_database_schema_compat
from backend.core.settings import get_settings

from backend.domains.system_boot import router as system_boot_router
from backend.domains.system_boot.guards import system_boot_guard

# Router modulari standardizzati per ciascun dominio
from backend.domains.admin.router import router as admin_router
from backend.domains.analytics.router import router as analytics_router
from backend.domains.auth.router import router as auth_router
from backend.domains.catalogs.router import router as catalogs_router
from backend.domains.categories.router import router as categories_router
from backend.domains.countdowns.router import router as countdowns_router
from backend.domains.events.router import router as events_router
from backend.domains.feedback.router import router as feedback_router
from backend.domains.google_calendar.router import router as google_calendar_router
from backend.domains.habits.router import router as habits_router
from backend.domains.media.router import router as media_router
from backend.domains.monthly_entries.router import router as monthly_entries_router
from backend.domains.yearly_entries.router import router as yearly_entries_router
from backend.domains.bingo.router import router as bingo_router
from backend.domains.notifications.router import router as notifications_router
from backend.domains.planning.router import router as daily_entries_router
from backend.domains.shopping.router import router as shopping_router
from backend.domains.sync.router import router as sync_router
from backend.domains.tasks.router import router as tasks_router
from backend.domains.trackers.router import router as trackers_router
from backend.domains.users.router import router as users_router


def ensure_shopping_seed_data() -> None:
    """Verifica e popola in modo automatico ed idempotente i dati seed della spesa all'avvio."""
    try:
        from backend.core.database import SessionLocal
        from backend.domains.users.models import User
        from backend.domains.shopping.service import (
            seed_default_shopping_suppliers_for_user,
            seed_default_shopping_products_for_user,
            seed_default_inventory_batches_for_user,
        )
        from backend.core.sequence_sync import sync_all_table_sequences

        db = SessionLocal()
        try:
            admin_user = (
                db.query(User)
                .filter(User.is_superuser == True, User.deleted_at.is_(None))
                .first()
            )
            if not admin_user:
                admin_user = db.query(User).filter(User.deleted_at.is_(None)).first()

            if admin_user:
                seed_default_shopping_suppliers_for_user(db, admin_user.id)
                seed_default_shopping_products_for_user(db, admin_user.id)
                seed_default_inventory_batches_for_user(db, admin_user.id)
                sync_all_table_sequences(db)
                db.commit()
        finally:
            db.close()
    except Exception as exc:
        print(f"[STARTUP] Impossibile verificare auto-seed spesa: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(get_settings().upload_dir, exist_ok=True)
    ensure_database_schema_compat()
    ensure_shopping_seed_data()
    yield


app = FastAPI(title="Vita API", version="4.0", lifespan=lifespan)

app.middleware("http")(system_boot_guard)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_boot_router)
app.include_router(auth_router, prefix="/auth")
app.include_router(users_router, prefix="/users")
app.include_router(tasks_router)
app.include_router(events_router)
app.include_router(google_calendar_router)
app.include_router(google_calendar_router, prefix="/api/v1")
app.include_router(categories_router)
app.include_router(shopping_router)
app.include_router(analytics_router)
app.include_router(admin_router)
app.include_router(daily_entries_router)
app.include_router(countdowns_router)
app.include_router(habits_router)
app.include_router(sync_router)
app.include_router(catalogs_router)
app.include_router(monthly_entries_router)
app.include_router(yearly_entries_router)
app.include_router(bingo_router)
app.include_router(notifications_router)
app.include_router(media_router)
app.include_router(feedback_router)
app.include_router(trackers_router)

# Serving file statici caricati su disco
os.makedirs(get_settings().upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=get_settings().upload_dir), name="uploads")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

