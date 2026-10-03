"""
Schemas for canonical shopping products, product-brand links and suppliers/brands.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import Field, field_validator
from backend.core.schemas import ORMBaseModel, StrictBaseModel


class ShoppingSupplierSummary(ORMBaseModel):
    id: int
    name_normalized: str
    type_code: int


# ------------------------------------------------------------------ ProductBrand (tabella ponte)

class ShoppingProductBrandCreate(StrictBaseModel):
    """Crea o aggiorna un legame prodotto-brand con note opzionali."""
    brand_id: int
    notes: Optional[str] = Field(None, max_length=1000)


class ShoppingProductBrandUpdate(StrictBaseModel):
    notes: Optional[str] = Field(None, max_length=1000)


class ShoppingProductBrandResponse(ORMBaseModel):
    id: int
    product_id: int
    brand_id: int
    notes: Optional[str] = None
    brand: Optional[ShoppingSupplierSummary] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# ------------------------------------------------------------------ Product

class ShoppingProductCreate(StrictBaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Il nome del prodotto non può essere vuoto.")
        return value


class ShoppingProductUpdate(StrictBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Il nome del prodotto non può essere vuoto.")
        return value


class ShoppingProductResponse(ORMBaseModel):
    id: int
    name_normalized: str
    # Lista dei brand associati con le relative note
    product_brands: List[ShoppingProductBrandResponse] = []
    created_by_user_id: int
    updated_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None


# ------------------------------------------------------------------ Supplier

class ShoppingSupplierCreate(StrictBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type_code: int = Field(1, ge=1, le=3, description="1=Fornitore, 2=Produttore/Brand, 3=Entrambi")
    status_id: Optional[int] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Il nome del fornitore/brand non può essere vuoto.")
        return value


class ShoppingSupplierUpdate(StrictBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type_code: Optional[int] = Field(None, ge=1, le=3, description="1=Fornitore, 2=Produttore/Brand, 3=Entrambi")
    status_id: Optional[int] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Il nome del fornitore/brand non può essere vuoto.")
        return value


class ShoppingSupplierResponse(ORMBaseModel):
    id: int
    name_normalized: str
    type_code: int = 1
    status_id: int
    created_by_user_id: int
    updated_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
