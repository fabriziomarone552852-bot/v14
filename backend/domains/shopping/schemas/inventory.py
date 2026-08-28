"""
Inventory domain schemas.
Pydantic models for inventory batches.
"""

from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_DOWN
from typing import Optional

from pydantic import Field, field_validator

from backend.core.schemas import ORMBaseModel, StrictBaseModel


def _truncate_2_decimals(value: object) -> Decimal:
    dec = Decimal(str(value))
    return dec.quantize(Decimal("0.01"), rounding=ROUND_DOWN)


class InventoryBatchBase(StrictBaseModel):
    product_id: Optional[int] = None
    list_item_id: Optional[int] = None
    supplier_id: Optional[int] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None

    purchase_date: date
    expiration_date: Optional[date] = None


    quantity_purchased: Decimal = Field(
        ...,
        max_digits=12,
        decimal_places=2,
        gt=Decimal("0"),
    )

    purchase_price: Decimal = Field(
        ...,
        max_digits=12,
        decimal_places=2,
        ge=Decimal("0"),
    )

    is_on_sale: bool = False
    purchased_by_user_id: Optional[int] = None

    @field_validator("quantity_purchased", "purchase_price", mode="before")
    @classmethod
    def truncate_decimals(cls, value: object) -> object:
        if value is None or value == "":
            return value
        return _truncate_2_decimals(value)


class InventoryBatchCreate(InventoryBatchBase):
    pass


class QuickPriceRecordCreate(StrictBaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    brand_name: Optional[str] = None
    brand_id: Optional[int] = None
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    unit_id: Optional[int] = None
    purchase_date: date
    quantity_purchased: Decimal = Field(
        default=Decimal("1"),
        max_digits=12,
        decimal_places=2,
        gt=Decimal("0"),
    )
    purchase_price: Decimal = Field(
        ...,
        max_digits=12,
        decimal_places=2,
        ge=Decimal("0"),
    )
    is_on_sale: bool = False

    @field_validator("quantity_purchased", "purchase_price", mode="before")
    @classmethod
    def truncate_decimals(cls, value: object) -> object:
        if value is None or value == "":
            return value
        return _truncate_2_decimals(value)

    @field_validator("product_name")
    @classmethod
    def normalize_product_name(cls, value: str) -> str:
        v = value.strip()
        if not v:
            raise ValueError("Il nome del prodotto è obbligatorio.")
        return v


class QuickPriceBatchCreate(StrictBaseModel):
    records: list[QuickPriceRecordCreate] = Field(..., min_length=1)


class InventoryBatchUpdate(StrictBaseModel):
    product_id: Optional[int] = None
    list_item_id: Optional[int] = None
    supplier_id: Optional[int] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None

    purchase_date: Optional[date] = None
    expiration_date: Optional[date] = None

    quantity_purchased: Optional[Decimal] = Field(
        default=None,
        max_digits=12,
        decimal_places=2,
        gt=Decimal("0"),
    )

    purchase_price: Optional[Decimal] = Field(
        default=None,
        max_digits=12,
        decimal_places=2,
        ge=Decimal("0"),
    )

    is_on_sale: Optional[bool] = None
    purchased_by_user_id: Optional[int] = None

    @field_validator("quantity_purchased", "purchase_price", mode="before")
    @classmethod
    def truncate_decimals(cls, value: object) -> object:
        if value is None or value == "":
            return value
        return _truncate_2_decimals(value)


class InventoryBatchResponse(ORMBaseModel):
    id: int
    product_id: int
    list_item_id: Optional[int] = None
    supplier_id: Optional[int] = None

    purchase_date: date
    expiration_date: Optional[date] = None

    quantity_purchased: Decimal
    purchase_price: Decimal

    is_on_sale: bool
    purchased_by_user_id: Optional[int] = None

    created_by_user_id: Optional[int] = None
    updated_by_user_id: Optional[int] = None
    deleted_by_user_id: Optional[int] = None

    created_at: date
    updated_at: date
    deleted_at: Optional[date] = None


class SupplierPriceSummary(ORMBaseModel):
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    avg_price: Optional[Decimal] = None
    latest_price: Optional[Decimal] = None
    latest_purchase_date: Optional[date] = None


class PriceHistoryPoint(ORMBaseModel):
    purchase_date: date
    purchase_price: Decimal
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    is_on_sale: bool = False


class ItemBatchResponse(ORMBaseModel):
    """Lotto acquisto per un singolo list_item — usato nel pannello storico acquisti."""
    id: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    purchase_date: date
    quantity_purchased: Decimal
    purchase_price: Decimal
    unit_price: Optional[Decimal] = None          # purchase_price / quantity_purchased
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    unit_name: Optional[str] = None               # unità di misura associata all'acquisto
    list_name: Optional[str] = None               # nome della lista da cui proviene
    notes: Optional[str] = None                   # note associate all'item della lista
    is_on_sale: bool = False



class CommunityPricePoint(ORMBaseModel):
    """Prezzo anonimo registrato dalla community per un prodotto."""
    purchase_date: date
    unit_price: Decimal                           # prezzo totale / quantità
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    brand_id: Optional[int] = None
    brand_name: Optional[str] = None
    unit_name: Optional[str] = None               # unità di misura associata all'acquisto
    is_on_sale: bool = False