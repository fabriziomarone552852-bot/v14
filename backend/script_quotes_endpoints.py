import re

# Update service.py
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'r', encoding='utf-8') as f:
    service_content = f.read()

old_service = r'''def delete_quote\(db: Session, current_user: User, quote_id: int\) -> None:'''

new_service = '''def update_quote(db: Session, current_user: User, quote_id: int, quote_text: str):
    import sqlalchemy
    from backend.domains.trackers.models import TVQuote
    from backend.domains.trackers.schemas import TVQuoteResponse
    from fastapi import HTTPException, status
    stmt = sqlalchemy.select(TVQuote).where(TVQuote.id == quote_id, TVQuote.user_id == current_user.id)
    quote = db.execute(stmt).scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citazione non trovata.")
    quote.quote_text = quote_text
    db.commit()
    db.refresh(quote)
    return TVQuoteResponse.model_validate(quote)

def delete_quote(db: Session, current_user: User, quote_id: int) -> None:'''

service_content = re.sub(old_service, new_service, service_content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'w', encoding='utf-8') as f:
    f.write(service_content)


# Update router.py
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\router.py', 'r', encoding='utf-8') as f:
    router_content = f.read()

old_router = r'''@router.delete\("/quotes/\{quote_id\}", status_code=status\.HTTP_204_NO_CONTENT\)'''

new_router = '''class QuoteUpdate(BaseModel):
    quote_text: str

@router.patch("/quotes/{quote_id}", response_model=TVQuoteResponse)
def update_quote(
    quote_id: int,
    payload: QuoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_quote(db, current_user, quote_id, payload.quote_text)


@router.delete("/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)'''

router_content = re.sub(old_router, new_router, router_content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\router.py', 'w', encoding='utf-8') as f:
    f.write(router_content)

