import os

service_path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/trackers/service.py'
content = '''

async def get_tmdb_genres():
    url = f"{TMDB_BASE_URL}/genre/tv/list"
    params = {"language": "it-IT"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    return {"genres": []}

async def get_tmdb_providers():
    url = f"{TMDB_BASE_URL}/watch/providers/tv"
    params = {"language": "it-IT", "watch_region": "IT"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)
    if response.status_code == 200:
        return response.json()
    return {"results": []}

async def discover_tmdb_series(with_genres: str = None, with_networks: str = None, first_air_date_year: str = None, page: int = 1) -> TMDBPaginatedSearch:
    url = f"{TMDB_BASE_URL}/discover/tv"
    params = {
        "include_adult": "false",
        "language": "it-IT",
        "page": str(page),
        "sort_by": "popularity.desc",
        "watch_region": "IT"
    }
    if with_genres:
        params["with_genres"] = with_genres
    if with_networks:
        params["with_watch_providers"] = with_networks
    if first_air_date_year:
        params["first_air_date_year"] = first_air_date_year

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Errore da TMDB API")

    data = response.json()
    results = [TMDBSeriesSearchResult(**item) for item in data.get("results", [])]
    return TMDBPaginatedSearch(
        page=data.get("page", 1),
        results=results,
        total_pages=data.get("total_pages", 0),
        total_results=data.get("total_results", 0)
    )
'''
with open(service_path, 'a', encoding='utf-8') as f:
    f.write(content)
