from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from backend.core.deps import get_current_app_user
from backend.domains.media.schemas import MediaFetchUrlRequest, MediaUploadResponse
from backend.domains.media.service import fetch_and_save_image_from_url, process_and_save_image
from backend.domains.users.models import User

router = APIRouter(prefix="/media", tags=["media"])


@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Carica un'immagine da file (dispositivo) e la salva ottimizzata in WebP",
)
async def upload_image(
    file: UploadFile = File(..., description="File immagine binario"),
    folder: str = Form("general", description="Cartella tematica di destinazione"),
    current_user: User = Depends(get_current_app_user),
):
    file_bytes = await file.read()
    return process_and_save_image(
        file_bytes=file_bytes,
        original_filename=file.filename or "",
        folder=folder,
    )


@router.post(
    "/fetch-url",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Scarica un'immagine da URL esterno e la memorizza in locale ottimizzata",
)
async def fetch_image_from_url(
    payload: MediaFetchUrlRequest,
    current_user: User = Depends(get_current_app_user),
):
    return await fetch_and_save_image_from_url(
        url=payload.url,
        folder=payload.folder or "general",
    )
