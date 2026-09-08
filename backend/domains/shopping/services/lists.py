"""
Services per ShoppingList e ShoppingListItem.
Regole di business: ownership lista, coerenza prodotto, stato acquisto.
"""

from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.domains.shopping import repository as repo
from backend.domains.shopping import schemas
from backend.domains.shopping.models import ShoppingList, ShoppingListItem, ShoppingProduct
from backend.domains.users.models import User
from .common import _now

_LIST_NOT_FOUND = "Lista non trovata o non accessibile"
_ITEM_NOT_FOUND = "Articolo non trovato o non accessibile"


# --- Lists ---

def get_or_create_default_list(db: Session, current_user: User) -> ShoppingList:
    default_list = repo.get_default_list(db, current_user.id)
    if not default_list:
        now = _now()
        default_list = ShoppingList(
            owner_id=current_user.id,
            visibility_id=1,
            status_id=1,
            name="Senza lista",
            is_completed=False,
            is_default=True,
            created_at=now,
            updated_at=now,
        )
        repo.add(db, default_list)
        repo.commit(db)
        repo.refresh(db, default_list)
    return default_list


def list_lists(db: Session, current_user: User) -> List[ShoppingList]:
    # Garantisce che la lista predefinita 'Senza lista' sia sempre presente per l'utente
    get_or_create_default_list(db, current_user)
    return repo.list_lists(db, current_user.id)


def create_list(
    db: Session,
    current_user: User,
    list_in: schemas.ShoppingListCreate,
) -> ShoppingList:
    now = _now()
    db_list = ShoppingList(
        owner_id=current_user.id,
        group_id=list_in.group_id,
        visibility_id=list_in.visibility_id,
        status_id=list_in.status_id or list_in.visibility_id,
        name=list_in.name,
        description=list_in.description,
        is_completed=bool(list_in.is_completed),
        pin_status=list_in.pin_status,
        is_default=bool(list_in.is_default),
        created_at=now,
        updated_at=now,
    )

    repo.add(db, db_list)
    repo.commit(db)
    repo.refresh(db, db_list)
    return db_list


def update_list(
    db: Session,
    current_user: User,
    list_id: int,
    list_in: schemas.ShoppingListUpdate,
) -> ShoppingList:
    db_list = repo.get_list_owned(db, list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=404, detail=_LIST_NOT_FOUND)

    if db_list.is_default:
        # Se è la lista di sistema 'Senza lista', blocca l'assegnazione a un gruppo o visibilità diversa da privata
        if list_in.group_id is not None:
            raise HTTPException(
                status_code=400,
                detail="La lista predefinita 'Senza lista' deve rimanere personale e non può essere associata a un gruppo.",
            )
        if list_in.visibility_id is not None and list_in.visibility_id != 1:
            raise HTTPException(
                status_code=400,
                detail="La lista predefinita 'Senza lista' deve rimanere privata.",
            )

    for field, value in list_in.model_dump(exclude_unset=True).items():
        setattr(db_list, field, value)
    db_list.updated_at = _now()

    repo.commit(db)
    repo.refresh(db, db_list)
    return db_list


def delete_list(db: Session, current_user: User, list_id: int) -> None:
    db_list = repo.get_list_owned(db, list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=404, detail=_LIST_NOT_FOUND)
    if db_list.is_default:
        raise HTTPException(
            status_code=400,
            detail="Impossibile eliminare la lista predefinita di sistema",
        )
    repo.delete(db, db_list)


# --- Items ---

def list_items(
    db: Session,
    current_user: User,
    is_purchased: Optional[bool] = None,
    shopping_list_id: Optional[int] = None,
) -> List[ShoppingListItem]:
    return repo.list_items(db, current_user.id, shopping_list_id, is_purchased)


def create_item(
    db: Session,
    current_user: User,
    item_in: schemas.ShoppingListItemCreate,
) -> ShoppingListItem:
    db_list = repo.get_list_owned(db, item_in.shopping_list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=404, detail=_LIST_NOT_FOUND)

    db_product = repo.get_product(db, item_in.product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Prodotto non trovato")

    now = _now()
    db_item = ShoppingListItem(
        shopping_list_id=item_in.shopping_list_id,
        product_id=db_product.id,
        quantity=item_in.quantity,
        unit_id=item_in.unit_id,
        notes=item_in.notes,
        is_purchased=False,
        created_at=now,
        updated_at=now,
        created_by_user_id=current_user.id,
        updated_by_user_id=current_user.id,
    )
    repo.add(db, db_item)
    repo.commit(db)
    repo.refresh(db, db_item)
    return db_item


def update_item(
    db: Session,
    current_user: User,
    item_id: int,
    item_in: schemas.ShoppingListItemUpdate,
) -> ShoppingListItem:
    db_item = repo.get_item_owned(db, item_id, current_user.id)
    if not db_item:
        raise HTTPException(status_code=404, detail=_ITEM_NOT_FOUND)

    update_data = item_in.model_dump(exclude_unset=True)

    if "shopping_list_id" in update_data and update_data["shopping_list_id"] is not None:
        target_list_id = update_data["shopping_list_id"]
        target_list = repo.get_list_owned(db, target_list_id, current_user.id)
        if not target_list:
            raise HTTPException(status_code=404, detail="Lista di destinazione non trovata o non accessibile")

    if "product_id" in update_data and update_data["product_id"] is not None:
        db_product = repo.get_product(db, update_data["product_id"])
        if not db_product:
            raise HTTPException(status_code=404, detail="Prodotto non trovato")

    for field, value in update_data.items():
        setattr(db_item, field, value)

    db_item.updated_at = _now()
    db_item.updated_by_user_id = current_user.id

    repo.commit(db)
    repo.refresh(db, db_item)
    return db_item


def delete_item(db: Session, current_user: User, item_id: int) -> None:
    db_item = repo.get_item_owned(db, item_id, current_user.id)
    if not db_item:
        raise HTTPException(status_code=404, detail=_ITEM_NOT_FOUND)
    repo.delete(db, db_item)