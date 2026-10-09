import os

router_path = 'c:/Users/Fabrizio/Desktop/app/smart/v14/backend/domains/trackers/router.py'

content = '''

@router.get("/tmdb/genres")
async def get_tmdb_genres(
    current_user: User = Depends(get_current_app_user),
):
    return await service.get_tmdb_genres()

@router.get("/tmdb/providers")
async def get_tmdb_providers(
    current_user: User = Depends(get_current_app_user),
):
    return await service.get_tmdb_providers()

@router.get("/tmdb/discover", response_model=TMDBPaginatedSearch)
async def discover_tmdb_series(
    with_genres: Optional[str] = None,
    with_networks: Optional[str] = None,
    first_air_date_year: Optional[str] = None,
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_app_user),
):
    return await service.discover_tmdb_series(
        with_genres=with_genres,
        with_networks=with_networks,
        first_air_date_year=first_air_date_year,
        page=page
    )
'''
with open(router_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('# --- TV Platforms ---', content + '\n# --- TV Platforms ---')

with open(router_path, 'w', encoding='utf-8') as f:
    f.write(text)
