import sys
import sqlalchemy
sys.path.append('.')
from backend.core.settings import get_settings
from sqlalchemy import create_engine
engine = create_engine(get_settings().database_url)
with engine.connect() as conn:
    res = conn.execute(sqlalchemy.text('SELECT * FROM tv_user_platforms;')).fetchall()
    print("Platforms:", res)
    res2 = conn.execute(sqlalchemy.text('SELECT id, viewing_platform_id FROM tv_user_series_logs ORDER BY id DESC LIMIT 10;')).fetchall()
    print("Logs:", res2)
