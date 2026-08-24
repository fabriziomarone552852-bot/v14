from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Generator

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.core.settings import get_settings
from backend.domains.users.models import User

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
password_hasher = PasswordHasher()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_password_hash(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def _create_jwt(
    data: dict[str, Any],
    token_type: str,
    expire_delta: timedelta,
) -> str:
    """Funzione privata condivisa per la creazione di token JWT."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expire_delta
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(
        to_encode,
        settings.secret_key.get_secret_value(),
        algorithm=settings.algorithm,
    )


def create_access_token(data: dict[str, Any], expire_minutes: int | None = None) -> str:
    return _create_jwt(
        data,
        token_type="access",
        expire_delta=timedelta(minutes=expire_minutes or settings.access_token_expire_minutes),
    )


def create_refresh_token(data: dict[str, Any]) -> str:
    return _create_jwt(
        data,
        token_type="refresh",
        expire_delta=timedelta(days=settings.refresh_token_expire_days),
    )


_CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenziali non valide",
    headers={"WWW-Authenticate": "Bearer"},
)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.secret_key.get_secret_value(),
            algorithms=[settings.algorithm],
        )
    except JWTError:
        raise _CREDENTIALS_ERROR


def verify_refresh_token(token: str) -> str | None:
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        return None
    subject = payload.get("sub")
    return str(subject) if subject is not None else None


def get_token_payload(token: str = Depends(oauth2_scheme)) -> dict[str, Any]:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token di accesso non valido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.strip():
        raise _CREDENTIALS_ERROR

    return payload


def _get_user_from_payload(payload: dict[str, Any], db: Session) -> User:
    username = str(payload["sub"]).strip().lower()

    stmt = (
        select(User)
        .where(func.lower(User.username) == username)
        .where(User.deleted_at.is_(None))
    )
    user = db.execute(stmt).scalar_one_or_none()

    if user is None:
        raise _CREDENTIALS_ERROR

    return user


def get_current_user(
    payload: dict[str, Any] = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> User:
    return _get_user_from_payload(payload, db)



def require_app_scope(payload: dict[str, Any] = Depends(get_token_payload)) -> dict[str, Any]:
    if payload.get("scope") != "app":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PASSWORD_CHANGE_REQUIRED",
        )
    return payload


def require_password_change_scope(
    payload: dict[str, Any] = Depends(get_token_payload),
) -> dict[str, Any]:
    if payload.get("scope") != "password_change":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid scope for required password change flow",
        )
    return payload


def get_current_app_user(
    payload: dict[str, Any] = Depends(require_app_scope),
    db: Session = Depends(get_db),
) -> User:
    return _get_user_from_payload(payload, db)


def get_current_password_change_user(
    payload: dict[str, Any] = Depends(require_password_change_scope),
    db: Session = Depends(get_db),
) -> User:
    return _get_user_from_payload(payload, db)


def require_superuser(current_user: User = Depends(get_current_app_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permessi insufficienti",
        )
    return current_user



__all__ = [
    "oauth2_scheme",
    "get_db",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "verify_refresh_token",
    "decode_token",
    "get_token_payload",
    "get_current_user",
    "get_current_app_user",
    "get_current_password_change_user",
    "require_app_scope",
    "require_password_change_scope",
    "require_superuser",
]