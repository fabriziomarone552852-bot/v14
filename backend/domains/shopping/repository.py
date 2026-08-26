"""Repository del dominio Shopping — solo accesso ai dati."""

from __future__ import annotations

import re
import unicodedata
from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload, with_loader_criteria

from backend.domains.config import ConfigCode
from backend.domains.shopping.models.catalog import ShoppingProduct, ShoppingSupplier
from backend.domains.shopping.models.groups import ShoppingGroup, ShoppingGroupMember
from backend.domains.shopping.models.inventory import InventoryBatch
from backend.domains.shopping.models.lists import ShoppingList, ShoppingListItem
from backend.domains.users.models import User


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = value.strip().lower()
    value = re.sub(r"\s+", " ", value)
    return value


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _today() -> date:
    return date.today()


def _soft_delete_criteria():
    return (
        with_loader_criteria(ShoppingGroup, ShoppingGroup.deleted_at.is_(None), include_aliases=True),
        with_loader_criteria(
            ShoppingGroupMember,
            ShoppingGroupMember.removed_at.is_(None),
            include_aliases=True,
        ),
        with_loader_criteria(ShoppingList, ShoppingList.deleted_at.is_(None), include_aliases=True),
        with_loader_criteria(ShoppingListItem, ShoppingListItem.deleted_at.is_(None), include_aliases=True),
        with_loader_criteria(ShoppingProduct, ShoppingProduct.deleted_at.is_(None), include_aliases=True),
        with_loader_criteria(ShoppingSupplier, ShoppingSupplier.deleted_at.is_(None), include_aliases=True),
        with_loader_criteria(InventoryBatch, InventoryBatch.deleted_at.is_(None), include_aliases=True),
    )


def _batch_loaders():
    return (
        selectinload(InventoryBatch.product).selectinload(ShoppingProduct.brand),
        selectinload(InventoryBatch.supplier),
        selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.unit),
        selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.shopping_list),
        selectinload(InventoryBatch.purchased_by_user),
        selectinload(InventoryBatch.created_by_user),
        selectinload(InventoryBatch.updated_by_user),
    )



def _list_loaders():
    return (
        selectinload(ShoppingList.items).selectinload(ShoppingListItem.product).selectinload(ShoppingProduct.brand),
        selectinload(ShoppingList.items).selectinload(ShoppingListItem.unit),
        selectinload(ShoppingList.items).selectinload(ShoppingListItem.created_by_user),
        selectinload(ShoppingList.items).selectinload(ShoppingListItem.updated_by_user),
        selectinload(ShoppingList.items)
        .selectinload(ShoppingListItem.inventory_batches)
        .selectinload(InventoryBatch.product)
        .selectinload(ShoppingProduct.brand),
        selectinload(ShoppingList.items)
        .selectinload(ShoppingListItem.inventory_batches)
        .selectinload(InventoryBatch.supplier),
        selectinload(ShoppingList.items)
        .selectinload(ShoppingListItem.inventory_batches)
        .selectinload(InventoryBatch.created_by_user),
        selectinload(ShoppingList.items)
        .selectinload(ShoppingListItem.inventory_batches)
        .selectinload(InventoryBatch.updated_by_user),
        selectinload(ShoppingList.items)
        .selectinload(ShoppingListItem.inventory_batches)
        .selectinload(InventoryBatch.purchased_by_user),
    )


def _item_loaders():
    return (
        selectinload(ShoppingListItem.shopping_list),
        selectinload(ShoppingListItem.product).selectinload(ShoppingProduct.brand),
        selectinload(ShoppingListItem.unit),
        selectinload(ShoppingListItem.created_by_user),
        selectinload(ShoppingListItem.updated_by_user),
        selectinload(ShoppingListItem.inventory_batches).selectinload(InventoryBatch.product).selectinload(ShoppingProduct.brand),
        selectinload(ShoppingListItem.inventory_batches).selectinload(InventoryBatch.supplier),
        selectinload(ShoppingListItem.inventory_batches).selectinload(InventoryBatch.created_by_user),
        selectinload(ShoppingListItem.inventory_batches).selectinload(InventoryBatch.updated_by_user),
        selectinload(ShoppingListItem.inventory_batches).selectinload(InventoryBatch.purchased_by_user),
    )


# ------------------------------------------------------------------ Groups
def list_groups(db: Session, user_id: int) -> List[ShoppingGroup]:
    owned = (
        db.query(ShoppingGroup)
        .options(*_soft_delete_criteria())
        .filter(
            ShoppingGroup.owner_id == user_id,
            ShoppingGroup.deleted_at.is_(None),
        )
        .order_by(ShoppingGroup.created_at.asc())
        .all()
    )

    member_of = (
        db.query(ShoppingGroup)
        .options(*_soft_delete_criteria())
        .join(ShoppingGroupMember, ShoppingGroupMember.group_id == ShoppingGroup.id)
        .filter(
            ShoppingGroup.deleted_at.is_(None),
            ShoppingGroupMember.user_id == user_id,
            ShoppingGroupMember.removed_at.is_(None),
            ShoppingGroup.owner_id != user_id,
        )
        .order_by(ShoppingGroup.created_at.asc())
        .all()
    )

    return owned + member_of


def get_group_owned(db: Session, group_id: int, user_id: int) -> Optional[ShoppingGroup]:
    return (
        db.query(ShoppingGroup)
        .options(*_soft_delete_criteria())
        .filter(
            ShoppingGroup.id == group_id,
            ShoppingGroup.owner_id == user_id,
            ShoppingGroup.deleted_at.is_(None),
        )
        .first()
    )


def get_group_accessible(db: Session, group_id: int, user_id: int) -> Optional[ShoppingGroup]:
    group = (
        db.query(ShoppingGroup)
        .options(*_soft_delete_criteria())
        .filter(
            ShoppingGroup.id == group_id,
            ShoppingGroup.deleted_at.is_(None),
        )
        .first()
    )
    if not group:
        return None

    if group.owner_id == user_id:
        return group

    membership = (
        db.query(ShoppingGroupMember)
        .filter(
            ShoppingGroupMember.group_id == group_id,
            ShoppingGroupMember.user_id == user_id,
            ShoppingGroupMember.removed_at.is_(None),
        )
        .first()
    )
    return group if membership else None


def create_group(db: Session, group: ShoppingGroup) -> ShoppingGroup:
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def update_group(db: Session, group: ShoppingGroup) -> ShoppingGroup:
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group: ShoppingGroup) -> None:
    now = _now()
    group.deleted_at = now

    for member in group.members:
        if member.removed_at is None:
            member.removed_at = now

    for shopping_list in group.shopping_lists:
        if shopping_list.deleted_at is None:
            shopping_list.group_id = None

    db.commit()


# ------------------------------------------------------------------ Group Members
def list_members(db: Session, group_id: int) -> List[ShoppingGroupMember]:
    return (
        db.query(ShoppingGroupMember)
        .filter(
            ShoppingGroupMember.group_id == group_id,
            ShoppingGroupMember.removed_at.is_(None),
        )
        .order_by(ShoppingGroupMember.created_at.asc())
        .all()
    )


def get_member(db: Session, group_id: int, user_id: int) -> Optional[ShoppingGroupMember]:
    return (
        db.query(ShoppingGroupMember)
        .filter(
            ShoppingGroupMember.group_id == group_id,
            ShoppingGroupMember.user_id == user_id,
            ShoppingGroupMember.removed_at.is_(None),
        )
        .first()
    )


def get_member_any(db: Session, group_id: int, user_id: int) -> Optional[ShoppingGroupMember]:
    """Trova un membro indipendentemente dallo stato removed_at (inclusi soft-deleted)."""
    return (
        db.query(ShoppingGroupMember)
        .filter(
            ShoppingGroupMember.group_id == group_id,
            ShoppingGroupMember.user_id == user_id,
        )
        .first()
    )


def add_member(db: Session, member: ShoppingGroupMember) -> ShoppingGroupMember:
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_member(db: Session, member: ShoppingGroupMember) -> ShoppingGroupMember:
    db.commit()
    db.refresh(member)
    return member


def remove_member(db: Session, member: ShoppingGroupMember) -> None:
    member.removed_at = _now()
    db.commit()


def find_user_by_username_or_email(
    db: Session,
    username: Optional[str] = None,
    email: Optional[str] = None,
) -> Optional[User]:
    query = db.query(User)
    if username:
        return query.filter(User.username == username).first()
    if email:
        return query.filter(User.email == email.lower()).first()
    return None


def resolve_role_id(db: Session, role_code: str) -> Optional[int]:
    return (
        db.query(ConfigCode.id)
        .filter(
            ConfigCode.code_type == "shopping_group_role",
            ConfigCode.code_value == role_code,
        )
        .scalar()
    )


def get_user_role_code_in_group(db: Session, group_id: int, user_id: int) -> Optional[str]:
    """Restituisce il codice del ruolo dell'utente nel gruppo ('owner', 'admin', 'editor', 'reader') oppure None."""
    group = (
        db.query(ShoppingGroup)
        .filter(
            ShoppingGroup.id == group_id,
            ShoppingGroup.deleted_at.is_(None),
        )
        .first()
    )
    if not group:
        return None

    if group.owner_id == user_id:
        return "owner"

    member = (
        db.query(ShoppingGroupMember)
        .options(selectinload(ShoppingGroupMember.role))
        .filter(
            ShoppingGroupMember.group_id == group_id,
            ShoppingGroupMember.user_id == user_id,
            ShoppingGroupMember.removed_at.is_(None),
        )
        .first()
    )

    if member and member.role:
        return member.role.code_value

    return None


def active_group_status_id(db: Session) -> Optional[int]:
    return (
        db.query(ConfigCode.id)
        .filter(
            ConfigCode.code_type == "group_status",
            ConfigCode.code_value == "active",
        )
        .scalar()
    )


def active_list_status_id(db: Session) -> Optional[int]:
    return (
        db.query(ConfigCode.id)
        .filter(
            ConfigCode.code_type == "list_status",
            ConfigCode.code_value == "active",
        )
        .scalar()
    )


def active_supplier_status_id(db: Session) -> Optional[int]:
    return (
        db.query(ConfigCode.id)
        .filter(
            ConfigCode.code_type == "supplier_status",
            ConfigCode.code_value == "active",
        )
        .scalar()
    )


# ------------------------------------------------------------------ Lists
def list_lists(db: Session, user_id: int) -> List[ShoppingList]:
    accessible_group_ids = (
        db.query(ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroupMember.group_id == ShoppingGroup.id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .filter(
            ShoppingGroup.deleted_at.is_(None),
            or_(
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .distinct()
        .all()
    )
    group_ids = [gid for (gid,) in accessible_group_ids]

    filters = [ShoppingList.owner_id == user_id]
    if group_ids:
        filters.append(ShoppingList.group_id.in_(group_ids))

    return (
        db.query(ShoppingList)
        .options(*_list_loaders(), *_soft_delete_criteria())
        .filter(
            or_(*filters),
            ShoppingList.deleted_at.is_(None),
        )
        .order_by(ShoppingList.created_at.asc())
        .all()
    )


def get_list_owned(db: Session, list_id: int, owner_id: int) -> Optional[ShoppingList]:
    return (
        db.query(ShoppingList)
        .options(*_list_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingList.id == list_id,
            ShoppingList.owner_id == owner_id,
            ShoppingList.deleted_at.is_(None),
        )
        .first()
    )


def get_list_accessible(db: Session, list_id: int, user_id: int) -> Optional[ShoppingList]:
    return (
        db.query(ShoppingList)
        .outerjoin(ShoppingGroup, ShoppingList.group_id == ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroup.id == ShoppingGroupMember.group_id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .options(*_list_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingList.id == list_id,
            ShoppingList.deleted_at.is_(None),
            or_(
                ShoppingList.owner_id == user_id,
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .first()
    )


# ------------------------------------------------------------------ Products
def list_products(
    db: Session,
    search: Optional[str] = None,
    brand_id: Optional[int] = None,
    limit: int = 200,
) -> List[ShoppingProduct]:
    query = (
        db.query(ShoppingProduct)
        .options(selectinload(ShoppingProduct.brand))
        .filter(ShoppingProduct.deleted_at.is_(None))
    )

    if search:
        normalized = normalize_name(search)
        query = query.filter(ShoppingProduct.name_normalized.ilike(f"%{normalized}%"))

    if brand_id is not None:
        query = query.filter(ShoppingProduct.brand_id == brand_id)

    return query.order_by(ShoppingProduct.name_normalized.asc()).limit(limit).all()


def get_product(db: Session, product_id: int) -> Optional[ShoppingProduct]:
    return (
        db.query(ShoppingProduct)
        .options(selectinload(ShoppingProduct.brand))
        .filter(
            ShoppingProduct.id == product_id,
            ShoppingProduct.deleted_at.is_(None),
        )
        .first()
    )


def get_product_by_name_normalized(
    db: Session,
    name_normalized: str,
    brand_id: Optional[int] = None,
) -> Optional[ShoppingProduct]:
    query = (
        db.query(ShoppingProduct)
        .options(selectinload(ShoppingProduct.brand))
        .filter(
            ShoppingProduct.name_normalized == name_normalized,
            ShoppingProduct.deleted_at.is_(None),
        )
    )
    if brand_id is not None:
        query = query.filter(ShoppingProduct.brand_id == brand_id)
    else:
        query = query.filter(ShoppingProduct.brand_id.is_(None))

    return query.first()


def get_or_create_product_by_name(
    db: Session,
    normalized_name: str,
    user_id: int,
    brand_id: Optional[int] = None,
) -> ShoppingProduct:
    product = get_product_by_name_normalized(db, normalized_name, brand_id=brand_id)
    if product:
        return product

    product = ShoppingProduct(
        name_normalized=normalized_name,
        brand_id=brand_id,
        created_by_user_id=user_id,
        updated_by_user_id=user_id,
        created_at=_now(),
        updated_at=_now(),
    )
    db.add(product)
    db.flush()
    return product


# ------------------------------------------------------------------ Items
def list_items(
    db: Session,
    user_id: int,
    shopping_list_id: Optional[int] = None,
    is_purchased: Optional[bool] = None,
) -> List[ShoppingListItem]:
    if shopping_list_id is None:
        return []

    if not get_list_accessible(db, shopping_list_id, user_id):
        return []

    query = (
        db.query(ShoppingListItem)
        .options(*_item_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingListItem.shopping_list_id == shopping_list_id,
            ShoppingListItem.deleted_at.is_(None),
        )
    )

    if is_purchased is not None:
        query = query.filter(ShoppingListItem.is_purchased == is_purchased)

    return query.order_by(ShoppingListItem.created_at.asc()).all()


def get_open_item_by_list_and_name(
    db: Session,
    shopping_list_id: int,
    name_normalized: str,
) -> Optional[ShoppingListItem]:
    return (
        db.query(ShoppingListItem)
        .filter(
            ShoppingListItem.shopping_list_id == shopping_list_id,
            ShoppingListItem.name_normalized == name_normalized,
            ShoppingListItem.is_purchased.is_(False),
            ShoppingListItem.deleted_at.is_(None),
        )
        .first()
    )


def get_item(db: Session, item_id: int) -> Optional[ShoppingListItem]:
    return (
        db.query(ShoppingListItem)
        .options(*_item_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingListItem.id == item_id,
            ShoppingListItem.deleted_at.is_(None),
        )
        .first()
    )


def get_item_owned(db: Session, item_id: int, owner_id: int) -> Optional[ShoppingListItem]:
    return (
        db.query(ShoppingListItem)
        .join(ShoppingList, ShoppingList.id == ShoppingListItem.shopping_list_id)
        .options(*_item_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingListItem.id == item_id,
            ShoppingList.owner_id == owner_id,
            ShoppingList.deleted_at.is_(None),
            ShoppingListItem.deleted_at.is_(None),
        )
        .first()
    )


def get_item_accessible(db: Session, item_id: int, user_id: int) -> Optional[ShoppingListItem]:
    return (
        db.query(ShoppingListItem)
        .join(ShoppingList, ShoppingList.id == ShoppingListItem.shopping_list_id)
        .outerjoin(ShoppingGroup, ShoppingList.group_id == ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroup.id == ShoppingGroupMember.group_id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .options(*_item_loaders(), *_soft_delete_criteria())
        .filter(
            ShoppingListItem.id == item_id,
            ShoppingListItem.deleted_at.is_(None),
            ShoppingList.deleted_at.is_(None),
            or_(
                ShoppingList.owner_id == user_id,
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .first()
    )


def item_has_active_batches(db: Session, list_item_id: int) -> bool:
    return (
        db.query(InventoryBatch.id)
        .filter(
            InventoryBatch.list_item_id == list_item_id,
            InventoryBatch.deleted_at.is_(None),
        )
        .first()
        is not None
    )


# ------------------------------------------------------------------ Suppliers & Brands
def list_suppliers(
    db: Session,
    type_code: Optional[int] = None,
) -> List[ShoppingSupplier]:
    query = db.query(ShoppingSupplier).filter(ShoppingSupplier.deleted_at.is_(None))
    if type_code is not None:
        if type_code in (1, 2):
            query = query.filter(ShoppingSupplier.type_code.in_([type_code, 3]))
        else:
            query = query.filter(ShoppingSupplier.type_code == type_code)
    return query.order_by(ShoppingSupplier.name.asc()).all()


def list_brands(db: Session) -> List[ShoppingSupplier]:
    return list_suppliers(db, type_code=2)


def get_supplier(db: Session, supplier_id: int) -> Optional[ShoppingSupplier]:
    return (
        db.query(ShoppingSupplier)
        .filter(
            ShoppingSupplier.id == supplier_id,
            ShoppingSupplier.deleted_at.is_(None),
        )
        .first()
    )


def find_supplier_by_name(db: Session, name: str) -> Optional[ShoppingSupplier]:
    normalized = normalize_name(name)
    return (
        db.query(ShoppingSupplier)
        .filter(
            ShoppingSupplier.name_normalized == normalized,
            ShoppingSupplier.deleted_at.is_(None),
        )
        .first()
    )


def search_suppliers(
    db: Session,
    search: str,
    type_code: Optional[int] = None,
    limit: int = 50,
) -> List[ShoppingSupplier]:
    normalized = normalize_name(search)
    raw = search.strip()

    query = db.query(ShoppingSupplier).filter(
        ShoppingSupplier.deleted_at.is_(None),
        or_(
            ShoppingSupplier.name_normalized.ilike(f"{normalized}%"),
            ShoppingSupplier.name.ilike(f"{raw}%"),
        ),
    )

    if type_code is not None:
        if type_code in (1, 2):
            query = query.filter(ShoppingSupplier.type_code.in_([type_code, 3]))
        else:
            query = query.filter(ShoppingSupplier.type_code == type_code)

    return (
        query.order_by(ShoppingSupplier.name.asc())
        .limit(limit)
        .all()
    )


def supplier_has_batches(db: Session, supplier_id: int) -> bool:
    return (
        db.query(InventoryBatch.id)
        .filter(
            InventoryBatch.supplier_id == supplier_id,
            InventoryBatch.deleted_at.is_(None),
        )
        .first()
        is not None
    )


def supplier_has_branded_products(db: Session, supplier_id: int) -> bool:
    return (
        db.query(ShoppingProduct.id)
        .filter(
            ShoppingProduct.brand_id == supplier_id,
            ShoppingProduct.deleted_at.is_(None),
        )
        .first()
        is not None
    )


# ------------------------------------------------------------------ Inventory Batches
def list_batches_for_product(
    db: Session,
    product_id: int,
    limit: Optional[int] = None,
) -> List[InventoryBatch]:
    query = (
        db.query(InventoryBatch)
        .options(*_batch_loaders(), *_soft_delete_criteria())
        .filter(
            InventoryBatch.product_id == product_id,
            InventoryBatch.deleted_at.is_(None),
        )
        .order_by(InventoryBatch.purchase_date.desc(), InventoryBatch.created_at.desc())
    )

    if limit is not None:
        query = query.limit(limit)

    return query.all()


def list_batches_for_item(
    db: Session,
    item_id: int,
    user_id: int,
) -> List[InventoryBatch]:
    """Restituisce tutti i lotti di acquisto personali per il prodotto di questo item accessibili all'utente."""
    db_item = get_item(db, item_id)
    product_id = db_item.product_id if db_item else None

    matching_product_ids = []
    if product_id is not None:
        target_product = get_product(db, product_id)
        if target_product:
            matching_product_ids = [
                p_id for (p_id,) in db.query(ShoppingProduct.id)
                .filter(
                    ShoppingProduct.name_normalized == target_product.name_normalized,
                    ShoppingProduct.deleted_at.is_(None),
                )
                .all()
            ]
        if not matching_product_ids:
            matching_product_ids = [product_id]

    query = (
        db.query(InventoryBatch)
        .outerjoin(ShoppingListItem, ShoppingListItem.id == InventoryBatch.list_item_id)
        .outerjoin(ShoppingList, ShoppingList.id == ShoppingListItem.shopping_list_id)
        .outerjoin(ShoppingGroup, ShoppingList.group_id == ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroup.id == ShoppingGroupMember.group_id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .options(
            selectinload(InventoryBatch.supplier),
            selectinload(InventoryBatch.product).selectinload(ShoppingProduct.brand),
            selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.unit),
            selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.shopping_list),
        )
    )

    if matching_product_ids:
        query = query.filter(
            or_(
                InventoryBatch.product_id.in_(matching_product_ids),
                InventoryBatch.list_item_id == item_id,
            )
        )
    else:
        query = query.filter(InventoryBatch.list_item_id == item_id)

    return (
        query.filter(
            InventoryBatch.deleted_at.is_(None),
            or_(
                ShoppingListItem.id.is_(None),
                (ShoppingListItem.deleted_at.is_(None) & ShoppingList.deleted_at.is_(None)),
            ),
            or_(
                InventoryBatch.created_by_user_id == user_id,
                InventoryBatch.purchased_by_user_id == user_id,
                ShoppingList.owner_id == user_id,
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .order_by(InventoryBatch.purchase_date.desc(), InventoryBatch.created_at.desc())
        .all()
    )


def list_all_batches_for_user(
    db: Session,
    user_id: int,
) -> List[InventoryBatch]:
    """Restituisce tutti i batch/prezzi di acquisto registrati dall'utente o nei suoi gruppi."""
    return (
        db.query(InventoryBatch)
        .outerjoin(ShoppingListItem, ShoppingListItem.id == InventoryBatch.list_item_id)
        .outerjoin(ShoppingList, ShoppingList.id == ShoppingListItem.shopping_list_id)
        .outerjoin(ShoppingGroup, ShoppingList.group_id == ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroup.id == ShoppingGroupMember.group_id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .options(
            selectinload(InventoryBatch.supplier),
            selectinload(InventoryBatch.product).selectinload(ShoppingProduct.brand),
            selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.unit),
            selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.shopping_list),
        )
        .filter(
            InventoryBatch.deleted_at.is_(None),
            or_(
                ShoppingListItem.id.is_(None),
                (ShoppingListItem.deleted_at.is_(None) & ShoppingList.deleted_at.is_(None)),
            ),
            or_(
                InventoryBatch.created_by_user_id == user_id,
                InventoryBatch.purchased_by_user_id == user_id,
                ShoppingList.owner_id == user_id,
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .order_by(InventoryBatch.purchase_date.desc(), InventoryBatch.created_at.desc())
        .all()
    )


def list_community_prices_for_product(
    db: Session,
    product_id: int,
    limit: int = 50,
) -> List[InventoryBatch]:
    """Restituisce i prezzi (anonimi) registrati per un prodotto da qualsiasi utente."""
    target_product = get_product(db, product_id)
    if not target_product:
        return []

    matching_product_ids = [
        p_id for (p_id,) in db.query(ShoppingProduct.id)
        .filter(
            ShoppingProduct.name_normalized == target_product.name_normalized,
            ShoppingProduct.deleted_at.is_(None),
        )
        .all()
    ]
    if not matching_product_ids:
        matching_product_ids = [product_id]

    return (
        db.query(InventoryBatch)
        .options(
            selectinload(InventoryBatch.supplier),
            selectinload(InventoryBatch.product).selectinload(ShoppingProduct.brand),
            selectinload(InventoryBatch.list_item).selectinload(ShoppingListItem.unit),
        )
        .filter(
            InventoryBatch.product_id.in_(matching_product_ids),
            InventoryBatch.deleted_at.is_(None),
        )
        .order_by(InventoryBatch.purchase_date.desc(), InventoryBatch.created_at.desc())
        .limit(limit)
        .all()
    )


def get_batch(db: Session, batch_id: int, user_id: int) -> Optional[InventoryBatch]:
    return (
        db.query(InventoryBatch)
        .join(ShoppingListItem, ShoppingListItem.id == InventoryBatch.list_item_id)
        .join(ShoppingList, ShoppingList.id == ShoppingListItem.shopping_list_id)
        .outerjoin(ShoppingGroup, ShoppingList.group_id == ShoppingGroup.id)
        .outerjoin(
            ShoppingGroupMember,
            (ShoppingGroup.id == ShoppingGroupMember.group_id)
            & (ShoppingGroupMember.removed_at.is_(None)),
        )
        .options(*_batch_loaders(), *_soft_delete_criteria())
        .filter(
            InventoryBatch.id == batch_id,
            InventoryBatch.deleted_at.is_(None),
            ShoppingListItem.deleted_at.is_(None),
            ShoppingList.deleted_at.is_(None),
            or_(
                ShoppingList.owner_id == user_id,
                ShoppingGroup.owner_id == user_id,
                ShoppingGroupMember.user_id == user_id,
            ),
        )
        .first()
    )


# ------------------------------------------------------------------ Generic helpers
def add(db: Session, obj) -> None:
    db.add(obj)


def commit(db: Session) -> None:
    db.commit()


def refresh(db: Session, obj) -> None:
    db.refresh(obj)


def get_config_options(db: Session, code_type: str) -> List[dict]:
    codes = (
        db.query(ConfigCode)
        .filter(ConfigCode.code_type == code_type)
        .order_by(ConfigCode.sort_order.asc(), ConfigCode.code_name.asc())
        .all()
    )
    return [{"id": c.id, "value": c.code_value, "label": c.code_name} for c in codes]


def delete(db: Session, obj) -> None:
    if hasattr(obj, "deleted_at"):
        if isinstance(obj, InventoryBatch):
            obj.deleted_at = _today()
            if hasattr(obj, "updated_at"):
                obj.updated_at = _today()

        elif isinstance(obj, ShoppingList):
            now = _now()
            today = _today()
            obj.deleted_at = now
            if hasattr(obj, "updated_at"):
                obj.updated_at = now

            for item in obj.items:
                if item.deleted_at is None:
                    item.deleted_at = now
                    if hasattr(item, "updated_at"):
                        item.updated_at = now

                for batch in item.inventory_batches:
                    if batch.deleted_at is None:
                        batch.deleted_at = today
                        batch.updated_at = today

        elif isinstance(obj, ShoppingListItem):
            now = _now()
            today = _today()
            obj.deleted_at = now
            if hasattr(obj, "updated_at"):
                obj.updated_at = now

            for batch in obj.inventory_batches:
                if batch.deleted_at is None:
                    batch.deleted_at = today
                    batch.updated_at = today

        else:
            obj.deleted_at = _now()
            if hasattr(obj, "updated_at"):
                obj.updated_at = _now()
    else:
        db.delete(obj)

    db.commit()


def get_supplier_by_normalized_name(db: Session, name_normalized: str) -> Optional[ShoppingSupplier]:
    return (
        db.query(ShoppingSupplier)
        .filter(ShoppingSupplier.name_normalized == name_normalized)
        .first()
    )


def bulk_create_suppliers_if_missing(
    db: Session,
    supplier_names: List[str],
    created_by_user_id: int,
    status_id: int,
) -> None:
    for supplier_name in supplier_names:
        normalized = normalize_name(supplier_name)
        existing = get_supplier_by_normalized_name(db, normalized)
        if existing is None:
            db.add(
                ShoppingSupplier(
                    name=supplier_name,
                    name_normalized=normalized,
                    status_id=status_id,
                    created_by_user_id=created_by_user_id,
                )
            )
    db.commit()