"""
Canonical product and supplier entities.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.domains.config import ConfigCode
    from backend.domains.users.models import User
    from .inventory import InventoryBatch
    from .lists import ShoppingListItem


class ShoppingProduct(Base):
    """Canonical product entity used by shopping items and inventory batches.

    Catalogo asettico: un solo record per prodotto (es. una sola 'farina').
    Il legame con i brand/fornitori è gestito dalla tabella ponte ShoppingProductBrand.
    """

    __tablename__ = "shopping_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name_normalized: Mapped[str] = mapped_column(String(255), nullable=False, index=True, unique=True)

    created_by_user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    updated_by_user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by_user_id],
        back_populates="shopping_products_created",
    )
    updated_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by_user_id],
        back_populates="shopping_products_updated",
    )

    # Relazione N:N con i brand tramite tabella ponte
    product_brands: Mapped[List["ShoppingProductBrand"]] = relationship(
        "ShoppingProductBrand",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    list_items: Mapped[List["ShoppingListItem"]] = relationship(
        "ShoppingListItem",
        back_populates="product",
        lazy="selectin",
    )
    inventory_batches: Mapped[List["InventoryBatch"]] = relationship(
        "InventoryBatch",
        back_populates="product",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ShoppingProduct id={self.id} name_normalized={self.name_normalized!r}>"


class ShoppingProductBrand(Base):
    """Tabella ponte N:N tra prodotti canonici e brand/fornitori.

    Memorizza la relazione specifica prodotto-brand con note persistenti
    (es. 'ottimo', 'da non comprare più') che sopravvivono tra una lista e l'altra.
    Tracciato: id | product_id | brand_id | notes
    """

    __tablename__ = "shopping_product_brands"

    __table_args__ = (
        UniqueConstraint("product_id", "brand_id", name="uq_shopping_product_brands"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("shopping_products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    brand_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("shopping_suppliers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    product: Mapped["ShoppingProduct"] = relationship(
        "ShoppingProduct",
        back_populates="product_brands",
    )
    brand: Mapped["ShoppingSupplier"] = relationship(
        "ShoppingSupplier",
        back_populates="product_brands",
    )

    def __repr__(self) -> str:
        return (
            f"<ShoppingProductBrand id={self.id} product_id={self.product_id} "
            f"brand_id={self.brand_id} notes={self.notes!r}>"
        )


class ShoppingSupplier(Base):
    """Supplier or Brand entity used for inventory purchases and product branding."""

    __tablename__ = "shopping_suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name_normalized: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    # 1 = Fornitore / Punto vendita, 2 = Produttore / Brand, 3 = Entrambi (es. Private Label)
    type_code: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        index=True,
    )

    status_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("config_codes.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    created_by_user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    updated_by_user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    status: Mapped["ConfigCode"] = relationship(
        "ConfigCode",
        foreign_keys=[status_id],
    )

    created_by_user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by_user_id],
        back_populates="shopping_suppliers_created",
    )
    updated_by_user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by_user_id],
        back_populates="shopping_suppliers_updated",
    )

    inventory_batches: Mapped[List["InventoryBatch"]] = relationship(
        "InventoryBatch",
        back_populates="supplier",
        lazy="selectin",
    )

    # Relazione verso la tabella ponte N:N
    product_brands: Mapped[List["ShoppingProductBrand"]] = relationship(
        "ShoppingProductBrand",
        back_populates="brand",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ShoppingSupplier id={self.id} name_normalized={self.name_normalized!r} type_code={self.type_code}>"
