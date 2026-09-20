import io
import os
import re
import time
import uuid
import httpx
from PIL import Image, ImageOps
from fastapi import HTTPException, status

from backend.core.settings import get_settings
from backend.domains.media.schemas import MediaUploadResponse

MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB
MAX_IMAGE_DIMENSION = 960
ALLOWED_IMAGE_FORMATS = {"JPEG", "JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"}


def _sanitize_folder(folder: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_\-]", "", folder).strip()
    return cleaned if cleaned else "general"


def process_and_save_image(
    file_bytes: bytes,
    original_filename: str = "",
    folder: str = "general",
) -> MediaUploadResponse:
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Il file immagine fornito è vuoto.",
        )

    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"L'immagine supera la dimensione massima consentita di {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    try:
        img = Image.open(io.BytesIO(file_bytes))
        img_format = (img.format or "").upper()
        if img_format not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato immagine non supportato: {img_format or 'sconosciuto'}. Usa GIF, JPG, PNG o WebP.",
            )

        folder_name = _sanitize_folder(folder)
        settings = get_settings()
        target_dir = os.path.join(settings.upload_dir, folder_name)
        os.makedirs(target_dir, exist_ok=True)

        # 🎬 Se è una GIF (animata o statica), la salviamo as-is senza alterare fotogrammi, colori o timing
        if img_format == "GIF" or getattr(img, "is_animated", False):
            filename = f"{uuid.uuid4().hex[:12]}_{int(time.time())}.gif"
            file_path = os.path.join(target_dir, filename)
            with open(file_path, "wb") as f:
                f.write(file_bytes)

            return MediaUploadResponse(
                url=f"/uploads/{folder_name}/{filename}",
                filename=filename,
                size_bytes=len(file_bytes),
                width=img.width,
                height=img.height,
                content_type="image/gif",
            )

        # 📸 Per foto normali (JPG, PNG, WebP): correggiamo EXIF, ridimensioniamo a max 960px e convertiamo in WebP
        img = ImageOps.exif_transpose(img)

        # Ridimensiona proporzionalmente per banner (max 960px)
        if img.width > MAX_IMAGE_DIMENSION or img.height > MAX_IMAGE_DIMENSION:
            img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)

        # Gestione colori e trasparenza per WebP
        if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
            if img.mode != "RGBA":
                img = img.convert("RGBA")
        elif img.mode != "RGB":
            img = img.convert("RGB")

        filename = f"{uuid.uuid4().hex[:12]}_{int(time.time())}.webp"
        file_path = os.path.join(target_dir, filename)

        # Salvataggio ottimizzato in WebP
        img.save(file_path, "WEBP", quality=82, method=6)

        final_size = os.path.getsize(file_path)
        final_url = f"/uploads/{folder_name}/{filename}"

        return MediaUploadResponse(
            url=final_url,
            filename=filename,
            size_bytes=final_size,
            width=img.width,
            height=img.height,
            content_type="image/webp",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore durante l'elaborazione dell'immagine: {str(exc)}",
        ) from exc


async def fetch_and_save_image_from_url(
    url: str,
    folder: str = "general",
) -> MediaUploadResponse:
    clean_url = url.strip()
    if not (clean_url.startswith("http://") or clean_url.startswith("https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'URL fornito deve iniziare con http:// o https://",
        )

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36 SmartAgenda/14.0"
        )
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(clean_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Impossibile scaricare l'immagine dall'URL fornito (Status {response.status_code}).",
                )

            content_type = response.headers.get("content-type", "")
            if content_type and not (
                "image" in content_type or "octet-stream" in content_type
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"L'URL non punta ad un'immagine valida (Content-Type: {content_type}).",
                )

            image_bytes = response.content
            return process_and_save_image(
                file_bytes=image_bytes,
                original_filename=clean_url.split("/")[-1].split("?")[0],
                folder=folder,
            )
    except HTTPException:
        raise
    except httpx.RequestError as req_err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore di rete durante il recupero dell'immagine: {str(req_err)}",
        ) from req_err
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore durante l'elaborazione dell'immagine da URL: {str(exc)}",
        ) from exc
