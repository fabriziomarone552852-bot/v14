import sys
sys.path.append('c:/Users/Fabrizio/Desktop/app/smart/v14')

import os
os.environ["APP_ENV"] = "test"

from backend.core.database import SessionLocal
from backend.domains.system_boot.guards import _compute_boot_status

def test():
    db = SessionLocal()
    try:
        print("Computing boot status...")
        status = _compute_boot_status(db)
        print("Status:", status)
    except Exception as e:
        print("CRASH:", e)
    finally:
        db.close()

test()
