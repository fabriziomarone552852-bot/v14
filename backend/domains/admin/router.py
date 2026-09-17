from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.admin import service
from backend.domains.users import schemas as user_schemas
from backend.domains.users.models import User

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(deps.require_superuser)],
)


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_superuser: Optional[bool] = None


class AdminResetPasswordPayload(BaseModel):
    new_password: str = Field(..., min_length=4)


@router.get("/ping")
def admin_ping():
    return service.get_admin_ping()


@router.get("/users", response_model=List[user_schemas.UserResponse])
def list_system_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    return db.query(User).order_by(User.id.asc()).all()


@router.patch("/users/{user_id}", response_model=user_schemas.UserResponse)
def update_user_by_admin(
    user_id: int,
    user_in: AdminUserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente non trovato")

    if user_in.username is not None:
        trimmed_username = user_in.username.strip().lower()
        if trimmed_username:
            existing = db.query(User).filter(User.username == trimmed_username, User.id != user_id).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username già in uso")
            db_user.username = trimmed_username

    if user_in.email is not None:
        trimmed_email = user_in.email.strip().lower()
        if trimmed_email:
            existing = db.query(User).filter(User.email == trimmed_email, User.id != user_id).first()
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email già in uso")
            db_user.email = trimmed_email

    if user_in.is_superuser is not None:
        db_user.is_superuser = user_in.is_superuser

    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/users/{user_id}/reset-password")
def reset_user_password_by_admin(
    user_id: int,
    payload: AdminResetPasswordPayload,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente non trovato")

    db_user.password_hash = deps.get_password_hash(payload.new_password)
    db.commit()
    return {"message": f"Password resettata con successo per l'utente {db_user.username}"}


@router.post("/users/{user_id}/toggle-active", response_model=user_schemas.UserResponse)
def toggle_user_active_status(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente non trovato")

    if db_user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Non puoi disabilitare il tuo stesso account SuperUser")

    if db_user.deleted_at is None:
        # Disabilita utente
        db_user.deleted_at = datetime.now(timezone.utc)
        db_user.deleted_by_user_id = current_user.id
    else:
        # Ripristina / Abilita utente
        db_user.deleted_at = None
        db_user.deleted_by_user_id = None

    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/seed-shopping-data")
def reseed_shopping_data_by_admin(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    from backend.domains.shopping.service import (
        seed_default_shopping_suppliers_for_user,
        seed_default_shopping_products_for_user,
        seed_default_inventory_batches_for_user,
    )
    from backend.core.sequence_sync import sync_all_table_sequences

    try:
        seed_default_shopping_suppliers_for_user(db, current_user.id)
        seed_default_shopping_products_for_user(db, current_user.id)
        seed_default_inventory_batches_for_user(db, current_user.id)
        sync_all_table_sequences(db)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante l'esecuzione del seed: {exc}",
        )

    return {"message": "Seed prodotti spesa, negozi e lotti completato con successo!"}

