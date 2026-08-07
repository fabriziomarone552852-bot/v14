"""Analytics domain repository — accesso ai dati ed esecuzione query."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session, selectinload

from backend.domains.shopping import (
    InventoryBatch,
    ShoppingListItem,
)


def get_shopping_item_with_relations(
    db: Session,
    shopping_list_item_id: int,
) -> Optional[ShoppingListItem]:
    """Recupera un ShoppingListItem caricando eager le relazioni product e shopping_list."""
    return (
        db.query(ShoppingListItem)
        .options(
            selectinload(ShoppingListItem.product),
            selectinload(ShoppingListItem.shopping_list),
        )
        .filter(ShoppingListItem.id == shopping_list_item_id)
        .first()
    )


def get_product_batches(
    db: Session,
    product_id: int,
) -> List[InventoryBatch]:
    """Recupera i lotti attivi ordinati per data acquisto decrescente."""
    return (
        db.query(InventoryBatch)
        .options(
            selectinload(InventoryBatch.supplier),
            selectinload(InventoryBatch.product),
        )
        .filter(InventoryBatch.product_id == product_id)
        .filter(InventoryBatch.deleted_at.is_(None))
        .order_by(InventoryBatch.purchase_date.desc(), InventoryBatch.id.desc())
        .all()
    )


__all__ = [
    "get_shopping_item_with_relations",
    "get_product_batches",
]
