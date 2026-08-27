"""
Router HTTP del dominio Google Calendar (prefix /google-calendar o /api/v1/google-calendar).
"""
from __future__ import annotations

import html
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.google_calendar import repository as repo
from backend.domains.google_calendar import schemas, service
from backend.domains.users.models import User

router = APIRouter(prefix="/google-calendar", tags=["google-calendar"])


@router.get("/auth-url", response_model=schemas.GoogleAuthUrlResponse)
def get_auth_url(
    current_user: User = Depends(deps.get_current_app_user),
):
    """Restituisce l'URL di autorizzazione Google per collegare l'account."""
    try:
        url = service.generate_auth_url(current_user.id)
        return schemas.GoogleAuthUrlResponse(url=url)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get("/callback", response_class=HTMLResponse)
def oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    db: Session = Depends(deps.get_db),
):
    """
    Endpoint di callback per il redirect OAuth 2.0 da parte di Google.
    Restituisce una pagina HTML che notifica la finestra principale (frontend) e si chiude.
    """
    if error:
        safe_error = html.escape(error)
        return HTMLResponse(
            content=f"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Autorizzazione Google Fallita</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #e11d48;">Accesso non riuscito</h2>
                <p>Google ha restituito il seguente errore: {safe_error}</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{ type: 'GOOGLE_AUTH_ERROR', error: '{safe_error}' }}, '*');
                        setTimeout(() => window.close(), 2500);
                    }}
                </script>
            </body>
            </html>
            """,
            status_code=400,
        )

    if not code or not state:
        return HTMLResponse(
            content="""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Parametri Mancanti</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #e11d48;">Parametri non validi</h2>
                <p>Codice di autorizzazione o stato mancanti.</p>
            </body>
            </html>
            """,
            status_code=400,
        )

    try:
        result = service.handle_oauth_callback(db, code, state)
        email = html.escape(result.get("google_email") or "")
        return HTMLResponse(
            content=f"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Google Calendar Connesso</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #f8fafc;">
                <div style="max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                    <h2 style="color: #0f172a; margin-bottom: 8px;">Connessione riuscita!</h2>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
                        Google Calendar è stato collegato con successo all'account <strong>{email}</strong>.
                    </p>
                    <p style="color: #94a3b8; font-size: 12px;">Questa finestra si chiuderà automaticamente...</p>
                </div>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{ type: 'GOOGLE_AUTH_SUCCESS', email: '{email}' }}, '*');
                        setTimeout(() => window.close(), 1200);
                    }} else {{
                        setTimeout(() => {{ window.location.href = '/'; }}, 2000);
                    }}
                </script>
            </body>
            </html>
            """
        )
    except Exception as exc:
        safe_exc = html.escape(str(exc))
        return HTMLResponse(
            content=f"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>Errore durante il collegamento</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #e11d48;">Errore durante il collegamento</h2>
                <p>{safe_exc}</p>
                <script>
                    if (window.opener) {{
                        window.opener.postMessage({{ type: 'GOOGLE_AUTH_ERROR', error: '{safe_exc}' }}, '*');
                        setTimeout(() => window.close(), 3000);
                    }}
                </script>
            </body>
            </html>
            """,
            status_code=500,
        )


@router.get("/status", response_model=schemas.GoogleCalendarStatusResponse)
def get_status(
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    """Restituisce lo stato attuale dell'integrazione Google Calendar."""
    auth = repo.get_user_auth(db, current_user.id)
    if not auth:
        return schemas.GoogleCalendarStatusResponse(
            is_connected=False,
            google_email=None,
            sync_enabled=False,
        )

    return schemas.GoogleCalendarStatusResponse(
        is_connected=True,
        google_email=auth.google_email,
        sync_enabled=auth.sync_enabled,
        created_at=auth.created_at,
        updated_at=auth.updated_at,
    )


@router.post("/toggle-sync", response_model=schemas.GoogleCalendarStatusResponse)
def toggle_sync(
    payload: schemas.GoogleSyncToggleRequest,
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    """Attiva o disattiva la sincronizzazione automatica degli eventi."""
    updated = service.toggle_sync(db, current_user, payload.sync_enabled)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Google Calendar non è collegato a questo account.",
        )
    return schemas.GoogleCalendarStatusResponse(
        is_connected=True,
        google_email=updated.google_email,
        sync_enabled=updated.sync_enabled,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )


@router.post("/sync", response_model=schemas.GoogleBidirectionalSyncResponse)
@router.post("/sync-all", response_model=schemas.GoogleBidirectionalSyncResponse)
def sync_events(
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    """Esegue la sincronizzazione bidirezionale completa tra Google Calendar e l'app."""
    try:
        res = service.sync_bidirectional(db, current_user)
        return schemas.GoogleBidirectionalSyncResponse(**res)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/disconnect", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def disconnect_google(
    current_user: User = Depends(deps.get_current_app_user),
    db: Session = Depends(deps.get_db),
):
    """Scollega l'account Google Calendar e rimuove i token memorizzati."""
    service.disconnect_google(db, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
