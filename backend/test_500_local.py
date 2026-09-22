import sys
import traceback

sys.path.append('c:/Users/Fabrizio/Desktop/app/smart/v14')

print("Importing models...")
# Import models manually instead of import_all_models to avoid ensure_database_schema_compat
import backend.domains.audit.models  
import backend.domains.bingo.models  
import backend.domains.categories.models  
import backend.domains.config.models  
import backend.domains.countdowns.models  
import backend.domains.events.models  
import backend.domains.feedback.models  
import backend.domains.google_calendar.models  
import backend.domains.habits.models  
import backend.domains.monthly_entries.models  
import backend.domains.notifications.models  
import backend.domains.planning.models  
import backend.domains.shopping.models  
import backend.domains.system_boot.models  
import backend.domains.tasks.models  
import backend.domains.users.models  
import backend.domains.yearly_entries.models  
import backend.domains.social.models
import backend.domains.trackers.models
print("Models imported")

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.domains.trackers.service import list_user_series

def test():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("No user found")
            return
        print(f"Testing for user {user.id}")
        res = list_user_series(db, user)
        print("Success, found", len(res), "series")
    except Exception as e:
        print("ERROR:")
        traceback.print_exc()
    finally:
        db.close()

test()
