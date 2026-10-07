with open("backend/domains/trackers/service.py", "r", encoding="utf-8") as f:
    content = f.read()

import re

# 1. Update time_trend to Dict[str, List[TimeTrendStat]]
time_trend_old = """    # --- Time Trend (Last 12 months) ---
    time_trend_map = defaultdict(int)
    for log in episode_logs:
        if log.watched_at:
            period = log.watched_at.strftime("%Y-%m")
            time_trend_map[period] += 1
            
    time_trend = []
    for period, count in sorted(time_trend_map.items()):
        time_trend.append(TimeTrendStat(
            period=period,
            episodes=count,
            hours=round((count * DEFAULT_RUNTIME) / 60, 1)
        ))"""

time_trend_new = """    # --- Time Trend (By Year) ---
    time_trend_map = defaultdict(lambda: defaultdict(int))
    for log in episode_logs:
        if log.watched_at:
            year = log.watched_at.strftime("%Y")
            period = log.watched_at.strftime("%b").capitalize()  # e.g., 'Gen', 'Feb'
            time_trend_map[year][period] += 1
            
    time_trend = {}
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    # localized roughly
    month_names = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
    
    # Reprocess properly to have all 12 months for every year found
    years_found = list(time_trend_map.keys())
    if not years_found:
        years_found = [now.strftime("%Y")]
        
    for year in years_found:
        time_trend[year] = []
        for eng_m, ita_m in zip(months, month_names):
            # check both English and Italian just in case locale affects strftime
            count = time_trend_map[year].get(eng_m, 0) + time_trend_map[year].get(ita_m, 0)
            time_trend[year].append(TimeTrendStat(
                period=ita_m,
                episodes=count,
                hours=round((count * DEFAULT_RUNTIME) / 60, 1)
            ))"""

content = content.replace(time_trend_old, time_trend_new)


# 2. Update viewing_habits by_day to use last 7 days
viewing_habits_old = """    # --- Viewing Habits ---
    by_day = defaultdict(int)
    by_time = {"Mattina (6-12)": 0, "Pomeriggio (12-18)": 0, "Sera (18-24)": 0, "Notte (0-6)": 0}
    
    weekdays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    for w in weekdays:
        by_day[w] = 0
        
    for log in episode_logs:
        if log.watched_at:
            wday = log.watched_at.weekday()
            by_day[weekdays[wday]] += 1
            h = log.watched_at.hour
            if 6 <= h < 12:
                by_time["Mattina (6-12)"] += 1
            elif 12 <= h < 18:
                by_time["Pomeriggio (12-18)"] += 1
            elif 18 <= h <= 23:
                by_time["Sera (18-24)"] += 1
            else:
                by_time["Notte (0-6)"] += 1"""


viewing_habits_new = """    # --- Viewing Habits ---
    by_day = {}
    by_time = {"Mattina (6-12)": 0, "Pomeriggio (12-18)": 0, "Sera (18-24)": 0, "Notte (0-6)": 0}
    
    weekdays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    
    # Initialize the last 7 days ending yesterday/today
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
                by_day[key] += 1
                
            h = log.watched_at.hour
            if 6 <= h < 12:
                by_time["Mattina (6-12)"] += 1
            elif 12 <= h < 18:
                by_time["Pomeriggio (12-18)"] += 1
            elif 18 <= h <= 23:
                by_time["Sera (18-24)"] += 1
            else:
                by_time["Notte (0-6)"] += 1"""
                
content = content.replace(viewing_habits_old, viewing_habits_new)

with open("backend/domains/trackers/service.py", "w", encoding="utf-8") as f:
    f.write(content)
