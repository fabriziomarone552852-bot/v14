import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from backend.core.database import SessionLocal
from backend.domains.trackers import repository

db = SessionLocal()
eps = repository.get_series_episodes_with_user_tracking(db, 1413, 1)
print(f"Episodes count: {len(eps)}")
if len(eps) > 0:
    print(eps[0])
