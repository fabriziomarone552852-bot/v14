import sys
import os

sys.path.append(os.path.abspath('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14'))

import backend.main  # Initialize all mappers
from fastapi.testclient import TestClient
from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.deps import get_current_app_user

def override_get_current_app_user():
    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    return user

backend.main.app.dependency_overrides[get_current_app_user] = override_get_current_app_user

client = TestClient(backend.main.app)
try:
    response = client.get('/trackers/series/66551/preview')
    print("STATUS:", response.status_code)
    import json
    data = response.json()
    print("OVERVIEW:", data.get('overview'))
    print("TOTAL EPISODES:", data.get('total_episodes'))
    print("EPISODES LEN:", len(data.get('episodes', [])))
except Exception as e:
    import traceback
    traceback.print_exc()
