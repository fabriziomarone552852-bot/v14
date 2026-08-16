from __future__ import annotations
from typing import Optional
from pydantic import Field, field_validator, model_validator
from backend.core.schemas import ORMBaseModel, StrictBaseModel
from backend.domains.yearly_entries.models import VALID_YEARLY_TYPES, NUMERIC_YEARLY_TYPES

class YearlyEntryCreate(StrictBaseModel):
    year: int = Field(..., ge=1)
    yearly_type: str = Field(..., min_length=2, max_length=2)
    yearly_field: Optional[str] = None

    @field_validator("yearly_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.strip().upper()
        if v not in VALID_YEARLY_TYPES:
            raise ValueError(f"yearly_type non valido. Deve essere uno tra: {', '.join(VALID_YEARLY_TYPES)}")
        return v

    @model_validator(mode='after')
    def validate_numeric(self) -> 'YearlyEntryCreate':
        if self.yearly_type in NUMERIC_YEARLY_TYPES:
            if self.yearly_field is None:
                raise ValueError("Il campo yearly_field è richiesto per i tipi numerici")
            try:
                val = int(self.yearly_field)
                if not (0 <= val <= 10):
                    raise ValueError()
            except ValueError:
                raise ValueError("yearly_field deve essere un intero tra 0 e 10 per i tipi numerici")
        return self

class YearlyEntryUpdate(StrictBaseModel):
    yearly_field: Optional[str] = None

class YearlyEntryResponse(ORMBaseModel):
    id: int
    user_id: int
    year: int
    yearly_type: str
    yearly_field: Optional[str]
