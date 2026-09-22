import sys
import asyncio
import httpx

sys.path.append('c:/Users/Fabrizio/Desktop/app/smart/v14')

from backend.core.models import import_all_models
import_all_models()

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.deps import create_access_token

async def test():
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found.")
        return
    
    token = create_access_token(data={"sub": user.email, "type": "access", "scope": "app"})
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}", "Origin": "http://localhost:5173"}
        res = await client.get("http://localhost:8000/trackers/series", headers=headers)
        print("Status:", res.status_code)
        print("Body:", res.text)

asyncio.run(test())
