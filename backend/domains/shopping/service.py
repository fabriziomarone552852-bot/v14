"""Service del dominio Shopping — regole di business per gruppi, liste, prodotti, articoli, fornitori e inventario."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.core.seeders import register_seeder
from backend.domains.shopping import repository as repo
from backend.domains.shopping.models.catalog import ShoppingProduct, ShoppingSupplier

from backend.core.csv_seed_loader import (
    load_seed_shopping_suppliers,
    load_seed_shopping_products,
    load_seed_inventory_batches,
)
from backend.domains.shopping.models.groups import ShoppingGroup, ShoppingGroupMember
from backend.domains.shopping.models.inventory import InventoryBatch
from backend.domains.shopping.models.lists import ShoppingList, ShoppingListItem


def seed_default_shopping_suppliers_for_user(db: Session, user_id: int) -> None:
    """Popola tutti i negozi e marchi da shopping_suppliers.csv associandoli all'utente."""
    from backend.domains.config import repository as config_repo

    supplier_status_code = config_repo.get_config_code(db, "supplier_status", "active")
    default_status_id = supplier_status_code.id if supplier_status_code else 1

    existing_suppliers = db.query(ShoppingSupplier.id, ShoppingSupplier.name_normalized).all()
    existing_ids = {s.id for s in existing_suppliers}
    existing_names = {s.name_normalized for s in existing_suppliers}

    suppliers_data = load_seed_shopping_suppliers()
    for item in suppliers_data:
        normalized = item["name_normalized"]
        if normalized in existing_names:
            continue

        supplier_kwargs = {
            "name_normalized": normalized,
            "type_code": item.get("type_code") or 1,
            "status_id": default_status_id,
            "created_by_user_id": user_id,
            "created_at": item.get("created_at") or _now(),
        }
        if item["id"] not in existing_ids:
            supplier_kwargs["id"] = item["id"]
            existing_ids.add(item["id"])

        obj = ShoppingSupplier(**supplier_kwargs)
        db.add(obj)
        existing_names.add(normalized)
    db.flush()


def seed_default_shopping_products_for_user(db: Session, user_id: int) -> None:
    """Popola i prodotti da shopping_products.csv collegandoli ai marchi corretti."""
    all_suppliers = db.query(ShoppingSupplier).all()
    suppliers_by_name = {s.name_normalized: s.id for s in all_suppliers}
    suppliers_by_id = {s.id for s in all_suppliers}

    existing_products = db.query(ShoppingProduct.id, ShoppingProduct.name_normalized).all()
    existing_ids = {p.id for p in existing_products}
    existing_names = {p.name_normalized for p in existing_products}

    products_data = load_seed_shopping_products()
    for item in products_data:
        normalized = item["name_normalized"]
        if normalized in existing_names:
            continue

        brand_id = item.get("brand_id")
        if not brand_id and item.get("brand_name_text"):
            brand_id = suppliers_by_name.get(item["brand_name_text"])

        if brand_id and brand_id not in suppliers_by_id:
            brand_id = None

        product_kwargs = {
            "name_normalized": normalized,
            "brand_id": brand_id,
            "created_by_user_id": user_id,
            "created_at": item.get("created_at") or _now(),
        }
        if item["id"] not in existing_ids:
            product_kwargs["id"] = item["id"]
            existing_ids.add(item["id"])

        obj = ShoppingProduct(**product_kwargs)
        db.add(obj)
        existing_names.add(normalized)
    db.flush()


def seed_default_inventory_batches_for_user(db: Session, user_id: int) -> None:
    """Popola i lotti di spesa e lo storico prezzi da inventory_batch.csv."""
    all_products = db.query(ShoppingProduct.id, ShoppingProduct.name_normalized).all()
    products_by_name = {p.name_normalized: p.id for p in all_products}
    products_by_id = {p.id for p in all_products}

    all_suppliers = db.query(ShoppingSupplier.id, ShoppingSupplier.name_normalized).all()
    suppliers_by_name = {s.name_normalized: s.id for s in all_suppliers}
    suppliers_by_id = {s.id for s in all_suppliers}

    seed_suppliers = load_seed_shopping_suppliers()
    seed_supp_name_map = {ss["id"]: ss["name_normalized"] for ss in seed_suppliers}

    seed_products = load_seed_shopping_products()
    seed_prod_name_map = {sp["id"]: sp["name_normalized"] for sp in seed_products}
    
    existing_batches = db.query(
        InventoryBatch.id,
        InventoryBatch.product_id,
        InventoryBatch.purchase_date,
        InventoryBatch.purchase_price
    ).filter(InventoryBatch.deleted_at.is_(None)).all()
    
    existing_ids = {b.id for b in existing_batches}
    existing_keys = {(b.product_id, b.purchase_date, b.purchase_price) for b in existing_batches}

    batches_data = load_seed_inventory_batches()
    for item in batches_data:
        csv_prod_id = item["product_id"]
        prod_name = seed_prod_name_map.get(csv_prod_id)
        target_prod_id = products_by_name.get(prod_name) if prod_name else None

        if not target_prod_id and csv_prod_id in products_by_id:
            target_prod_id = csv_prod_id

        if not target_prod_id:
            continue

        csv_supp_id = item.get("supplier_id")
        supp_name = seed_supp_name_map.get(csv_supp_id) if csv_supp_id else None
        target_supp_id = suppliers_by_name.get(supp_name) if supp_name else None

        if not target_supp_id and csv_supp_id in suppliers_by_id:
            target_supp_id = csv_supp_id

        key = (target_prod_id, item["purchase_date"], item["purchase_price"])
        if key in existing_keys:
            continue

        batch_kwargs = {
            "product_id": target_prod_id,
            "list_item_id": item.get("list_item_id"),
            "purchase_date": item["purchase_date"],
            "quantity_purchased": item["quantity_purchased"],
            "purchase_price": item["purchase_price"],
            "supplier_id": target_supp_id,
            "is_on_sale": item.get("is_on_sale", False),
            "expiration_date": item.get("expiration_date"),
            "created_by_user_id": user_id,
            "purchased_by_user_id": user_id,
            "created_at": item.get("created_at") or item["purchase_date"],
            "updated_at": item.get("updated_at") or item["purchase_date"],
        }
        if item["id"] not in existing_ids:
            batch_kwargs["id"] = item["id"]
            existing_ids.add(item["id"])

        obj = InventoryBatch(**batch_kwargs)
        db.add(obj)
        existing_keys.add(key)
    db.flush()
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
def get_or_create_default_list(db: Session, current_user: User) -> ShoppingList:
    default_list = repo.get_default_list(db, current_user.id)
    if not default_list:
        now = _now()
        default_status_id = repo.active_list_status_id(db) or 1
        default_list = ShoppingList(
            owner_id=current_user.id,
            visibility_id=1,
            status_id=default_status_id,
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
    get_or_create_default_list(db, current_user)
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

    if db_list.is_default:
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

    # Gestione spostamento articolo su un'altra lista
    if "shopping_list_id" in update_data and update_data["shopping_list_id"] is not None:
        target_list_id = update_data["shopping_list_id"]
        if target_list_id != db_item.shopping_list_id:
            target_list = repo.get_list_accessible(db, target_list_id, current_user.id)
            if not target_list:
                raise HTTPException(
                    status_code=404,
                    detail="Lista di destinazione non trovata o non accessibile.",
                )
            if target_list.group_id:
                target_role = repo.get_user_role_code_in_group(db, target_list.group_id, current_user.id)
                if target_role == "reader":
                    raise HTTPException(
                        status_code=403,
                        detail="Non hai i permessi per spostare articoli in questa lista di gruppo.",
                    )
            # Verifica se nella lista di destinazione esiste già un articolo aperto con lo stesso nome
            name_to_check = db_item.name_normalized
            existing_in_target = repo.get_open_item_by_list_and_name(
                db,
                target_list.id,
                name_to_check,
            )
            if existing_in_target and existing_in_target.id != db_item.id:
                raise HTTPException(
                    status_code=409,
                    detail="Esiste già un articolo aperto con questo prodotto nella lista di destinazione.",
                )
            db_item.shopping_list_id = target_list.id
        update_data.pop("shopping_list_id", None)

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
                    name_normalized=_normalize_name(rec.supplier_name.strip()),
                    type_code=1,
                    status_id=default_status_id,
                    created_by_user_id=current_user.id,
                    updated_by_user_id=current_user.id,
                    created_at=_now(),
                    updated_at=_now(),
                )
                db.add(new_sup)
                db.flush()
                resolved_supplier_id = new_sup.id

        list_item_id = None
        if batch_in.shopping_list_id:
            target_list = repo.get_list_accessible(db, batch_in.shopping_list_id, current_user.id)
            if target_list:
                existing_item = (
                    db.query(ShoppingListItem)
                    .filter(
                        ShoppingListItem.shopping_list_id == batch_in.shopping_list_id,
                        ShoppingListItem.product_id == db_product.id,
                        ShoppingListItem.deleted_at.is_(None),
                    )
                    .first()
                )
                if existing_item:
                    list_item_id = existing_item.id
                    existing_item.is_purchased = True
                    existing_item.updated_at = _now()
                    existing_item.updated_by_user_id = current_user.id
                else:
                    new_item = ShoppingListItem(
                        shopping_list_id=batch_in.shopping_list_id,
                        product_id=db_product.id,
                        name_normalized=db_product.name_normalized,
                        quantity=rec.quantity_purchased,
                        unit_id=rec.unit_id,
                        is_purchased=True,
                        created_by_user_id=current_user.id,
                        updated_by_user_id=current_user.id,
                        created_at=_now(),
                        updated_at=_now(),
                    )
                    db.add(new_item)
                    db.flush()
                    list_item_id = new_item.id

        batch = InventoryBatch(
            product_id=db_product.id,
            list_item_id=list_item_id,
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
        db.add(batch)
        created_batches.append(batch)

    db.commit()
    for b in created_batches:
        db.refresh(b)

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

    is_seed_batch = (db_batch.id <= 41)
    if is_seed_batch and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Solo gli utenti SuperUser possono modificare i dati di primo inserimento.",
        )

    if not current_user.is_superuser:
        is_allowed = (
            db_batch.created_by_user_id == current_user.id
            or db_batch.purchased_by_user_id == current_user.id
        )
        if db_batch.list_item_id:
            db_item = repo.get_item(db, db_batch.list_item_id)
            if db_item and db_item.shopping_list_id:
                accessible_list = repo.get_list_accessible(db, db_item.shopping_list_id, current_user.id)
                if accessible_list and accessible_list.group_id:
                    role = repo.get_user_role_code_in_group(db, accessible_list.group_id, current_user.id)
                    if role == "reader":
                        raise HTTPException(
                            status_code=403,
                            detail="I lettori non hanno i permessi per modificare i rilevamenti di prezzo nel gruppo.",
                        )
                    elif role in ("owner", "admin", "editor"):
                        is_allowed = True
                elif accessible_list and accessible_list.owner_id == current_user.id:
                    is_allowed = True
        elif not is_allowed and db_batch.list_item_id is None:
            is_allowed = True

        if not is_allowed:
            raise HTTPException(
                status_code=403,
                detail="Non hai i permessi per modificare questo rilevamento di prezzo.",
            )

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

    # Resolve brand if brand_name or brand_id is updated
    if "brand_name" in update_data or "brand_id" in update_data:
        resolved_brand_id = _resolve_brand_id(
            db,
            current_user,
            brand_name=update_data.get("brand_name"),
            brand_id=update_data.get("brand_id"),
        )
        if db_batch.product:
            db_batch.product.brand_id = resolved_brand_id

    # If list_item_id is None but shopping_list_id is provided, try to find or create list item
    if db_batch.list_item_id is None and update_data.get("shopping_list_id"):
        target_list = repo.get_list_accessible(db, update_data["shopping_list_id"], current_user.id)
        if target_list and db_batch.product:
            existing_item = (
                db.query(ShoppingListItem)
                .filter(
                    ShoppingListItem.shopping_list_id == update_data["shopping_list_id"],
                    ShoppingListItem.product_id == db_batch.product_id,
                    ShoppingListItem.deleted_at.is_(None),
                )
                .first()
            )
            if existing_item:
                db_batch.list_item_id = existing_item.id
            else:
                new_item = ShoppingListItem(
                    shopping_list_id=update_data["shopping_list_id"],
                    product_id=db_batch.product_id,
                    name_normalized=db_batch.product.name_normalized,
                    quantity=update_data.get("quantity_purchased") or db_batch.quantity_purchased,
                    unit_id=update_data.get("unit_id"),
                    notes=update_data.get("notes"),
                    is_purchased=True,
                    created_by_user_id=current_user.id,
                    updated_by_user_id=current_user.id,
                    created_at=_now(),
                    updated_at=_now(),
                )
                db.add(new_item)
                db.flush()
                db_batch.list_item_id = new_item.id

    # Sync list item attributes if linked
    if db_batch.list_item_id:
        db_item = repo.get_item(db, db_batch.list_item_id)
        if db_item:
            if "product_name" in update_data and update_data["product_name"]:
                db_item.name_normalized = _normalize_name(update_data["product_name"])
            if "notes" in update_data:
                db_item.notes = update_data["notes"]
            if "unit_id" in update_data:
                db_item.unit_id = update_data["unit_id"]
            if "shopping_list_id" in update_data and update_data["shopping_list_id"]:
                db_item.shopping_list_id = update_data["shopping_list_id"]
            if "quantity_purchased" in update_data and update_data["quantity_purchased"] is not None:
                db_item.quantity = update_data["quantity_purchased"]

    # Sync product catalog item if linked
    if db_batch.product:
        if "product_name" in update_data and update_data["product_name"]:
            db_batch.product.name_normalized = _normalize_name(update_data["product_name"])

    for field, value in update_data.items():
        if hasattr(db_batch, field):
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

    is_seed_batch = (db_batch.id <= 41)
    if is_seed_batch and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Solo gli utenti SuperUser possono eliminare i dati di primo inserimento.",
        )

    if not current_user.is_superuser:
        is_allowed = (
            db_batch.created_by_user_id == current_user.id
            or db_batch.purchased_by_user_id == current_user.id
        )
        if db_batch.list_item_id:
            db_item = repo.get_item(db, db_batch.list_item_id)
            if db_item and db_item.shopping_list_id:
                accessible_list = repo.get_list_accessible(db, db_item.shopping_list_id, current_user.id)
                if accessible_list and accessible_list.group_id:
                    role = repo.get_user_role_code_in_group(db, accessible_list.group_id, current_user.id)
                    if role == "reader":
                        raise HTTPException(
                            status_code=403,
                            detail="I lettori non hanno i permessi per eliminare i rilevamenti di prezzo nel gruppo.",
                        )
                    elif role in ("owner", "admin", "editor"):
                        is_allowed = True
                elif accessible_list and accessible_list.owner_id == current_user.id:
                    is_allowed = True
        elif not is_allowed and db_batch.list_item_id is None:
            is_allowed = True

        if not is_allowed:
            raise HTTPException(
                status_code=403,
                detail="Non hai i permessi per eliminare questo rilevamento di prezzo.",
            )

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
            brand_name = b.product.brand.name_normalized
        elif b.list_item and b.list_item.product and b.list_item.product.brand:
            brand_id = b.list_item.product.brand.id
            brand_name = b.list_item.product.brand.name_normalized

        notes: Optional[str] = None
        if b.list_item:
            notes = b.list_item.notes
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
            "notes": notes,
            "is_on_sale": b.is_on_sale,
        })
    return result


def list_all_batches(db: Session, current_user: User) -> list:
    """Restituisce tutti i prezzi/batch registrati dall'utente o nei suoi gruppi."""
    from decimal import Decimal as D
    admin_ids = [u.id for u in db.query(User).filter(User.is_superuser == True, User.deleted_at.is_(None)).all()]
    batches = repo.list_all_batches_for_user(db, current_user.id)
    result = []
    for b in batches:
        qty = b.quantity_purchased
        unit_price = (b.purchase_price / qty).quantize(D("0.01")) if qty else None
        list_name: Optional[str] = None
        unit_name: Optional[str] = None
        notes: Optional[str] = None
        product_name: str = "Prodotto"
        brand_id: Optional[int] = None
        brand_name: Optional[str] = None
        if b.product:
            product_name = b.product.name_normalized
            if b.product.brand:
                brand_id = b.product.brand.id
                brand_name = b.product.brand.name_normalized
        elif b.list_item and b.list_item.name_normalized:
            product_name = b.list_item.name_normalized
            if b.list_item.product and b.list_item.product.brand:
                brand_id = b.list_item.product.brand.id
                brand_name = b.list_item.product.brand.name_normalized

        shopping_list_id: Optional[int] = None
        unit_id: Optional[int] = None

        if b.list_item:
            notes = b.list_item.notes
            unit_id = b.list_item.unit_id
            shopping_list_id = b.list_item.shopping_list_id
            if b.list_item.shopping_list:
                list_name = b.list_item.shopping_list.name
            if b.list_item.unit:
                unit_name = b.list_item.unit.code_value or b.list_item.unit.code_name
        
        is_seed = (b.id <= 41)

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
            "unit_id": unit_id,
            "unit_name": unit_name,
            "shopping_list_id": shopping_list_id,
            "list_name": list_name,
            "list_item_id": b.list_item_id,
            "created_by_user_id": b.created_by_user_id,
            "is_seed": is_seed,
            "notes": notes,
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
            brand_name = b.product.brand.name_normalized
        if b.list_item and b.list_item.unit:
            unit_name = b.list_item.unit.code_value or b.list_item.unit.code_name
        result.append({
            "purchase_date": b.purchase_date,
            "unit_price": unit_price,
            "supplier_id": b.supplier_id,
            "supplier_name": b.supplier.name_normalized if b.supplier else None,
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