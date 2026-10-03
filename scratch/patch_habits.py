with open("backend/domains/trackers/service.py", "r", encoding="utf-8") as f:
    content = f.read()

viewing_habits_old = """    # Initialize the last 7 days ending yesterday/today
    last_7_dates = [(now - datetime.timedelta(days=i)).date() for i in range(6, -1, -1)]
    for d in last_7_dates:
        name = weekdays[d.weekday()]
        # To make keys unique and ordered, we use 'Day (DD/MM)'
        key = f"{name} ({d.strftime('%d/%m')})"
        by_day[key] = 0
        
    for log in episode_logs:
        if log.watched_at:
            d = log.watched_at.date()
            if d in last_7_dates:
                name = weekdays[d.weekday()]
                key = f"{name} ({d.strftime('%d/%m')})"
                by_day[key] += 1"""

viewing_habits_new = """    # Initialize the last 7 days ending yesterday
    # If today is Saturday, we want [Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday, Friday]
    last_7_dates = [(now - datetime.timedelta(days=i)).date() for i in range(7, 0, -1)]
    for d in last_7_dates:
        name = weekdays[d.weekday()]
        key = name
        by_day[key] = 0
        
    for log in episode_logs:
        if log.watched_at:
            d = log.watched_at.date()
            if d in last_7_dates:
                name = weekdays[d.weekday()]
                key = name
                by_day[key] += 1"""

content = content.replace(viewing_habits_old, viewing_habits_new)

with open("backend/domains/trackers/service.py", "w", encoding="utf-8") as f:
    f.write(content)
