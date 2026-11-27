"""Pydantic schemas for the Daily Horoscope domain."""
from typing import Dict, Optional
from pydantic import BaseModel, Field


class HoroscopeSignEntry(BaseModel):
    """Previsione giornaliera strutturata per un singolo segno zodiacale."""

    sign: str = Field(..., description="Slug del segno (es. leone)")
    name: str = Field(..., description="Nome italiano del segno (es. Leone)")
    symbol: str = Field(..., description="Simbolo unicode dello zodiaco (es. ♌)")
    date_range: str = Field(..., description="Arco di date del segno (es. 23 Lug - 22 Ago)")
    date_label: Optional[str] = Field(None, description="Data estesa riportata dalla fonte")
    general: str = Field(..., description="Quadro astrale generale del giorno")
    love: Optional[str] = Field(None, description="Sezione Amore ed Eros")
    work: Optional[str] = Field(None, description="Sezione Lavoro e Denaro")
    wellness: Optional[str] = Field(None, description="Sezione Benessere e Consiglio")
    source: str = Field(..., description="Fonte editoriale del testo")


class DailyHoroscopeCollectionResponse(BaseModel):
    """Collezione completa dei 12 segni per il Mazzo di Carte in RAM sul client."""

    date: str = Field(..., description="Data di riferimento YYYY-MM-DD")
    updated_at: str = Field(..., description="Timestamp ISO ultimo aggiornamento cache")
    signs: Dict[str, HoroscopeSignEntry] = Field(
        default_factory=dict,
        description="Dizionario indicizzato per slug del segno (ariete..pesci)",
    )
