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
from backend.domains.countdowns.models import Countdown
from backend.domains.events.models import Event
from backend.domains.habits.models import Habit, HabitLog, HabitPeriod
from backend.domains.notifications import schemas as notif_schemas, service as notif_service
from backend.domains.shopping.models.groups import ShoppingGroup, ShoppingGroupMember
from backend.domains.tasks.models import Task
from backend.domains.trackers.models import (
    MediaList,
    MediaListItem,
    MovieQuote,
    TMDBEpisode,
    TMDBMovie,
    TMDBSeries,
    TVQuote,
    UserEpisodeLog,
    UserMovieLog,
    UserTVPlatform,
)
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


@router.post("/maintenance/dump-seeds")
def dump_seeds_by_admin(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Rigenera tutti i 7 file CSV di seed estraendo lo stato reale e attuale del DB."""
    from backend.core.seed_exporter import dump_all_seeds_from_db

    try:
        result = dump_all_seeds_from_db(db)
        return {
            "status": "success",
            "message": "File di seed CSV rigenerati e archiviati con successo!",
            "data": result,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante la generazione dei file di seed: {exc}",
        )


@router.get("/maintenance/download-seeds-zip")
def download_seeds_zip_by_admin(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Genera e scarica direttamente un archivio ZIP contenente tutti i file di seed attuali."""
    from fastapi.responses import StreamingResponse
    from backend.core.seed_exporter import create_seeds_zip_in_memory

    try:
        zip_buf = create_seeds_zip_in_memory(db)
        timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"seeds_snapshot_{timestamp_str}.zip"

        return StreamingResponse(
            zip_buf,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante la creazione del pacchetto ZIP dei seed: {exc}",
        )


# ---------------------------------------------------------------------------
# BACKUP & RESTORE GENERALE DATABASE SU NAS
# ---------------------------------------------------------------------------

class CreateBackupPayload(BaseModel):
    note: Optional[str] = None
    subdir: Optional[str] = None


class RestoreBackupPayload(BaseModel):
    filename: str


@router.post("/maintenance/database-backup")
def trigger_database_backup(
    payload: Optional[CreateBackupPayload] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Crea un backup completo e compresso (.json.gz) dell'intero database."""
    from backend.core.backup_manager import create_full_database_backup

    try:
        note = payload.note if payload else None
        subdir = payload.subdir if payload else None
        res = create_full_database_backup(db, note=note, subdir=subdir)
        return {
            "status": "success",
            "message": f"Backup creato con successo: {res['filename']} ({res['size_kb']} KB, {res['total_records']} record)",
            "data": res,
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante la creazione del backup del database: {exc}",
        )


@router.get("/maintenance/database-backups")
def get_database_backups(
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce l'elenco cronologico di tutti i file di backup presenti (database, daily, weekly)."""
    from backend.core.backup_manager import list_database_backups

    try:
        backups = list_database_backups()
        return backups
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore lettura archivio backup: {exc}",
        )


@router.get("/maintenance/database-backups/{filename}/download")
def download_database_backup(
    filename: str,
    current_user: User = Depends(deps.require_superuser),
):
    """Scarica sul PC un file di backup .json.gz cercandolo in tutte le cartelle di backup."""
    from fastapi.responses import FileResponse
    from backend.core.backup_manager import find_backup_file

    file_path = find_backup_file(filename)
    if not file_path or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File di backup non trovato")

    return FileResponse(
        path=str(file_path),
        media_type="application/gzip",
        filename=filename,
    )


@router.delete("/maintenance/database-backups/{filename}")
def remove_database_backup(
    filename: str,
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un file di backup."""
    from backend.core.backup_manager import delete_database_backup

    success = delete_database_backup(filename)
    if not success:
        raise HTTPException(status_code=404, detail="File non trovato o eliminazione non consentita")
    return {"message": f"Backup {filename} rimosso con successo."}


@router.post("/maintenance/database-restore")
def trigger_database_restore(
    payload: RestoreBackupPayload,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Ripristina integralmente il database dal file di backup selezionato."""
    from backend.core.backup_manager import restore_full_database_backup

    try:
        res = restore_full_database_backup(db, payload.filename)
        return res
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore durante il ripristino del database: {exc}",
        )




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
    tasks_count: int = 0
    events_count: int = 0

    class Config:
        from_attributes = True


class AdminCategoryUpdate(BaseModel):
    category_name: Optional[str] = Field(None, min_length=1, max_length=50)
    colore: Optional[str] = Field(None, max_length=7)
    genre: Optional[int] = Field(None, ge=1, le=5)


class AdminHabitItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    titolo: str
    tipo: str  # 'A' = Abitudine, 'R' = Routine
    rrule: Optional[str] = None
    target: int = 1
    logs_count: int = 0

    class Config:
        from_attributes = True


class AdminHabitUpdate(BaseModel):
    titolo: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[str] = Field(None, pattern=r"^[AR]$")
    rrule: Optional[str] = Field(None, max_length=255)
    target: Optional[int] = Field(None, ge=1, le=100)


class AdminCountdownItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    title: str
    target_date: datetime
    status: str
    created_at: datetime
    closed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminCountdownUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    target_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern=r"^(active|closed)$")


class AdminViewingPlatformItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    name: str
    usage_count: int = 0

    class Config:
        from_attributes = True


class AdminViewingPlatformUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class AdminMediaListItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    name: str
    description: Optional[str] = None
    visibility: str
    items_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminMediaListUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    visibility: Optional[str] = None


class AdminMediaQuoteItem(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    media_type: str  # 'tv' | 'movie'
    media_title: str
    quote_text: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminMediaQuoteUpdate(BaseModel):
    quote_text: str = Field(..., min_length=1)


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
    """Restituisce le categorie utente con i conteggi per l'amministrazione e i filtri."""
    cats = (
        db.query(UserCategory)
        .options(selectinload(UserCategory.user))
        .order_by(UserCategory.category_name.asc())
        .all()
    )
    task_counts = dict(
        db.query(Task.user_category_id, func.count(Task.id))
        .filter(Task.user_category_id.isnot(None))
        .group_by(Task.user_category_id)
        .all()
    )
    event_counts = dict(
        db.query(Event.user_category_id, func.count(Event.id))
        .filter(Event.user_category_id.isnot(None))
        .group_by(Event.user_category_id)
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
            tasks_count=task_counts.get(c.id, 0),
            events_count=event_counts.get(c.id, 0),
        )
        for c in cats
    ]


@router.patch("/categories/{category_id}", response_model=AdminCategoryItem)
def update_admin_category(
    category_id: int,
    cat_in: AdminCategoryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere nome, colore o genere di una categoria o tag di qualsiasi utente."""
    cat = db.query(UserCategory).options(selectinload(UserCategory.user)).filter(UserCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria non trovata")

    update_data = cat_in.model_dump(exclude_unset=True)

    if "category_name" in update_data and update_data["category_name"] is not None:
        normalized = " ".join(update_data["category_name"].strip().lower().split())
        target_genre = update_data.get("genre", cat.genre)
        existing = (
            db.query(UserCategory)
            .filter(
                UserCategory.user_id == cat.user_id,
                UserCategory.category_name == normalized,
                UserCategory.genre == target_genre,
                UserCategory.id != cat.id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"L'utente ha già una voce denominata '{normalized}' in questo ambito.",
            )
        cat.category_name = normalized

    if "colore" in update_data:
        cat.colore = update_data["colore"]

    if "genre" in update_data and update_data["genre"] is not None:
        cat.genre = update_data["genre"]

    db.commit()
    db.refresh(cat)

    tasks_count = db.query(func.count(Task.id)).filter(Task.user_category_id == cat.id).scalar() or 0
    events_count = db.query(func.count(Event.id)).filter(Event.user_category_id == cat.id).scalar() or 0

    return AdminCategoryItem(
        id=cat.id,
        user_id=cat.user_id,
        username=cat.user.username if cat.user else f"User #{cat.user_id}",
        category_name=cat.category_name,
        colore=cat.colore,
        genre=cat.genre,
        tasks_count=tasks_count,
        events_count=events_count,
    )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_category(
    category_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina una categoria/tag scollegando in sicurezza le task e gli eventi associati."""
    cat = db.query(UserCategory).filter(UserCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria non trovata")

    # Scollega tasks ed events prima dell'eliminazione
    db.query(Task).filter(Task.user_category_id == cat.id).update({Task.user_category_id: None})
    db.query(Event).filter(Event.user_category_id == cat.id).update({Event.user_category_id: None})

    db.delete(cat)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# AMMINISTRAZIONE: AVVISI DI SISTEMA & BROADCAST
# ---------------------------------------------------------------------------

@router.get("/broadcasts", response_model=List[notif_schemas.SystemBroadcastResponse])
def list_admin_broadcasts(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce lo storico degli avvisi broadcast di sistema."""
    return notif_service.list_broadcasts(db)


@router.post("/broadcasts", response_model=notif_schemas.SystemBroadcastResponse, status_code=status.HTTP_201_CREATED)
def create_admin_broadcast(
    payload: notif_schemas.SystemBroadcastCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Crea e attiva un nuovo avviso broadcast inviando pop-up e/o notifica inbox."""
    return notif_service.create_broadcast(db, current_user, payload)


@router.post("/broadcasts/{broadcast_id}/deactivate", response_model=notif_schemas.SystemBroadcastResponse)
def deactivate_admin_broadcast(
    broadcast_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Disattiva un avviso broadcast attivo (es. al termine dei lavori di manutenzione)."""
    return notif_service.deactivate_broadcast(db, broadcast_id)


@router.delete("/broadcasts/{broadcast_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_broadcast(
    broadcast_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un avviso dallo storico."""
    notif_service.delete_broadcast(db, broadcast_id)


# ---------------------------------------------------------------------------
# AMMINISTRAZIONE: ABITUDINI & ROUTINE
# ---------------------------------------------------------------------------

@router.get("/habits", response_model=List[AdminHabitItem])
def list_admin_habits(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutte le abitudini e routine degli utenti per la sanatoria."""
    habits = (
        db.query(Habit)
        .options(selectinload(Habit.user), selectinload(Habit.periods))
        .order_by(Habit.titolo.asc())
        .all()
    )
    log_counts = dict(
        db.query(HabitLog.habit_id, func.count(HabitLog.id))
        .group_by(HabitLog.habit_id)
        .all()
    )
    results: List[AdminHabitItem] = []
    for h in habits:
        target = h.periods[0].target if h.periods else 1
        results.append(
            AdminHabitItem(
                id=h.id,
                user_id=h.user_id,
                username=h.user.username if h.user else f"User #{h.user_id}",
                titolo=h.titolo,
                tipo=h.tipo,
                rrule=h.rrule,
                target=target,
                logs_count=log_counts.get(h.id, 0),
            )
        )
    return results


@router.patch("/habits/{habit_id}", response_model=AdminHabitItem)
def update_admin_habit(
    habit_id: int,
    payload: AdminHabitUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere titolo, tipo o parametri di un'abitudine o routine."""
    habit = db.query(Habit).options(selectinload(Habit.user), selectinload(Habit.periods)).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Abitudine/Routine non trovata")

    update_data = payload.model_dump(exclude_unset=True)
    if "titolo" in update_data and update_data["titolo"] is not None:
        habit.titolo = update_data["titolo"].strip()
    if "tipo" in update_data and update_data["tipo"] is not None:
        habit.tipo = update_data["tipo"]
    if "rrule" in update_data:
        habit.rrule = update_data["rrule"]
    if "target" in update_data and update_data["target"] is not None:
        if habit.periods:
            habit.periods[0].target = update_data["target"]
        else:
            p = HabitPeriod(habit_id=habit.id, data_inizio=datetime.now(timezone.utc).date(), target=update_data["target"])
            db.add(p)

    db.commit()
    db.refresh(habit)

    logs_count = db.query(func.count(HabitLog.id)).filter(HabitLog.habit_id == habit.id).scalar() or 0
    target = habit.periods[0].target if habit.periods else 1

    return AdminHabitItem(
        id=habit.id,
        user_id=habit.user_id,
        username=habit.user.username if habit.user else f"User #{habit.user_id}",
        titolo=habit.titolo,
        tipo=habit.tipo,
        rrule=habit.rrule,
        target=target,
        logs_count=logs_count,
    )


@router.delete("/habits/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_habit(
    habit_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un'abitudine/routine con cascade di periodi e log."""
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Abitudine non trovata")
    db.delete(habit)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# AMMINISTRAZIONE: CONTI ALLA ROVESCIA & TRAGUARDI
# ---------------------------------------------------------------------------

@router.get("/countdowns", response_model=List[AdminCountdownItem])
def list_admin_countdowns(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutti i conti alla rovescia / traguardi per la sanatoria."""
    countdowns = (
        db.query(Countdown)
        .options(selectinload(Countdown.user))
        .order_by(Countdown.target_date.asc())
        .all()
    )
    return [
        AdminCountdownItem(
            id=c.id,
            user_id=c.user_id,
            username=c.user.username if c.user else f"User #{c.user_id}",
            title=c.title,
            target_date=c.target_date,
            status=c.status,
            created_at=c.created_at,
            closed_at=c.closed_at,
        )
        for c in countdowns
    ]


@router.patch("/countdowns/{countdown_id}", response_model=AdminCountdownItem)
def update_admin_countdown(
    countdown_id: int,
    payload: AdminCountdownUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere titolo, data o stato di un countdown."""
    cd = db.query(Countdown).options(selectinload(Countdown.user)).filter(Countdown.id == countdown_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="Countdown non trovato")

    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data and update_data["title"] is not None:
        cd.title = update_data["title"].strip()
    if "target_date" in update_data and update_data["target_date"] is not None:
        cd.target_date = update_data["target_date"]
    if "status" in update_data and update_data["status"] is not None:
        cd.status = update_data["status"]
        if cd.status == "closed" and not cd.closed_at:
            cd.closed_at = datetime.now(timezone.utc)
        elif cd.status == "active":
            cd.closed_at = None

    cd.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(cd)

    return AdminCountdownItem(
        id=cd.id,
        user_id=cd.user_id,
        username=cd.user.username if cd.user else f"User #{cd.user_id}",
        title=cd.title,
        target_date=cd.target_date,
        status=cd.status,
        created_at=cd.created_at,
        closed_at=cd.closed_at,
    )


@router.delete("/countdowns/{countdown_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_countdown(
    countdown_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente un countdown."""
    cd = db.query(Countdown).filter(Countdown.id == countdown_id).first()
    if not cd:
        raise HTTPException(status_code=404, detail="Countdown non trovato")
    db.delete(cd)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# AMMINISTRAZIONE: TRACKERS & PIATTAFORME STREAMING / MEDIA
# ---------------------------------------------------------------------------

@router.get("/media/platforms", response_model=List[AdminViewingPlatformItem])
def list_admin_media_platforms(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutte le piattaforme di visione create dagli utenti con conteggio di utilizzo."""
    platforms = (
        db.query(UserTVPlatform)
        .options(selectinload(UserTVPlatform.user))
        .order_by(UserTVPlatform.name.asc())
        .all()
    )

    episodes_usage = dict(
        db.query(UserEpisodeLog.viewing_platform_id, func.count(UserEpisodeLog.id))
        .filter(UserEpisodeLog.viewing_platform_id.isnot(None))
        .group_by(UserEpisodeLog.viewing_platform_id)
        .all()
    )
    movies_usage = dict(
        db.query(UserMovieLog.viewing_platform_id, func.count(UserMovieLog.id))
        .filter(UserMovieLog.viewing_platform_id.isnot(None))
        .group_by(UserMovieLog.viewing_platform_id)
        .all()
    )

    results: List[AdminViewingPlatformItem] = []
    for p in platforms:
        usage = episodes_usage.get(p.id, 0) + movies_usage.get(p.id, 0)
        results.append(
            AdminViewingPlatformItem(
                id=p.id,
                user_id=p.user_id,
                username=p.user.username if p.user else f"User #{p.user_id}",
                name=p.name,
                usage_count=usage,
            )
        )
    return results


@router.patch("/media/platforms/{platform_id}", response_model=AdminViewingPlatformItem)
def update_admin_media_platform(
    platform_id: int,
    payload: AdminViewingPlatformUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere refusi o rinominare una piattaforma di visione."""
    platform = (
        db.query(UserTVPlatform)
        .options(selectinload(UserTVPlatform.user))
        .filter(UserTVPlatform.id == platform_id)
        .first()
    )
    if not platform:
        raise HTTPException(status_code=404, detail="Piattaforma di visione non trovata")

    platform.name = payload.name.strip()
    db.commit()
    db.refresh(platform)

    ep_count = db.query(func.count(UserEpisodeLog.id)).filter(UserEpisodeLog.viewing_platform_id == platform.id).scalar() or 0
    mov_count = db.query(func.count(UserMovieLog.id)).filter(UserMovieLog.viewing_platform_id == platform.id).scalar() or 0

    return AdminViewingPlatformItem(
        id=platform.id,
        user_id=platform.user_id,
        username=platform.user.username if platform.user else f"User #{platform.user_id}",
        name=platform.name,
        usage_count=ep_count + mov_count,
    )


@router.delete("/media/platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_media_platform(
    platform_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente una piattaforma di visione (disaccoppiamento sicuro con SET NULL su log)."""
    platform = db.query(UserTVPlatform).filter(UserTVPlatform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Piattaforma non trovata")

    db.delete(platform)
    db.commit()
    return None


@router.get("/media/lists", response_model=List[AdminMediaListItem])
def list_admin_media_lists(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutte le liste multimediali create dagli utenti con conteggio elementi."""
    lists = (
        db.query(MediaList)
        .options(selectinload(MediaList.user))
        .order_by(MediaList.name.asc())
        .all()
    )

    items_counts = dict(
        db.query(MediaListItem.list_id, func.count(MediaListItem.id))
        .group_by(MediaListItem.list_id)
        .all()
    )

    results: List[AdminMediaListItem] = []
    for ml in lists:
        results.append(
            AdminMediaListItem(
                id=ml.id,
                user_id=ml.user_id,
                username=ml.user.username if ml.user else f"User #{ml.user_id}",
                name=ml.name,
                description=ml.description,
                visibility=ml.visibility,
                items_count=items_counts.get(ml.id, 0),
                created_at=ml.created_at,
                updated_at=ml.updated_at,
            )
        )
    return results


@router.patch("/media/lists/{list_id}", response_model=AdminMediaListItem)
def update_admin_media_list(
    list_id: int,
    payload: AdminMediaListUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere titolo, descrizione o visibilità di una lista multimediale."""
    ml = (
        db.query(MediaList)
        .options(selectinload(MediaList.user))
        .filter(MediaList.id == list_id)
        .first()
    )
    if not ml:
        raise HTTPException(status_code=404, detail="Lista multimediale non trovata")

    update_data = payload.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] is not None:
        ml.name = update_data["name"].strip()
    if "description" in update_data:
        ml.description = update_data["description"].strip() if update_data["description"] else None
    if "visibility" in update_data and update_data["visibility"] is not None:
        ml.visibility = update_data["visibility"]

    ml.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ml)

    items_count = db.query(func.count(MediaListItem.id)).filter(MediaListItem.list_id == ml.id).scalar() or 0

    return AdminMediaListItem(
        id=ml.id,
        user_id=ml.user_id,
        username=ml.user.username if ml.user else f"User #{ml.user_id}",
        name=ml.name,
        description=ml.description,
        visibility=ml.visibility,
        items_count=items_count,
        created_at=ml.created_at,
        updated_at=ml.updated_at,
    )


@router.delete("/media/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_media_list(
    list_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente una lista multimediale (cascade automatico sugli item)."""
    ml = db.query(MediaList).filter(MediaList.id == list_id).first()
    if not ml:
        raise HTTPException(status_code=404, detail="Lista multimediale non trovata")

    db.delete(ml)
    db.commit()
    return None


@router.get("/media/quotes", response_model=List[AdminMediaQuoteItem])
def list_admin_media_quotes(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Restituisce tutte le citazioni di serie TV e film per la correzione di refusi."""
    tv_quotes = (
        db.query(TVQuote)
        .options(
            selectinload(TVQuote.user),
            selectinload(TVQuote.tmdb_episode).selectinload(TMDBEpisode.series),
        )
        .order_by(TVQuote.created_at.desc())
        .all()
    )

    movie_quotes = (
        db.query(MovieQuote)
        .options(
            selectinload(MovieQuote.user),
            selectinload(MovieQuote.tmdb_movie),
        )
        .order_by(MovieQuote.created_at.desc())
        .all()
    )

    results: List[AdminMediaQuoteItem] = []
    for tq in tv_quotes:
        ep = tq.tmdb_episode
        s_title = ep.series.title if ep and ep.series else "Serie TV"
        ep_label = f"S{ep.season_number:02d}E{ep.episode_number:02d}" if ep else ""
        full_title = f"{s_title} ({ep_label})" if ep_label else s_title
        results.append(
            AdminMediaQuoteItem(
                id=tq.id,
                user_id=tq.user_id,
                username=tq.user.username if tq.user else f"User #{tq.user_id}",
                media_type="tv",
                media_title=full_title,
                quote_text=tq.quote_text,
                created_at=tq.created_at,
                updated_at=tq.updated_at,
            )
        )

    for mq in movie_quotes:
        m = mq.tmdb_movie
        m_title = m.title if m else f"Film #{mq.movie_tmdb_id}"
        results.append(
            AdminMediaQuoteItem(
                id=mq.id,
                user_id=mq.user_id,
                username=mq.user.username if mq.user else f"User #{mq.user_id}",
                media_type="movie",
                media_title=m_title,
                quote_text=mq.quote_text,
                created_at=mq.created_at,
                updated_at=mq.updated_at,
            )
        )

    results.sort(key=lambda x: x.created_at, reverse=True)
    return results


@router.patch("/media/quotes/{media_type}/{quote_id}", response_model=AdminMediaQuoteItem)
def update_admin_media_quote(
    media_type: str,
    quote_id: int,
    payload: AdminMediaQuoteUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Permette all'admin di correggere il testo di una citazione di serie TV o film."""
    if media_type == "tv":
        tq = (
            db.query(TVQuote)
            .options(
                selectinload(TVQuote.user),
                selectinload(TVQuote.tmdb_episode).selectinload(TMDBEpisode.series),
            )
            .filter(TVQuote.id == quote_id)
            .first()
        )
        if not tq:
            raise HTTPException(status_code=404, detail="Citazione TV non trovata")
        tq.quote_text = payload.quote_text.strip()
        tq.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(tq)

        ep = tq.tmdb_episode
        s_title = ep.series.title if ep and ep.series else "Serie TV"
        ep_label = f"S{ep.season_number:02d}E{ep.episode_number:02d}" if ep else ""
        return AdminMediaQuoteItem(
            id=tq.id,
            user_id=tq.user_id,
            username=tq.user.username if tq.user else f"User #{tq.user_id}",
            media_type="tv",
            media_title=f"{s_title} ({ep_label})" if ep_label else s_title,
            quote_text=tq.quote_text,
            created_at=tq.created_at,
            updated_at=tq.updated_at,
        )

    elif media_type == "movie":
        mq = (
            db.query(MovieQuote)
            .options(
                selectinload(MovieQuote.user),
                selectinload(MovieQuote.tmdb_movie),
            )
            .filter(MovieQuote.id == quote_id)
            .first()
        )
        if not mq:
            raise HTTPException(status_code=404, detail="Citazione Film non trovata")
        mq.quote_text = payload.quote_text.strip()
        mq.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(mq)

        m = mq.tmdb_movie
        return AdminMediaQuoteItem(
            id=mq.id,
            user_id=mq.user_id,
            username=mq.user.username if mq.user else f"User #{mq.user_id}",
            media_type="movie",
            media_title=m.title if m else f"Film #{mq.movie_tmdb_id}",
            quote_text=mq.quote_text,
            created_at=mq.created_at,
            updated_at=mq.updated_at,
        )
    else:
        raise HTTPException(status_code=400, detail="media_type deve essere 'tv' o 'movie'")


@router.delete("/media/quotes/{media_type}/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_media_quote(
    media_type: str,
    quote_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    """Elimina definitivamente una citazione TV o film."""
    if media_type == "tv":
        tq = db.query(TVQuote).filter(TVQuote.id == quote_id).first()
        if not tq:
            raise HTTPException(status_code=404, detail="Citazione TV non trovata")
        db.delete(tq)
        db.commit()
    elif media_type == "movie":
        mq = db.query(MovieQuote).filter(MovieQuote.id == quote_id).first()
        if not mq:
            raise HTTPException(status_code=404, detail="Citazione Film non trovata")
        db.delete(mq)
        db.commit()
    else:
        raise HTTPException(status_code=400, detail="media_type deve essere 'tv' o 'movie'")
    return None



