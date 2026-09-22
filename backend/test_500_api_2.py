import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_data = {"username": "admin@sinasce.lol", "password": "Password-Robusta"}
        res = await client.post("http://localhost:8000/auth/login", data=login_data)
        token = res.json().get("access_token")
        print("Token:", token)
        
        # 2. Call API
        headers = {"Authorization": f"Bearer {token}", "Origin": "http://localhost:5173"}
        print("Sending request...")
        res2 = await client.get("http://localhost:8000/trackers/series", headers=headers)
        print("Status:", res2.status_code)
        print("Body:", res2.text)

asyncio.run(test())
