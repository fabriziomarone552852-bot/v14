import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        res = await client.get("http://localhost:8000/trackers/series", headers={"Origin": "http://localhost:5173"})
        print("Status:", res.status_code)
        print("Headers:", res.headers)

asyncio.run(test())
