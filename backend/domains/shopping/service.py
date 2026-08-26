"""Service del dominio Shopping — regole di business per gruppi, liste, prodotti, articoli, fornitori e inventario."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.core.seeders import register_seeder
from backend.domains.shopping import repository as repo
from backend.domains.shopping.models.catalog import ShoppingProduct, ShoppingSupplier

DEFAULT_SUPPLIERS = ["Coop", "Carni e Affini", "MD", "Lidl", "Eurospin", "Famila"]


def seed_default_shopping_suppliers_for_user(db: Session, user_id: int) -> None:
    """Popola i fornitori di spesa di default per l'utente specificato."""
    from backend.domains.config import repository as config_repo

    supplier_status_code = config_repo.get_config_code(db, "supplier_status", "active")
    if supplier_status_code is None:
        return

    repo.bulk_create_suppliers_if_missing(
        db=db,
        supplier_names=DEFAULT_SUPPLIERS,
        created_by_user_id=user_id,
        status_id=supplier_status_code.id,
    )
from backend.domains.shopping.models.groups import ShoppingGroup, ShoppingGroupMember
from backend.domains.shopping.models.inventory import InventoryBatch
from backend.domains.shopping.models.lists import ShoppingList, ShoppingListItem
from backend.domains.shopping.schemas.catalog import (
    ShoppingProductCreate,
    ShoppingProductUpdate,
    ShoppingSupplierCreate,
    ShoppingSupplierUpdate,
)
from backend.domains.shopping.schemas.config import ShoppingConfigBundle
from backend.domains.shopping.schemas.groups import (
    ShoppingGroupCreate,
    ShoppingGroupMemberCreate,
    ShoppingGroupMemberInvite,
    ShoppingGroupMemberRoleUpdate,
    ShoppingGroupUpdate,
)
from backend.domains.shopping.schemas.inventory import (
    InventoryBatchCreate,
    InventoryBatchUpdate,
    QuickPriceBatchCreate,
)
from backend.domains.shopping.schemas.lists import (
    ShoppingListCreate,
    ShoppingListItemCreate,
    ShoppingListItemUpdate,
    ShoppingListUpdate,
)
from backend.domains.users.models import User


_LIST_NOT_FOUND = "Lista non trovata o non accessibile"
_ITEM_NOT_FOUND = "Articolo non trovato o non accessibile"
_GROUP_NOT_FOUND = "Gruppo non trovato o non accessibile"
_MEMBER_NOT_FOUND = "Membro non trovato nel gruppo"
_USER_NOT_FOUND = "Utente non trovato"
_ROLE_NOT_FOUND = "Ruolo non valido"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _today() -> date:
    return date.today()


def _normalize_name(value: str) -> str:
    return repo.normalize_name(value)


# ------------------------------------------------------------------ Groups
def list_groups(db: Session, current_user: User) -> List[dict]:
    groups = repo.list_groups(db, current_user.id)
    res = []
    for g in groups:
        if g.owner_id == current_user.id:
            role = "owner"
        else:
            role = repo.get_user_role_code_in_group(db, g.id, current_user.id) or "reader"

        res.append({
            "id": g.id,
            "owner_id": g.owner_id,
            "name": g.name,
            "description": g.description,
            "icon": g.icon,
            "status_id": g.status_id,
            "user_role": role,
            "created_at": g.created_at,
            "updated_at": g.updated_at,
            "archived_at": g.archived_at,
            "deleted_at": g.deleted_at,
        })
    return res


def create_group(
    db: Session,
    current_user: User,
    group_in: ShoppingGroupCreate,
) -> ShoppingGroup:
    default_status_id = repo.active_group_status_id(db)
    if default_status_id is None:
        raise HTTPException(status_code=500, detail="ConfigCode group_status.active mancante")

    now = _now()
    db_group = ShoppingGroup(
        owner_id=current_user.id,
        name=group_in.name,
        description=group_in.description,
        icon=group_in.icon,
        status_id=group_in.status_id or default_status_id,
        created_at=now,
        updated_at=now,
    )

    return repo.create_group(db, db_group)


def update_group(
    db: Session,
    current_user: User,
    group_id: int,
    group_in: ShoppingGroupUpdate,
) -> ShoppingGroup:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)

    for field, value in group_in.model_dump(exclude_unset=True).items():
        setattr(db_group, field, value)
    db_group.updated_at = _now()

    return repo.update_group(db, db_group)


def archive_group(db: Session, current_user: User, group_id: int) -> dict:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)
    db_group.archived_at = _now()
    db_group.updated_at = _now()
    repo.update_group(db, db_group)
    return {
        "id": db_group.id,
        "owner_id": db_group.owner_id,
        "name": db_group.name,
        "description": db_group.description,
        "icon": db_group.icon,
        "status_id": db_group.status_id,
        "user_role": "owner",
        "created_at": db_group.created_at,
        "updated_at": db_group.updated_at,
        "archived_at": db_group.archived_at,
        "deleted_at": db_group.deleted_at,
    }


def unarchive_group(db: Session, current_user: User, group_id: int) -> dict:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)
    db_group.archived_at = None
    db_group.updated_at = _now()
    repo.update_group(db, db_group)
    return {
        "id": db_group.id,
        "owner_id": db_group.owner_id,
        "name": db_group.name,
        "description": db_group.description,
        "icon": db_group.icon,
        "status_id": db_group.status_id,
        "user_role": "owner",
        "created_at": db_group.created_at,
        "updated_at": db_group.updated_at,
        "archived_at": db_group.archived_at,
        "deleted_at": db_group.deleted_at,
    }


def delete_group(db: Session, current_user: User, group_id: int) -> None:
    db_group = repo.get_group_owned(db, group_id, current_user.id)

    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)
    repo.delete_group(db, db_group)


# ------------------------------------------------------------------ Group Members
def list_members(db: Session, current_user: User, group_id: int) -> List[ShoppingGroupMember]:
    group = repo.get_group_accessible(db, group_id, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)
    return repo.list_members(db, group_id)


def add_member(
    db: Session,
    current_user: User,
    group_id: int,
    member_in: ShoppingGroupMemberCreate,
) -> ShoppingGroupMember:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)

    existing_active = repo.get_member(db, group_id, member_in.user_id)
    if existing_active:
        raise HTTPException(status_code=400, detail="L'utente è già membro del gruppo.")

    now = _now()

    # Se esiste un record soft-deleted, riattivarlo
    existing_any = repo.get_member_any(db, group_id, member_in.user_id)
    if existing_any:
        existing_any.role_id = member_in.role_id
        existing_any.added_by_user_id = current_user.id
        existing_any.removed_at = None
        existing_any.updated_at = now
        return repo.update_member(db, existing_any)

    db_member = ShoppingGroupMember(
        group_id=group_id,
        user_id=member_in.user_id,
        role_id=member_in.role_id,
        added_by_user_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    return repo.add_member(db, db_member)



def invite_member(
    db: Session,
    current_user: User,
    group_id: int,
    invite_in: ShoppingGroupMemberInvite,
) -> ShoppingGroupMember:
    caller_role = repo.get_user_role_code_in_group(db, group_id, current_user.id)
    if caller_role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Solo gli owner o gli admin di gruppo possono invitare membri.")

    if caller_role == "admin" and invite_in.role_code in ("owner", "admin"):
        raise HTTPException(
            status_code=403,
            detail="Gli admin possono invitare solo utenti con ruolo editor o reader.",
        )

    target_user = repo.find_user_by_username_or_email(db, invite_in.username, invite_in.email)
    if not target_user:
        raise HTTPException(status_code=404, detail=_USER_NOT_FOUND)

    # Controlla se l'utente è già un membro attivo
    existing_active = repo.get_member(db, group_id, target_user.id)
    if existing_active:
        raise HTTPException(status_code=400, detail="L'utente è già membro del gruppo.")

    role_id = repo.resolve_role_id(db, invite_in.role_code)
    if role_id is None:
        raise HTTPException(status_code=400, detail=_ROLE_NOT_FOUND)

    now = _now()

    # Se esiste un record soft-deleted, riattivarlo invece di inserirne uno nuovo
    existing_any = repo.get_member_any(db, group_id, target_user.id)
    if existing_any:
        existing_any.role_id = role_id
        existing_any.added_by_user_id = current_user.id
        existing_any.removed_at = None
        existing_any.updated_at = now
        return repo.update_member(db, existing_any)

    db_member = ShoppingGroupMember(
        group_id=group_id,
        user_id=target_user.id,
        role_id=role_id,
        added_by_user_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    return repo.add_member(db, db_member)



def update_member_role(
    db: Session,
    current_user: User,
    group_id: int,
    user_id: int,
    role_in: ShoppingGroupMemberRoleUpdate,
) -> ShoppingGroupMember:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)

    db_member = repo.get_member(db, group_id, user_id)
    if not db_member:
        raise HTTPException(status_code=404, detail=_MEMBER_NOT_FOUND)

    role_id = repo.resolve_role_id(db, role_in.role_code)
    if role_id is None:
        raise HTTPException(status_code=400, detail=_ROLE_NOT_FOUND)

    db_member.role_id = role_id
    db_member.updated_at = _now()
    return repo.update_member(db, db_member)


def remove_member(db: Session, current_user: User, group_id: int, user_id: int) -> None:
    db_group = repo.get_group_owned(db, group_id, current_user.id)
    if not db_group:
        raise HTTPException(status_code=404, detail=_GROUP_NOT_FOUND)

    db_member = repo.get_member(db, group_id, user_id)
    if not db_member:
        raise HTTPException(status_code=404, detail=_MEMBER_NOT_FOUND)

    if db_member.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Non puoi rimuovere te stesso. Trasferisci la proprietà o elimina il gruppo.",
        )

    repo.remove_member(db, db_member)


# ------------------------------------------------------------------ Lists
def list_lists(db: Session, current_user: User) -> List[ShoppingList]:
    return repo.list_lists(db, current_user.id)


def create_list(db: Session, current_user: User, list_in: ShoppingListCreate) -> ShoppingList:
    default_status_id = repo.active_list_status_id(db)
    if default_status_id is None:
        raise HTTPException(status_code=500, detail="ConfigCode list_status.active mancante")

    now = _now()
    db_list = ShoppingList(
        owner_id=current_user.id,
        group_id=list_in.group_id,
        visibility_id=list_in.visibility_id,
        status_id=list_in.status_id or default_status_id,
        name=list_in.name,
        description=list_in.description,
        is_completed=bool(list_in.is_completed),
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
    list_in: ShoppingListUpdate,
) -> ShoppingList:
    db_list = repo.get_list_owned(db, list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=404, detail=_LIST_NOT_FOUND)

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
    repo.delete(db, db_list)


def _resolve_brand_id(
    db: Session,
    current_user: User,
    brand_name: Optional[str] = None,
    brand_id: Optional[int] = None,
) -> Optional[int]:
    if brand_id is not None and brand_id > 0:
        brand = repo.get_supplier(db, brand_id)
        if brand:
            return brand.id
    if brand_name:
        clean_name = brand_name.strip()
        if not clean_name:
            return None
        existing = repo.find_supplier_by_name(db, clean_name)
        if existing:
            if existing.type_code == 1:
                existing.type_code = 3
                existing.updated_at = _now()
                existing.updated_by_user_id = current_user.id
                repo.commit(db)
            return existing.id

        default_status_id = repo.active_supplier_status_id(db) or 1
        new_brand = ShoppingSupplier(
            name=clean_name,
            name_normalized=_normalize_name(clean_name),
            type_code=2,  # Brand
            status_id=default_status_id,
            created_by_user_id=current_user.id,
            updated_by_user_id=current_user.id,
            created_at=_now(),
            updated_at=_now(),
        )
        repo.add(db, new_brand)
        repo.commit(db)
        repo.refresh(db, new_brand)
        return new_brand.id
    return None


# ------------------------------------------------------------------ Items
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
    item_in: ShoppingListItemCreate,
) -> ShoppingListItem:
    db_list = repo.get_list_accessible(db, item_in.shopping_list_id, current_user.id)
    if not db_list:
        raise HTTPException(status_code=404, detail=_LIST_NOT_FOUND)

    if db_list.group_id:
        user_role = repo.get_user_role_code_in_group(db, db_list.group_id, current_user.id)
        if user_role in ("reader", "editor"):
            raise HTTPException(
                status_code=403,
                detail="Gli editor e i lettori non hanno i permessi per inserire nuovi articoli.",
            )

    normalized_name = _normalize_name(item_in.product_name)
    resolved_brand_id = _resolve_brand_id(
        db,
        current_user,
        brand_name=item_in.brand_name,
        brand_id=item_in.brand_id,
    )

    db_brand = repo.get_supplier(db, resolved_brand_id) if resolved_brand_id else None
    brand_suffix = f" ({db_brand.name_normalized})" if db_brand else ""
    list_item_normalized_name = f"{normalized_name}{brand_suffix}"

    existing_open = repo.get_open_item_by_list_and_name(db, db_list.id, list_item_normalized_name)
    if existing_open:
        raise HTTPException(
            status_code=409,
            detail="Esiste già un articolo aperto con questo prodotto nella lista.",
        )

    db_product = repo.get_or_create_product_by_name(
        db,
        normalized_name,
        current_user.id,
        brand_id=resolved_brand_id,
    )
    now = _now()

    db_item = ShoppingListItem(
        shopping_list_id=db_list.id,
        product_id=db_product.id,
        name_normalized=list_item_normalized_name,
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
    item_in: ShoppingListItemUpdate,
) -> ShoppingListItem:
    db_item = repo.get_item_accessible(db, item_id, current_user.id)
    if not db_item:
        raise HTTPException(status_code=404, detail=_ITEM_NOT_FOUND)

    if db_item.shopping_list and db_item.shopping_list.group_id:
        user_role = repo.get_user_role_code_in_group(db, db_item.shopping_list.group_id, current_user.id)
        if user_role == "reader":
            raise HTTPException(
                status_code=403,
                detail="I lettori non hanno i permessi per modificare gli articoli.",
            )
        is_only_toggling = set(item_in.model_dump(exclude_unset=True).keys()) <= {"is_purchased"}
        if db_item.is_purchased and not is_only_toggling and user_role != "owner":
            raise HTTPException(
                status_code=403,
                detail="Gli articoli già acquistati non possono essere modificati da questo ruolo.",
            )

    update_data = item_in.model_dump(exclude_unset=True)

    has_name_change = "product_name" in update_data and update_data["product_name"] is not None
    has_brand_change = ("brand_name" in update_data) or ("brand_id" in update_data)

    if has_name_change or has_brand_change:
        target_name = update_data.get("product_name") or (db_item.product.name_normalized if db_item.product else db_item.name_normalized)
        normalized_name = _normalize_name(target_name)

        if has_brand_change:
            target_brand_name = update_data.get("brand_name")
            target_brand_id = update_data.get("brand_id")
            resolved_brand_id = _resolve_brand_id(
                db,
                current_user,
                brand_name=target_brand_name,
                brand_id=target_brand_id,
            )
        else:
            resolved_brand_id = db_item.product.brand_id if db_item.product else None

        db_brand = repo.get_supplier(db, resolved_brand_id) if resolved_brand_id else None
        brand_suffix = f" ({db_brand.name_normalized})" if db_brand else ""
        list_item_normalized_name = f"{normalized_name}{brand_suffix}"

        existing_open = repo.get_open_item_by_list_and_name(
            db,
            db_item.shopping_list_id,
            list_item_normalized_name,
        )
        if existing_open and existing_open.id != db_item.id:
            raise HTTPException(
                status_code=409,
                detail="Esiste già un articolo aperto con questo prodotto nella lista.",
            )

        db_product = repo.get_or_create_product_by_name(
            db,
            normalized_name,
            current_user.id,
            brand_id=resolved_brand_id,
        )
        old_product_id = db_item.product_id
        db_item.product_id = db_product.id
        db_item.name_normalized = list_item_normalized_name

        if old_product_id != db_product.id:
            active_batches_to_update = (
                db.query(InventoryBatch)
                .filter(
                    InventoryBatch.list_item_id == db_item.id,
                    InventoryBatch.deleted_at.is_(None),
                )
                .all()
            )
            now_today = _today()
            for b in active_batches_to_update:
                b.product_id = db_product.id
                b.updated_at = now_today
                b.updated_by_user_id = current_user.id

        update_data.pop("product_name", None)
        update_data.pop("brand_name", None)
        update_data.pop("brand_id", None)

    for field, value in update_data.items():
        setattr(db_item, field, value)

    # Se l'articolo viene deselezionato (segnato come non acquistato), elimina i record dei prezzi/lotti collegati
    if update_data.get("is_purchased") is False:
        active_batches = (
            db.query(InventoryBatch)
            .filter(
                InventoryBatch.list_item_id == db_item.id,
                InventoryBatch.deleted_at.is_(None),
            )
            .all()
        )
        now_ts = _today()
        for batch in active_batches:
            batch.deleted_at = now_ts
            batch.deleted_by_user_id = current_user.id
            batch.updated_at = now_ts
            batch.updated_by_user_id = current_user.id

    db_item.updated_at = _now()
    db_item.updated_by_user_id = current_user.id

    repo.commit(db)
    repo.refresh(db, db_item)
    return db_item


def delete_item(db: Session, current_user: User, item_id: int) -> None:
    db_item = repo.get_item_accessible(db, item_id, current_user.id)
    if not db_item:
        raise HTTPException(status_code=404, detail=_ITEM_NOT_FOUND)

    if db_item.shopping_list and db_item.shopping_list.group_id:
        user_role = repo.get_user_role_code_in_group(db, db_item.shopping_list.group_id, current_user.id)
        if user_role != "owner":
            raise HTTPException(
                status_code=403,
                detail="Solo il proprietario (owner) del gruppo spesa può eliminare gli articoli.",
            )

    active_batches = (
        db.query(InventoryBatch)
        .filter(
            InventoryBatch.list_item_id == db_item.id,
            InventoryBatch.deleted_at.is_(None),
        )
        .all()
    )
    now_ts = _today()
    for batch in active_batches:
        batch.deleted_at = now_ts
        batch.deleted_by_user_id = current_user.id
        batch.updated_at = now_ts
        batch.updated_by_user_id = current_user.id

    repo.delete(db, db_item)



# ------------------------------------------------------------------ Suppliers
def list_suppliers(
    db: Session,
    current_user: User,
    search: Optional[str] = None,
    type_code: Optional[int] = None,
    limit: int = 20,
) -> List[ShoppingSupplier]:
    if search:
        return repo.search_suppliers(db, search=search, type_code=type_code, limit=limit)
    suppliers = repo.list_suppliers(db, type_code=type_code)
    return suppliers[:limit]


def list_brands(
    db: Session,
    current_user: User,
    search: Optional[str] = None,
    limit: int = 20,
) -> List[ShoppingSupplier]:
    return list_suppliers(db, current_user, search=search, type_code=2, limit=limit)


def create_supplier(
    db: Session,
    current_user: User,
    supplier_in: ShoppingSupplierCreate,
) -> ShoppingSupplier:
    existing = repo.find_supplier_by_name(db, supplier_in.name)
    if existing:
        target_type = supplier_in.type_code
        # Se esiste già ma con tipo diverso -> promuovi a 3 (Entrambi)
        if (existing.type_code == 1 and target_type == 2) or (existing.type_code == 2 and target_type == 1):
            existing.type_code = 3
            existing.updated_at = _now()
            existing.updated_by_user_id = current_user.id
            repo.commit(db)
            repo.refresh(db, existing)
            return existing
        elif target_type == 3 and existing.type_code != 3:
            existing.type_code = 3
            existing.updated_at = _now()
            existing.updated_by_user_id = current_user.id
            repo.commit(db)
            repo.refresh(db, existing)
            return existing
        else:
            raise HTTPException(status_code=400, detail="Esiste già un fornitore o brand con questo nome.")

    default_status_id = repo.active_supplier_status_id(db)
    if default_status_id is None:
        raise HTTPException(status_code=500, detail="ConfigCode supplier_status.active mancante")

    now = _now()
    db_supplier = ShoppingSupplier(
        name_normalized=_normalize_name(supplier_in.name),
        type_code=supplier_in.type_code,
        status_id=supplier_in.status_id or default_status_id,
        created_by_user_id=current_user.id,
        updated_by_user_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    repo.add(db, db_supplier)
    repo.commit(db)
    repo.refresh(db, db_supplier)
    return db_supplier


def update_supplier(
    db: Session,
    current_user: User,
    supplier_id: int,
    supplier_in: ShoppingSupplierUpdate,
) -> ShoppingSupplier:
    db_supplier = repo.get_supplier(db, supplier_id)
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Fornitore o brand non trovato")

    update_data = supplier_in.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"]:
        existing = repo.find_supplier_by_name(db, update_data["name"])
        if existing and existing.id != supplier_id:
            raise HTTPException(status_code=400, detail="Esiste già un fornitore o brand con questo nome.")
        db_supplier.name_normalized = _normalize_name(update_data["name"])

    if "type_code" in update_data and update_data["type_code"] is not None:
        db_supplier.type_code = update_data["type_code"]

    if "status_id" in update_data and update_data["status_id"] is not None:
        db_supplier.status_id = update_data["status_id"]

    db_supplier.updated_at = _now()
    db_supplier.updated_by_user_id = current_user.id

    repo.commit(db)
    repo.refresh(db, db_supplier)
    return db_supplier


def delete_supplier(
    db: Session,
    current_user: User,
    supplier_id: int,
    as_type: Optional[int] = None,
) -> None:
    db_supplier = repo.get_supplier(db, supplier_id)
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Fornitore o brand non trovato")

    # Se l'entità ha doppio ruolo (3: Fornitore + Brand)
    if db_supplier.type_code == 3:
        if as_type == 1:
            # Eliminazione solo come Fornitore -> downgrade a Brand (2)
            if repo.supplier_has_batches(db, supplier_id):
                raise HTTPException(
                    status_code=400,
                    detail="Impossibile rimuovere il ruolo fornitore: ha acquisti/lotti associati.",
                )
            db_supplier.type_code = 2
            db_supplier.updated_at = _now()
            db_supplier.updated_by_user_id = current_user.id
            repo.commit(db)
            return
        elif as_type == 2:
            # Eliminazione solo come Brand -> downgrade a Fornitore (1)
            if repo.supplier_has_branded_products(db, supplier_id):
                raise HTTPException(
                    status_code=400,
                    detail="Impossibile rimuovere il ruolo brand: ha prodotti associati.",
                )
            db_supplier.type_code = 1
            db_supplier.updated_at = _now()
            db_supplier.updated_by_user_id = current_user.id
            repo.commit(db)
            return

    # Se l'entità è solo fornitore (1) o solo brand (2) o cancellazione globale (as_type=None)
    if repo.supplier_has_batches(db, supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Impossibile eliminare l'entità: ha acquisti/lotti associati come fornitore.",
        )
    if repo.supplier_has_branded_products(db, supplier_id):
        raise HTTPException(
            status_code=400,
            detail="Impossibile eliminare l'entità: ha prodotti associati come brand.",
        )

    repo.delete(db, db_supplier)


# ------------------------------------------------------------------ Inventory Batches
def add_inventory_batch(
    db: Session,
    current_user: User,
    item_id: int,
    batch_in: InventoryBatchCreate,
) -> InventoryBatch:
    db_item = repo.get_item_accessible(db, item_id, current_user.id)
    if not db_item:
        raise HTTPException(status_code=404, detail=_ITEM_NOT_FOUND)

    if db_item.shopping_list and db_item.shopping_list.group_id:
        user_role = repo.get_user_role_code_in_group(db, db_item.shopping_list.group_id, current_user.id)
        if user_role == "reader":
            raise HTTPException(status_code=403, detail="I lettori non possono registrare acquisti.")

    # Se viene specificato un brand durante l'acquisto, risolvilo e collegalo
    resolved_brand_id = _resolve_brand_id(
        db,
        current_user,
        brand_name=batch_in.brand_name,
        brand_id=batch_in.brand_id,
    )

    target_product_id = db_item.product_id
    if resolved_brand_id is not None:
        if db_item.product and db_item.product.brand_id is None:
            db_item.product.brand_id = resolved_brand_id
            db_item.product.updated_at = _now()
            db_item.product.updated_by_user_id = current_user.id
            db_brand = repo.get_supplier(db, resolved_brand_id)
            brand_suffix = f" ({db_brand.name_normalized})" if db_brand else ""
            db_item.name_normalized = f"{_normalize_name(db_item.product.name_normalized)}{brand_suffix}"
        elif db_item.product and db_item.product.brand_id != resolved_brand_id:
            new_prod = repo.get_or_create_product_by_name(
                db,
                db_item.product.name_normalized,
                current_user.id,
                brand_id=resolved_brand_id,
            )
            db_item.product_id = new_prod.id
            target_product_id = new_prod.id
            db_brand = repo.get_supplier(db, resolved_brand_id)
            brand_suffix = f" ({db_brand.name_normalized})" if db_brand else ""
            db_item.name_normalized = f"{_normalize_name(new_prod.name_normalized)}{brand_suffix}"

    if batch_in.product_id is not None and batch_in.product_id != db_item.product_id:
        raise HTTPException(
            status_code=400,
            detail="Il product_id del lotto non corrisponde al prodotto dell'articolo di lista.",
        )


    if batch_in.supplier_id is not None and not repo.get_supplier(db, batch_in.supplier_id):
        raise HTTPException(status_code=404, detail="Fornitore non trovato")

    purchased_by_user_id = batch_in.purchased_by_user_id or current_user.id
    today = _today()

    db_batch = InventoryBatch(
        list_item_id=item_id,
        product_id=target_product_id,
        supplier_id=batch_in.supplier_id,
        purchase_date=batch_in.purchase_date,
        expiration_date=batch_in.expiration_date,
        quantity_purchased=batch_in.quantity_purchased,
        purchase_price=batch_in.purchase_price,
        is_on_sale=batch_in.is_on_sale,
        purchased_by_user_id=purchased_by_user_id,
        created_by_user_id=current_user.id,
        updated_by_user_id=None,
        created_at=today,
        updated_at=today,
    )
    repo.add(db, db_batch)

    db_item.is_purchased = True
    db_item.updated_at = _now()
    db_item.updated_by_user_id = current_user.id

    repo.commit(db)
    repo.refresh(db, db_batch)
    return db_batch


def create_quick_price_batch(
    db: Session,
    current_user: User,
    batch_in: QuickPriceBatchCreate,
) -> list:
    created_batches = []
    today = _today()

    for rec in batch_in.records:
        prod_name = rec.product_name.strip()
        if not prod_name:
            continue

        normalized_prod_name = _normalize_name(prod_name)

        # Risolvi brand se indicato
        resolved_brand_id = None
        if rec.brand_name or rec.brand_id:
            resolved_brand_id = _resolve_brand_id(
                db,
                current_user,
                brand_name=rec.brand_name,
                brand_id=rec.brand_id,
            )

        # Risolvi o crea prodotto canonico
        db_product = repo.get_or_create_product_by_name(
            db,
            normalized_prod_name,
            current_user.id,
            brand_id=resolved_brand_id,
        )

        # Risolvi fornitore se indicato
        resolved_supplier_id = rec.supplier_id
        if resolved_supplier_id is None and rec.supplier_name and rec.supplier_name.strip():
            sup = repo.find_supplier_by_name(db, rec.supplier_name.strip())
            if sup:
                resolved_supplier_id = sup.id
            else:
                default_status_id = repo.active_supplier_status_id(db) or 1
                new_sup = ShoppingSupplier(
                    name=rec.supplier_name.strip(),
                    name_normalized=_normalize_name(rec.supplier_name.strip()),
                    type_code=1,
                    status_id=default_status_id,
                    created_by_user_id=current_user.id,
                    updated_by_user_id=current_user.id,
                    created_at=_now(),
                    updated_at=_now(),
                )
                repo.add(db, new_sup)
                repo.flush(db)
                resolved_supplier_id = new_sup.id

        batch = InventoryBatch(
            product_id=db_product.id,
            list_item_id=None,
            supplier_id=resolved_supplier_id,
            purchase_date=rec.purchase_date,
            quantity_purchased=rec.quantity_purchased,
            purchase_price=rec.purchase_price,
            is_on_sale=rec.is_on_sale,
            created_by_user_id=current_user.id,
            purchased_by_user_id=current_user.id,
            created_at=today,
            updated_at=today,
        )
        repo.add(db, batch)
        created_batches.append(batch)

    repo.commit(db)
    for b in created_batches:
        repo.refresh(db, b)

    # Ritorna serializzato coerente con list_all_batches
    return list_all_batches(db, current_user)


def update_inventory_batch(
    db: Session,
    current_user: User,
    batch_id: int,
    batch_in: InventoryBatchUpdate,
) -> InventoryBatch:
    db_batch = repo.get_batch(db, batch_id, current_user.id)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Lotto/Acquisto non trovato")

    update_data = batch_in.model_dump(exclude_unset=True)

    if "supplier_id" in update_data and update_data["supplier_id"] is not None:
        if not repo.get_supplier(db, update_data["supplier_id"]):
            raise HTTPException(status_code=404, detail="Nuovo fornitore non trovato")

    if "product_id" in update_data and update_data["product_id"] is not None:
        if update_data["product_id"] != db_batch.product_id:
            raise HTTPException(
                status_code=400,
                detail="Il product_id del lotto non può essere modificato.",
            )

    if "list_item_id" in update_data and update_data["list_item_id"] is not None:
        if update_data["list_item_id"] != db_batch.list_item_id:
            raise HTTPException(
                status_code=400,
                detail="Il list_item_id del lotto non può essere modificato.",
            )

    for field, value in update_data.items():
        setattr(db_batch, field, value)

    db_batch.updated_at = _today()
    db_batch.updated_by_user_id = current_user.id

    repo.commit(db)
    repo.refresh(db, db_batch)
    return db_batch


def delete_inventory_batch(db: Session, current_user: User, batch_id: int) -> None:
    db_batch = repo.get_batch(db, batch_id, current_user.id)
    if not db_batch:
        raise HTTPException(status_code=404, detail="Lotto/Acquisto non trovato")

    db_batch.deleted_at = _today()
    db_batch.deleted_by_user_id = current_user.id
    db_batch.updated_at = _today()
    db_batch.updated_by_user_id = current_user.id

    repo.commit(db)

    if db_batch.list_item_id is not None and not repo.item_has_active_batches(db, db_batch.list_item_id):
        db_item = repo.get_item(db, db_batch.list_item_id)
        if db_item:
            db_item.is_purchased = False
            db_item.updated_at = _now()
            db_item.updated_by_user_id = current_user.id
            repo.commit(db)


def list_item_batches(
    db: Session,
    current_user: User,
    item_id: int,
) -> list:
    """Restituisce i lotti di acquisto per un item della lista (storico acquisti personale)."""
    from decimal import Decimal as D
    batches = repo.list_batches_for_item(db, item_id=item_id, user_id=current_user.id)
    result = []
    for b in batches:
        qty = b.quantity_purchased or D("1")
        unit_price = (b.purchase_price / qty).quantize(D("0.01")) if qty else None
        list_name: Optional[str] = None
        unit_name: Optional[str] = None
        brand_id: Optional[int] = None
        brand_name: Optional[str] = None
        if b.product and b.product.brand:
            brand_id = b.product.brand.id
            brand_name = b.product.brand.name
        elif b.list_item and b.list_item.product and b.list_item.product.brand:
            brand_id = b.list_item.product.brand.id
            brand_name = b.list_item.product.brand.name

        if b.list_item:
            if b.list_item.shopping_list:
                list_name = b.list_item.shopping_list.name
            if b.list_item.unit:
                unit_name = b.list_item.unit.code_value or b.list_item.unit.code_name
        result.append({
            "id": b.id,
            "product_id": b.product_id,
            "product_name": b.product.name_normalized if b.product else (b.list_item.name_normalized if b.list_item else "Prodotto"),
            "brand_id": brand_id,
            "brand_name": brand_name,
            "purchase_date": b.purchase_date,
            "quantity_purchased": b.quantity_purchased,
            "purchase_price": b.purchase_price,
            "unit_price": unit_price,
            "supplier_id": b.supplier_id,
            "supplier_name": b.supplier.name_normalized if b.supplier else None,
            "unit_name": unit_name,
            "list_name": list_name,
            "is_on_sale": b.is_on_sale,
        })
    return result


def list_all_batches(db: Session, current_user: User) -> list:
    """Restituisce tutti i prezzi/batch registrati dall'utente o nei suoi gruppi."""
    from decimal import Decimal as D
    batches = repo.list_all_batches_for_user(db, current_user.id)
    result = []
    for b in batches:
        qty = b.quantity_purchased
        unit_price = (b.purchase_price / qty).quantize(D("0.01")) if qty else None
        list_name: Optional[str] = None
        unit_name: Optional[str] = None
        product_name: str = "Prodotto"
        brand_id: Optional[int] = None
        brand_name: Optional[str] = None
        if b.product:
            product_name = b.product.name_normalized
            if b.product.brand:
                brand_id = b.product.brand.id
                brand_name = b.product.brand.name
        elif b.list_item and b.list_item.name_normalized:
            product_name = b.list_item.name_normalized
            if b.list_item.product and b.list_item.product.brand:
                brand_id = b.list_item.product.brand.id
                brand_name = b.list_item.product.brand.name

        if b.list_item:
            if b.list_item.shopping_list:
                list_name = b.list_item.shopping_list.name
            if b.list_item.unit:
                unit_name = b.list_item.unit.code_value or b.list_item.unit.code_name
        result.append({
            "id": b.id,
            "product_id": b.product_id,
            "product_name": product_name,
            "brand_id": brand_id,
            "brand_name": brand_name,
            "purchase_date": b.purchase_date,
            "quantity_purchased": b.quantity_purchased,
            "purchase_price": b.purchase_price,
            "unit_price": unit_price,
            "supplier_id": b.supplier_id,
            "supplier_name": b.supplier.name_normalized if b.supplier else None,
            "unit_name": unit_name,
            "list_name": list_name,
            "is_on_sale": b.is_on_sale,
        })
    return result


def list_community_prices(

    db: Session,
    product_id: int,
    limit: int = 50,
) -> list:
    """Restituisce i prezzi anonimi della community per un prodotto."""
    from decimal import Decimal as D
    batches = repo.list_community_prices_for_product(db, product_id=product_id, limit=limit)
    result = []
    for b in batches:
        qty = b.quantity_purchased or D("1")
        unit_price = (b.purchase_price / qty).quantize(D("0.01")) if qty else b.purchase_price
        unit_name: Optional[str] = None
        brand_id: Optional[int] = None
        brand_name: Optional[str] = None
        if b.product and b.product.brand:
            brand_id = b.product.brand.id
            brand_name = b.product.brand.name
        if b.list_item and b.list_item.unit:
            unit_name = b.list_item.unit.code_value or b.list_item.unit.code_name
        result.append({
            "purchase_date": b.purchase_date,
            "unit_price": unit_price,
            "supplier_id": b.supplier_id,
            "supplier_name": b.supplier.name if b.supplier else None,
            "brand_id": brand_id,
            "brand_name": brand_name,
            "unit_name": unit_name,
            "is_on_sale": b.is_on_sale,
        })
    return result



# ------------------------------------------------------------------ Products

def list_products(
    db: Session,
    search: Optional[str] = None,
    brand_id: Optional[int] = None,
    limit: int = 20,
) -> List[ShoppingProduct]:
    return repo.list_products(db, search=search, brand_id=brand_id, limit=limit)


def get_product(
    db: Session,
    current_user: User,
    product_id: int,
) -> ShoppingProduct:
    db_product = repo.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Prodotto non trovato")
    return db_product


def create_product(
    db: Session,
    current_user: User,
    product_in: ShoppingProductCreate,
) -> ShoppingProduct:
    normalized_name = _normalize_name(product_in.name)
    existing = repo.get_product_by_name_normalized(db, normalized_name, brand_id=product_in.brand_id)
    if existing:
        raise HTTPException(status_code=400, detail="Esiste già un prodotto con questo nome e marchio.")

    if product_in.brand_id:
        brand = repo.get_supplier(db, product_in.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand specificato non trovato.")
        # Se l'entità era solo fornitore (1), promuovila a 3 (Entrambi)
        if brand.type_code == 1:
            brand.type_code = 3
            brand.updated_at = _now()
            brand.updated_by_user_id = current_user.id

    now = _now()
    db_product = ShoppingProduct(
        name_normalized=normalized_name,
        brand_id=product_in.brand_id,
        created_by_user_id=current_user.id,
        updated_by_user_id=current_user.id,
        created_at=now,
        updated_at=now,
    )
    repo.add(db, db_product)
    repo.commit(db)
    repo.refresh(db, db_product)
    return db_product


def update_product(
    db: Session,
    current_user: User,
    product_id: int,
    product_in: ShoppingProductUpdate,
) -> ShoppingProduct:
    db_product = repo.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Prodotto non trovato.")

    if product_in.brand_id is not None and product_in.brand_id != db_product.brand_id:
        brand = repo.get_supplier(db, product_in.brand_id)
        if not brand:
            raise HTTPException(status_code=404, detail="Brand specificato non trovato.")
        if brand.type_code == 1:
            brand.type_code = 3
            brand.updated_at = _now()
            brand.updated_by_user_id = current_user.id
        db_product.brand_id = product_in.brand_id

    if product_in.name is not None:
        db_product.name_normalized = _normalize_name(product_in.name)

    db_product.updated_at = _now()
    db_product.updated_by_user_id = current_user.id
    repo.commit(db)
    repo.refresh(db, db_product)
    return db_product


# ------------------------------------------------------------------ Config
def get_config_bundle(db: Session) -> ShoppingConfigBundle:
    return ShoppingConfigBundle(
        unitOptions=repo.get_config_options(db, "shopping_unit"),
        currencyOptions=repo.get_config_options(db, "currency"),
        offerFlagOptions=repo.get_config_options(db, "offer_flag"),
        visibilityOptions=repo.get_config_options(db, "list_visibility"),
        listStatusOptions=repo.get_config_options(db, "list_status"),
        groupStatusOptions=repo.get_config_options(db, "group_status"),
        groupRoleOptions=repo.get_config_options(db, "shopping_group_role"),
        supplierStatusOptions=repo.get_config_options(db, "supplier_status"),
    )