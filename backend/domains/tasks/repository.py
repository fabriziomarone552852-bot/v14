"""Repository del dominio Tasks — solo accesso ai dati."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session, selectinload

from backend.domains.tasks.models import Task
from backend.domains.users.models import User


def _with_relations(query):
    return query.options(selectinload(Task.category), selectinload(Task.subtasks))


def list_active(db: Session, user_id: int, lookback_days: int = 90) -> List[Task]:
    threshold = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    query = (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .filter(
            or_(
                Task.fatto.is_(False),
                and_(Task.fatto.is_(True), Task.data_fatto >= threshold),
            )
        )
    )
    return _with_relations(query).all()


def get_with_relations(db: Session, task_id: int) -> Optional[Task]:
    return _with_relations(db.query(Task).filter(Task.id == task_id)).first()


def get_family(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    return _with_relations(
        db.query(Task).filter(Task.id == task_id, Task.user_id == user_id)
    ).first()


def add(db: Session, task: Task) -> Task:
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def commit(db: Session) -> None:
    db.commit()


def delete(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


def get_owned(task_id: int, current_user: User, db: Session) -> Task:
    """Recupera un task verificando che appartenga all'utente. Solleva 404 se non trovato."""
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    task = db.execute(stmt).scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task non trovato o non accessibile",
        )
    return task


def would_create_cycle(
    task_id: int,
    new_parent_id: int | None,
    current_user: User,
    db: Session,
) -> bool:
    """Verifica se impostare new_parent_id come genitore di task_id creerebbe un ciclo."""
    if new_parent_id is None:
        return False
    if task_id == new_parent_id:
        return True

    ancestor_cte = (
        select(Task.id, Task.parent_id)
        .where(Task.id == new_parent_id, Task.user_id == current_user.id)
        .cte(name="cycle_ancestors", recursive=True)
    )
    recursive_part = (
        select(Task.id, Task.parent_id)
        .join(ancestor_cte, Task.id == ancestor_cte.c.parent_id)
        .where(Task.user_id == current_user.id)
    )
    ancestor_cte = ancestor_cte.union_all(recursive_part)
    cycle_query = select(ancestor_cte.c.id).where(ancestor_cte.c.id == task_id)
    return db.execute(cycle_query).first() is not None
