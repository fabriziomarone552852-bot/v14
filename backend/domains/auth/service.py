"""Service del dominio Auth — registrazione, login e refresh token."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.core.deps import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_refresh_token,
)
from backend.domains.auth.schemas import Token, TokenPairResponse, RequiredPasswordChangeRequest
from backend.domains.users import repository as users_repo
from backend.domains.users import schemas as users_schemas
from backend.domains.users.models import User
from backend.domains.categories.service import seed_default_user_categories_for_user


def register(db: Session, user_in: users_schemas.UserCreate) -> User:
    username = user_in.username.strip().lower()
    email = str(user_in.email).strip().lower()

    deleted_user = users_repo.get_deleted_by_username_or_email(db, username, email)
    if deleted_user:
        raise HTTPException(
            status_code=400,
            detail=(
                "Username o Email associati a un account disattivato. "
                "Contattare un amministratore di sistema per la riattivazione."
            ),
        )

    if users_repo.username_or_email_exists(db, username, email):
        raise HTTPException(status_code=400, detail="Username o Email già registrati")

    user = users_repo.create_user(
        db,
        username,
        email,
        get_password_hash(user_in.password),
    )

    seed_default_user_categories_for_user(db, user.id)
    db.refresh(user)

    return user


def login(db: Session, username: str, password: str) -> TokenPairResponse:
    username_normalized = username.strip().lower()
    user = users_repo.get_by_username(db, username_normalized)

    if not user or user.deleted_at is not None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username o password errati",
        )

    access_scope = "password_change" if user.must_change_password else "app"

    return TokenPairResponse(
        access_token=create_access_token(
            data={
                "sub": user.username,
                "scope": access_scope,
                "must_change_password": user.must_change_password,
                "is_superuser": user.is_superuser,
            }
        ),
        refresh_token=create_refresh_token(
            data={
                "sub": user.username,
                "scope": access_scope,
            }
        ),
        token_type="bearer",
        must_change_password=user.must_change_password,
        is_superuser=user.is_superuser,
        access_scope=access_scope,
    )


def refresh(db: Session, refresh_token: str) -> Token:
    username = verify_refresh_token(refresh_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token non valido o scaduto",
        )

    username_normalized = username.strip().lower()
    user = users_repo.get_by_username(db, username_normalized)

    if not user or user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utente non trovato o non attivo",
        )

    access_scope = "password_change" if user.must_change_password else "app"

    return Token(
        access_token=create_access_token(
            data={
                "sub": user.username,
                "scope": access_scope,
                "must_change_password": user.must_change_password,
                "is_superuser": user.is_superuser,
            }
        ),
        token_type="bearer",
        must_change_password=user.must_change_password,
        is_superuser=user.is_superuser,
        access_scope=access_scope,
    )


def change_password_required(
    db: Session,
    username: str,
    payload: RequiredPasswordChangeRequest,
) -> TokenPairResponse:
    username_normalized = username.strip().lower()
    user = users_repo.get_by_username(db, username_normalized)

    if not user or user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utente non trovato o non attivo",
        )

    if not user.must_change_password:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Password change is not required for this user.",
        )

    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password attuale non corretta",
        )

    user.password_hash = get_password_hash(payload.new_password)
    user.must_change_password = False
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenPairResponse(
        access_token=create_access_token(
            data={
                "sub": user.username,
                "scope": "app",
                "must_change_password": False,
                "is_superuser": user.is_superuser,
            }
        ),
        refresh_token=create_refresh_token(
            data={
                "sub": user.username,
                "scope": "app",
            }
        ),
        token_type="bearer",
        must_change_password=False,
        is_superuser=user.is_superuser,
        access_scope="app",
    )