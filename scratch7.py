import os

file_path = "c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14\\backend\\domains\\trackers\\service.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

missing_func = """
def is_missing_overview(overview: str | None) -> bool:
    if not overview:
        return True
    lower_ov = overview.lower()
    missing_phrases = [
        "nessuna trama",
        "nessuna traduzione",
        "non abbiamo",
        "we don't have",
        "non ci sono",
        "nessun riassunto"
    ]
    return any(phrase in lower_ov for phrase in missing_phrases)

"""

if "def is_missing_overview" not in content:
    # Insert it right after imports
    content = content.replace("from backend.domains.trackers.schemas import (", missing_func + "from backend.domains.trackers.schemas import (")

old_fetch = """async def fetch_tmdb_series_details(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}"
    params = {"language": "it-IT"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata su TMDB")
    elif response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Errore TMDB")

    return response.json()"""

new_fetch = """async def fetch_tmdb_series_details(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}"
    params = {"language": "it-IT"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata su TMDB")
    elif response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Errore TMDB")

    data = response.json()
    if is_missing_overview(data.get("overview")):
        params_en = {"language": "en-US"}
        async with httpx.AsyncClient() as client:
            resp_en = await client.get(url, headers=get_tmdb_headers(), params=params_en)
            if resp_en.status_code == 200:
                data_en = resp_en.json()
                if not is_missing_overview(data_en.get("overview")):
                    data["overview"] = data_en["overview"]

    return data"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    print("Replaced fetch_tmdb_series_details")
else:
    print("Could not find fetch_tmdb_series_details")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
