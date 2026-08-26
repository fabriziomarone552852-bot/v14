"""
Schemas for canonical shopping products and suppliers/brands.
"""
from datetime import datetime
from typing import Optional
from pydantic import Field, field_validator
from backend.core.schemas import ORMBaseModel, StrictBaseModel


class ShoppingSupplierSummary(ORMBaseModel):
    id: int
    name_normalized: str
    type_code: int


class ShoppingProductCreate(StrictBaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand_id: Optional[int] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Il nome del prodotto non può essere vuoto.")
        return value


class ShoppingProductUpdate(StrictBaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    brand_id: Optional[int] = None

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
    brand_id: Optional[int] = None
    brand: Optional[ShoppingSupplierSummary] = None
    created_by_user_id: int
    updated_by_user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None


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
