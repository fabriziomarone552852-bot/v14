from __future__ import annotations
from typing import Optional
from pydantic import Field, field_validator, model_validator
from backend.core.schemas import ORMBaseModel, StrictBaseModel
from backend.domains.monthly_entries.models import VALID_MONTHLY_TYPES, NUMERIC_MONTHLY_TYPES

class MonthlyEntryCreate(StrictBaseModel):
    year: int = Field(..., ge=1)
    month: int = Field(..., ge=1, le=12)
    monthly_type: str = Field(..., min_length=2, max_length=2)
    monthly_field: Optional[str] = None

    @field_validator("monthly_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in VALID_MONTHLY_TYPES:
            raise ValueError(f"monthly_type non valido. Deve essere uno tra: {', '.join(VALID_MONTHLY_TYPES)}")
        return v

    @model_validator(mode='after')
    def validate_numeric(self) -> 'MonthlyEntryCreate':
        if self.monthly_type in NUMERIC_MONTHLY_TYPES:
            if self.monthly_field is None:
                raise ValueError("Il campo monthly_field è richiesto per i tipi numerici")
            try:
                val = int(self.monthly_field)
                if not (0 <= val <= 10):
                    raise ValueError()
            except ValueError:
                raise ValueError("monthly_field deve essere un intero tra 0 e 10 per i tipi numerici")
        return self

class MonthlyEntryUpdate(StrictBaseModel):
    monthly_field: Optional[str] = None

class MonthlyEntryResponse(ORMBaseModel):
    id: int
    user_id: int
    year: int
    month: int
    monthly_type: str
    monthly_field: Optional[str]
