"""Router HTTP del dominio Users."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.users import schemas, service
from backend.domains.users.models import User

router = APIRouter(tags=["users"])


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(deps.get_current_app_user)):
    """Ritorna i dati principali dell'utente loggato."""
    return current_user


@router.get("/me/settings", response_model=schemas.UserSettingsResponse)
def get_my_settings(
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    """Ritorna le impostazioni utente incluse le configurazioni di sistema."""
    return service.get_user_settings(db, current_user)


@router.patch("/me/settings", response_model=schemas.UserSettingsResponse)
def update_my_settings(
    settings_in: schemas.UserSettingsUpdate,
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    return service.update_settings(db, current_user, settings_in)


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_my_account(
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    service.soft_delete_user(
        db=db,
        current_user=current_user,
        deleted_by_user_id=current_user.id,
    )
    return {"detail": "Account disattivato correttamente"}


@router.get("/me/yearly-goals/{tracker_type}", response_model=schemas.UserYearlyGoalResponse)
def get_my_yearly_goals(
    tracker_type: str,
    year: int,
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db)
):
    """Restituisce l'obiettivo annuale per un determinato tracker_type e anno, 
    ereditando eventualmente quello dell'anno precedente se non è stato sovrascritto.
    Ritorna 404 se non esiste alcun record per l'anno in corso o passati.
    """
    goal = service.get_yearly_goal(db, current_user.id, tracker_type, year)
    if not goal:
        # Fallback value if no goal is ever set, or simply return 404
        # We'll return 404 so the frontend knows there's no data
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Nessun obiettivo trovato per questo tracker")
    return goal


@router.put("/me/yearly-goals/{tracker_type}", response_model=schemas.UserYearlyGoalResponse)
def set_my_yearly_goal(
    tracker_type: str,
    year: int,
    goal_in: schemas.UserYearlyGoalUpdate,
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db)
):
    """Imposta o aggiorna l'obiettivo annuale per un determinato tracker e anno.
    Se esiste già un record per l'anno specificato, lo aggiorna.
    Se non esiste (stiamo ereditando da un anno precedente), crea un nuovo record 
    per l'anno richiesto senza toccare i dati degli anni precedenti.
    """
    return service.set_yearly_goal(db, current_user.id, tracker_type, year, goal_in.goal_value)