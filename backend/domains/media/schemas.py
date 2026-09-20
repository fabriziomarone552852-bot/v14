from typing import Optional
from pydantic import BaseModel, Field


class MediaUploadResponse(BaseModel):
    url: str = Field(..., description="URL relativo dell'immagine servita dal backend")
    filename: str = Field(..., description="Nome file salvato sul filesystem")
    size_bytes: int = Field(..., description="Dimensione del file in byte")
    width: int = Field(..., description="Larghezza in pixel")
    height: int = Field(..., description="Altezza in pixel")
    content_type: str = Field(default="image/webp", description="MIME type dell'immagine")


class MediaFetchUrlRequest(BaseModel):
    url: str = Field(..., min_length=5, max_length=2048, description="URL esterno dell'immagine da scaricare")
    folder: Optional[str] = Field(default="general", max_length=64, description="Sottocartella di destinazione (es. habits, countdowns)")
