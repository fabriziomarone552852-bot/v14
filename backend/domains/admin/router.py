import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session, selectinload

from backend.core import deps
from backend.core.sequence_sync import sync_all_table_sequences
from backend.domains.admin import service
from backend.domains.categories.models import UserCategory
from backend.domains.config.models import Config
from backend.domains.events.models import Event
from backend.domains.shopping.models.groups import ShoppingGroup, ShoppingGroupMember
from backend.domains.tasks.models import Task
from backend.domains.users import schemas as user_schemas
from backend.domains.users.models import User

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(deps.require_superuser)],
)


class AdminUserItem(BaseModel):
    id: int
    username: str
    email: str
    is_superuser: bool
    must_change_password: bool = False
    max_subtask_depth_user: Optional[int] = 3
    tasks_count: int = 0
    events_count: int = 0
    shopping_groups_count: int = 0
    deleted_at: Optional[datetime] = None
    deleted_by_user_id: Optional[int] = None
    deleted_by_username: Optional[str] = None
    default_startup_page: Optional[str] = None
    module_preferences: Optional[dict] = None

    class Config:
        from_attributes = True


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_superuser: Optional[bool] = None
    max_subtask_depth_user: Optional[int] = Field(None, ge=1, le=10)
    must_change_password: Optional[bool] = None
    module_preferences: Optional[dict] = None


class AdminResetPasswordPayload(BaseModel):
    new_password: str = Field(..., min_length=4)
    must_change_password: bool = False


class TransferOwnershipPayload(BaseModel):
    group_id: int
    new_owner_id: int


class OrphanedGroupItem(BaseModel):
    id: int
    name: str
    owner_id: int
    owner_username: str
    owner_deleted_at: Optional[datetime] = None
    members_count: int = 0
    members: List[Dict[str, Any]] = []


class SystemDiagnosticsResponse(BaseModel):
    db_status: str
    db_dialect: str
    db_latency_ms: float
    users_total: int
    users_active: int
    users_deleted: int
    system_max_subtask_depth: int
    uploads_total_size_mb: float
    uploads_files_count: int
    server_time: str


@router.get("/ping")
def admin_ping():
    return service.get_admin_ping()


@router.get("/users", response_model=List[AdminUserItem])
def list_system_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    users = db.query(User).order_by(User.id.asc()).all()
    user_map = {u.id: u.username for u in users}

    results = []
    for u in users:
        tasks_c = db.query(func.count(Task.id)).filter(Task.user_id == u.id).scalar() or 0
        events_c = db.query(func.count(Event.id)).filter(Event.user_id == u.id).scalar() or 0
        groups_c = db.query(func.count(ShoppingGroupMember.id)).filter(ShoppingGroupMember.user_id == u.id).scalar() or 0

        del_by_name = user_map.get(u.deleted_by_user_id) if u.deleted_by_user_id else None

        results.append(
            AdminUserItem(
                id=u.id,
                username=u.username,
                email=u.email,
                is_superuser=u.is_superuser,
                must_change_password=u.must_change_password,
                max_subtask_depth_user=u.max_subtask_depth_user,
                tasks_count=tasks_c,
                events_count=events_c,
                shopping_groups_count=groups_c,
                deleted_at=u.deleted_at,
                deleted_by_user_id=u.deleted_by_user_id,
                deleted_by_username=del_by_name,
                default_startup_page=u.default_startup_page,
                module_preferences=u.module_preferences,
            )
        )
    return results


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
        if db_user.id == current_user.id and not user_in.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Non puoi revocare i privilegi di SuperUser al tuo stesso account",
            )
        db_user.is_superuser = user_in.is_superuser

    if user_in.max_subtask_depth_user is not None:
        db_user.max_subtask_depth_user = user_in.max_subtask_depth_user

    if user_in.must_change_password is not None:
        db_user.must_change_password = user_in.must_change_password

    if user_in.module_preferences is not None:
        db_user.module_preferences = user_in.module_preferences

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
    db_user.must_change_password = payload.must_change_password
    db.commit()
    return {
        "message": f"Password impostata con successo per l'utente {db_user.username}",
        "must_change_password": payload.must_change_password,
    }


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
        db_user.deleted_at = datetime.now(timezone.utc)
        db_user.deleted_by_user_id = current_user.id
    else:
        db_user.deleted_at = None
        db_user.deleted_by_user_id = None

    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/maintenance/sync-sequences")
def run_sync_sequences(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Riallinea tutte le sequenze autoincrement del database (PostgreSQL)."""
    try:
        synced = sync_all_table_sequences(db)
        return {
            "status": "success",
            "message": f"Sincronizzazione sequenze completata su {len(synced)} tabelle",
            "synced_tables": synced,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante la sincronizzazione delle sequenze: {exc}",
        )


@router.get("/maintenance/orphaned-groups", response_model=List[OrphanedGroupItem])
def get_orphaned_groups(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutti i gruppi spesa il cui proprietario è disattivato."""
    groups = (
        db.query(ShoppingGroup)
        .join(User, ShoppingGroup.owner_id == User.id)
        .filter(User.deleted_at.isnot(None), ShoppingGroup.deleted_at.is_(None))
        .all()
    )

    results = []
    for g in groups:
        members_data = []
        for m in g.members:
            if m.user and m.user.deleted_at is None:
                members_data.append({
                    "user_id": m.user_id,
                    "username": m.user.username,
                    "role_id": m.role_id,
                })
        results.append(
            OrphanedGroupItem(
                id=g.id,
                name=g.name,
                owner_id=g.owner_id,
                owner_username=g.owner.username if g.owner else "Sconosciuto",
                owner_deleted_at=g.owner.deleted_at if g.owner else None,
                members_count=len(g.members),
                members=members_data,
            )
        )
    return results


@router.post("/maintenance/transfer-group-ownership")
def transfer_group_ownership(
    payload: TransferOwnershipPayload,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Trasferisce la proprietà di un gruppo spesa orfano ad un nuovo utente attivo."""
    group = db.query(ShoppingGroup).filter(ShoppingGroup.id == payload.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Gruppo spesa non trovato")

    new_owner = db.query(User).filter(User.id == payload.new_owner_id, User.deleted_at.is_(None)).first()
    if not new_owner:
        raise HTTPException(status_code=404, detail="Nuovo utente proprietario non trovato o disattivato")

    # Aggiorna owner_id
    group.owner_id = new_owner.id

    # Aggiorna o inserisce il nuovo proprietario come membro
    member = db.query(ShoppingGroupMember).filter(
        ShoppingGroupMember.group_id == group.id,
        ShoppingGroupMember.user_id == new_owner.id,
    ).first()

    from backend.domains.config.models import ConfigCode
    owner_code = db.query(ConfigCode).filter(ConfigCode.code_type == "shopping_role", ConfigCode.code_value == "owner").first()
    owner_role_id = owner_code.id if owner_code else 1

    if member:
        member.role_id = owner_role_id
    else:
        new_member = ShoppingGroupMember(
            group_id=group.id,
            user_id=new_owner.id,
            role_id=owner_role_id,
            added_by_user_id=current_user.id,
        )
        db.add(new_member)

    db.commit()
    return {"message": f"Proprietà del gruppo '{group.name}' trasferita con successo all'utente {new_owner.username}"}


@router.delete("/maintenance/purge-user/{user_id}")
def purge_deleted_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un account già disattivato (soft-deleted)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Non puoi eliminare definitivamente il tuo stesso account")

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    if db_user.deleted_at is None:
        raise HTTPException(
            status_code=400,
            detail="L'utente deve prima essere disattivato (soft delete) prima di poter essere rimosso definitivamente.",
        )

    username = db_user.username
    db.delete(db_user)
    db.commit()
    return {"message": f"Utente '{username}' e dati associati eliminati definitivamente dal sistema."}


@router.get("/health/diagnostics", response_model=SystemDiagnosticsResponse)
def get_system_diagnostics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce le metriche diagnostiche del database e del sistema."""
    start_time = time.perf_counter()
    db.execute(text("SELECT 1")).scalar()
    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    bind = db.get_bind()
    dialect_name = bind.dialect.name if bind else "unknown"

    users_total = db.query(func.count(User.id)).scalar() or 0
    users_active = db.query(func.count(User.id)).filter(User.deleted_at.is_(None)).scalar() or 0
    users_deleted = users_total - users_active

    cfg_depth = db.query(Config).filter(Config.key == "max_subtask_depth").first()
    system_depth = int(cfg_depth.value) if cfg_depth and cfg_depth.value.isdigit() else 3

    # Calcolo storage uploads
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    total_size = 0
    file_count = 0
    if os.path.exists(uploads_dir):
        for root, _, files in os.walk(uploads_dir):
            for f in files:
                file_count += 1
                try:
                    total_size += os.path.getsize(os.path.join(root, f))
                except OSError:
                    pass

    total_size_mb = round(total_size / (1024 * 1024), 2)

    return SystemDiagnosticsResponse(
        db_status="Online / Healthy",
        db_dialect=dialect_name,
        db_latency_ms=latency_ms,
        users_total=users_total,
        users_active=users_active,
        users_deleted=users_deleted,
        system_max_subtask_depth=system_depth,
        uploads_total_size_mb=total_size_mb,
        uploads_files_count=file_count,
        server_time=datetime.now(timezone.utc).isoformat(),
    )


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


# ---------------------------------------------------------------------------
# SCHEMAS DATA GRID: EVENTI & ATTIVITÀ
# ---------------------------------------------------------------------------

class AdminEventItem(BaseModel):
    id: int
    user_id: int
    username: str
    titolo: str
    descrizione: Optional[str] = None
    data_inizio: datetime
    data_fine: Optional[datetime] = None
    tutto_il_giorno: bool = False
    luogo: Optional[str] = None
    user_category_id: Optional[int] = None
    category_name: Optional[str] = None
    rrule: Optional[str] = None

    class Config:
        from_attributes = True


class AdminEventUpdate(BaseModel):
    titolo: Optional[str] = None
    descrizione: Optional[str] = None
    data_inizio: Optional[datetime] = None
    data_fine: Optional[datetime] = None
    tutto_il_giorno: Optional[bool] = None
    luogo: Optional[str] = None
    user_category_id: Optional[int] = None
    user_id: Optional[int] = None
    rrule: Optional[str] = None


class AdminTaskItem(BaseModel):
    id: int
    user_id: int
    username: str
    titolo: str
    descrizione: Optional[str] = None
    data_start: datetime
    data_scadenza: Optional[datetime] = None
    priorita: str
    fatto: bool = False
    data_fatto: Optional[datetime] = None
    luogo: Optional[str] = None
    user_category_id: Optional[int] = None
    category_name: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class AdminTaskUpdate(BaseModel):
    titolo: Optional[str] = None
    descrizione: Optional[str] = None
    data_start: Optional[datetime] = None
    data_scadenza: Optional[datetime] = None
    priorita: Optional[str] = None
    fatto: Optional[bool] = None
    luogo: Optional[str] = None
    user_category_id: Optional[int] = None
    user_id: Optional[int] = None


class AdminCategoryItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    category_name: str
    colore: Optional[str] = None
    genre: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# DATA GRID AMMINISTRAZIONE: EVENTI
# ---------------------------------------------------------------------------

@router.get("/events", response_model=List[AdminEventItem])
def list_admin_events(
    user_id: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutti gli impegni per l'editing tabellare admin."""
    query = (
        db.query(Event)
        .options(selectinload(Event.user), selectinload(Event.category))
        .order_by(Event.data_inizio.desc())
    )
    if user_id is not None:
        query = query.filter(Event.user_id == user_id)

    events = query.all()
    results = []
    for ev in events:
        results.append(
            AdminEventItem(
                id=ev.id,
                user_id=ev.user_id,
                username=ev.user.username if ev.user else f"User #{ev.user_id}",
                titolo=ev.titolo,
                descrizione=ev.descrizione,
                data_inizio=ev.data_inizio,
                data_fine=ev.data_fine,
                tutto_il_giorno=ev.tutto_il_giorno,
                luogo=ev.luogo,
                user_category_id=ev.user_category_id,
                category_name=ev.category.category_name if ev.category else None,
                rrule=ev.rrule,
            )
        )
    return results


@router.patch("/events/{event_id}", response_model=AdminEventItem)
def update_admin_event(
    event_id: int,
    payload: AdminEventUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Aggiorna un impegno da console admin."""
    ev = (
        db.query(Event)
        .options(selectinload(Event.user), selectinload(Event.category))
        .filter(Event.id == event_id)
        .first()
    )
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Impegno non trovato")

    if payload.titolo is not None:
        val = payload.titolo.strip()
        if not val:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il titolo non può essere vuoto")
        ev.titolo = val

    if payload.descrizione is not None:
        ev.descrizione = payload.descrizione

    if payload.data_inizio is not None:
        ev.data_inizio = payload.data_inizio

    if payload.data_fine is not None:
        ev.data_fine = payload.data_fine

    if payload.tutto_il_giorno is not None:
        ev.tutto_il_giorno = payload.tutto_il_giorno

    if payload.luogo is not None:
        ev.luogo = payload.luogo

    if payload.user_id is not None:
        target_user = db.query(User).filter(User.id == payload.user_id).first()
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente assegnatario non trovato")
        ev.user_id = payload.user_id

    if payload.user_category_id is not None:
        if payload.user_category_id == 0:
            ev.user_category_id = None
        else:
            cat = db.query(UserCategory).filter(UserCategory.id == payload.user_category_id).first()
            if not cat:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria non trovata")
            ev.user_category_id = payload.user_category_id

    if payload.rrule is not None:
        ev.rrule = payload.rrule.strip() or None

    db.commit()
    db.refresh(ev)

    return AdminEventItem(
        id=ev.id,
        user_id=ev.user_id,
        username=ev.user.username if ev.user else f"User #{ev.user_id}",
        titolo=ev.titolo,
        descrizione=ev.descrizione,
        data_inizio=ev.data_inizio,
        data_fine=ev.data_fine,
        tutto_il_giorno=ev.tutto_il_giorno,
        luogo=ev.luogo,
        user_category_id=ev.user_category_id,
        category_name=ev.category.category_name if ev.category else None,
        rrule=ev.rrule,
    )


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un evento da console admin."""
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Impegno non trovato")
    db.delete(ev)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# DATA GRID AMMINISTRAZIONE: ATTIVITÀ / TASKS
# ---------------------------------------------------------------------------

@router.get("/tasks", response_model=List[AdminTaskItem])
def list_admin_tasks(
    user_id: Optional[int] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutte le attività per l'editing tabellare admin."""
    query = (
        db.query(Task)
        .options(selectinload(Task.user), selectinload(Task.category))
        .order_by(Task.id.desc())
    )
    if user_id is not None:
        query = query.filter(Task.user_id == user_id)

    tasks = query.all()
    results = []
    for t in tasks:
        results.append(
            AdminTaskItem(
                id=t.id,
                user_id=t.user_id,
                username=t.user.username if t.user else f"User #{t.user_id}",
                titolo=t.titolo,
                descrizione=t.descrizione,
                data_start=t.data_start,
                data_scadenza=t.data_scadenza,
                priorita=t.priorita.value if hasattr(t.priorita, 'value') else str(t.priorita),
                fatto=t.fatto,
                data_fatto=t.data_fatto,
                luogo=t.luogo,
                user_category_id=t.user_category_id,
                category_name=t.category.category_name if t.category else None,
                parent_id=t.parent_id,
            )
        )
    return results


@router.patch("/tasks/{task_id}", response_model=AdminTaskItem)
def update_admin_task(
    task_id: int,
    payload: AdminTaskUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Aggiorna un'attività da console admin."""
    t = (
        db.query(Task)
        .options(selectinload(Task.user), selectinload(Task.category))
        .filter(Task.id == task_id)
        .first()
    )
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attività non trovata")

    if payload.titolo is not None:
        val = payload.titolo.strip()
        if not val:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Il titolo non può essere vuoto")
        t.titolo = val

    if payload.descrizione is not None:
        t.descrizione = payload.descrizione

    if payload.data_start is not None:
        t.data_start = payload.data_start

    if payload.data_scadenza is not None:
        t.data_scadenza = payload.data_scadenza

    if payload.priorita is not None:
        t.priorita = payload.priorita

    if payload.fatto is not None:
        t.fatto = payload.fatto
        if payload.fatto and not t.data_fatto:
            t.data_fatto = datetime.now(timezone.utc)
        elif not payload.fatto:
            t.data_fatto = None

    if payload.luogo is not None:
        t.luogo = payload.luogo

    if payload.user_id is not None:
        target_user = db.query(User).filter(User.id == payload.user_id).first()
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utente assegnatario non trovato")
        t.user_id = payload.user_id

    if payload.user_category_id is not None:
        if payload.user_category_id == 0:
            t.user_category_id = None
        else:
            cat = db.query(UserCategory).filter(UserCategory.id == payload.user_category_id).first()
            if not cat:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria non trovata")
            t.user_category_id = payload.user_category_id

    db.commit()
    db.refresh(t)

    return AdminTaskItem(
        id=t.id,
        user_id=t.user_id,
        username=t.user.username if t.user else f"User #{t.user_id}",
        titolo=t.titolo,
        descrizione=t.descrizione,
        data_start=t.data_start,
        data_scadenza=t.data_scadenza,
        priorita=t.priorita.value if hasattr(t.priorita, 'value') else str(t.priorita),
        fatto=t.fatto,
        data_fatto=t.data_fatto,
        luogo=t.luogo,
        user_category_id=t.user_category_id,
        category_name=t.category.category_name if t.category else None,
        parent_id=t.parent_id,
    )


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_task(
    task_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un'attività da console admin."""
    t = db.query(Task).filter(Task.id == task_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attività non trovata")
    db.delete(t)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# DATA GRID AMMINISTRAZIONE: CATEGORIE UTENTE
# ---------------------------------------------------------------------------

@router.get("/categories", response_model=List[AdminCategoryItem])
def list_admin_categories(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce le categorie utente per l'assegnazione nei filtri e data grid."""
    cats = (
        db.query(UserCategory)
        .options(selectinload(UserCategory.user))
        .order_by(UserCategory.category_name.asc())
        .all()
    )
    return [
        AdminCategoryItem(
            id=c.id,
            user_id=c.user_id,
            username=c.user.username if c.user else f"User #{c.user_id}",
            category_name=c.category_name,
            colore=c.colore,
            genre=c.genre,
        )
        for c in cats
    ]

