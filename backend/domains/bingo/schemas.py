from __future__ import annotations
from typing import Optional
from pydantic import Field
from backend.core.schemas import ORMBaseModel, StrictBaseModel

class BingoEntryCreate(StrictBaseModel):
    year: int = Field(..., ge=1)
    testo: Optional[str] = None
    posizione: Optional[int] = Field(None, ge=1, le=25)
    rotazione: Optional[int] = Field(None, ge=-360, le=360)
    timbro: Optional[str] = None

class BingoEntryUpdate(StrictBaseModel):
    testo: Optional[str] = None
    done: Optional[bool] = None
    posizione: Optional[int] = Field(None, ge=1, le=25)
    rotazione: Optional[int] = Field(None, ge=-360, le=360)
    timbro: Optional[str] = None

class BingoEntryResponse(ORMBaseModel):
    id: int
    user_id: int
    year: int
    testo: Optional[str]
    done: bool
    posizione: Optional[int] = None
    rotazione: Optional[int] = None
    timbro: Optional[str] = None
