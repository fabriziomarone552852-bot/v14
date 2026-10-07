"""Service del dominio Users — regole di business per le impostazioni utente."""
from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.core.deps import get_password_hash, verify_password
from backend.domains.users import repository as repo
from backend.domains.users import schemas
from backend.domains.users.models import User


def get_user_settings(db: Session, current_user: User) -> schemas.UserSettingsResponse:
    from backend.domains.tasks.service import get_admin_max_depth
    admin_limit = get_admin_max_depth(db)
    return schemas.UserSettingsResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        max_subtask_depth_user=current_user.max_subtask_depth_user,
        system_max_subtask_depth=admin_limit,
        is_superuser=current_user.is_superuser,
        must_change_password=current_user.must_change_password,
        profile_picture_url=current_user.profile_picture_url,
        default_startup_page=current_user.default_startup_page,
        module_preferences=current_user.module_preferences,
    )


def update_settings(
    db: Session,
    current_user: User,
    settings_in: schemas.UserSettingsUpdate,
) -> schemas.UserSettingsResponse:
    if current_user.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    data = settings_in.model_dump(exclude_unset=True)

    if "email" in data:
        new_email = data["email"].strip().lower()
        if new_email != current_user.email.lower():
            if repo.email_in_use(db, new_email):
                raise HTTPException(status_code=400, detail="Email già in uso")
            current_user.email = new_email

    if "new_password" in data:
        if not verify_password(data["current_password"], current_user.password_hash):
            raise HTTPException(status_code=400, detail="Password corrente non corretta")

        current_user.password_hash = get_password_hash(data["new_password"])
        current_user.must_change_password = False

    if "max_subtask_depth_user" in data:
        from backend.domains.tasks.service import get_admin_max_depth
        admin_limit = get_admin_max_depth(db)
        chosen_depth = data["max_subtask_depth_user"]
        if chosen_depth is not None and chosen_depth > admin_limit:
            raise HTTPException(
                status_code=400,
                detail=f"Il livello di nidificazione scelto ({chosen_depth}) supera il massimo di sistema consentito dall'amministratore ({admin_limit}).",
            )
        current_user.max_subtask_depth_user = chosen_depth

    if "default_startup_page" in data:
        current_user.default_startup_page = data["default_startup_page"]

    if "module_preferences" in data:
        current_user.module_preferences = data["module_preferences"]

    if "profile_picture_url" in data:
        current_user.profile_picture_url = data["profile_picture_url"]

    saved_user = repo.save(db, current_user)
    return get_user_settings(db, saved_user)


def soft_delete_user(
    db: Session,
    current_user: User,
    deleted_by_user_id: int | None = None,
) -> User:
    if current_user.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    return repo.soft_delete_user(
        db=db,
        user=current_user,
        deleted_by_user_id=deleted_by_user_id,
    )


def restore_user(
    db: Session,
    user_id: int,
) -> User:
    user = repo.get_by_id_including_deleted(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    if user.deleted_at is None:
        return user

    try:
        return repo.restore_user(db, user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail=(
                "Impossibile ripristinare l'utente per conflitto sui dati univoci. "
                "Verificare username ed email."
            ),
        )


def get_yearly_goal(db: Session, user_id: int, tracker_type: str, year: int) -> schemas.UserYearlyGoalResponse | None:
    # Use the fallback logic: get the most recent goal up to the given year
    goal = repo.get_yearly_goal(db, user_id, tracker_type, year)
    if not goal:
        return None
    return goal


def set_yearly_goal(db: Session, user_id: int, tracker_type: str, year: int, goal_value: int) -> schemas.UserYearlyGoalResponse:
    # Check if there is already an EXACT record for this year
    existing_exact_goal = repo.get_exact_yearly_goal(db, user_id, tracker_type, year)
    
    from backend.domains.users.models import UserYearlyGoal
    
    if existing_exact_goal:
        # Update the existing record for this specific year
        existing_exact_goal.goal_value = goal_value
        return repo.save_yearly_goal(db, existing_exact_goal)
    else:
        # Create a new record for this year
        new_goal = UserYearlyGoal(
            user_id=user_id,
            tracker_type=tracker_type,
            year=year,
            goal_value=goal_value
        )
        return repo.save_yearly_goal(db, new_goal)