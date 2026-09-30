import sys
import os

sys.path.append(os.path.abspath('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14'))

from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.deps import get_current_app_user

def override_get_current_app_user():
    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    return user

app.dependency_overrides[get_current_app_user] = override_get_current_app_user

client = TestClient(app)
try:
    response = client.get('/trackers/series/1399/preview')
    print(response.status_code)
    import json
    print(json.dumps(response.json(), indent=2)[:500])
except Exception as e:
    import traceback
    traceback.print_exc()
