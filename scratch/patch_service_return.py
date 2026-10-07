with open("backend/domains/trackers/service.py", "r", encoding="utf-8") as f:
    content = f.read()

import re

tv_stats_old = """    return TVFullStats(
        general_stats=general_stats,
        genres_distribution=genres_distribution,
        time_trend=time_trend,
        total_watch_time=total_watch_time,
        completion_rate=completion_rate,
        watchlist_forecast=watchlist_forecast,
        platform_distribution=platform_distribution,
        viewing_habits=viewing_habits,
        graveyard=graveyard,
        satisfaction_index=satisfaction_index,
        personal_records=personal_records,
        series_ratings_distribution=series_ratings_distribution,
        episode_ratings_distribution=episode_ratings_distribution,
        ratings_by_genre=ratings_by_genre,
        top_10_series=top_10_series,
        most_rewatched=most_rewatched,
        rewatch_comparison=rewatch_comparison
    )"""

tv_stats_new = """    return TVFullStats(
        general_stats=general_stats,
        genres_distribution=genres_distribution,
        time_trend=time_trend,
        total_watch_time=total_watch_time,
        completion_rate=completion_rate,
        watchlist_forecast=watchlist_forecast,
        platform_distribution=platform_distribution,
        viewing_habits=viewing_habits,
        graveyard=graveyard,
        satisfaction_index=satisfaction_index,
        personal_records=personal_records,
        series_ratings_distribution=series_ratings_distribution,
        episode_ratings_distribution=episode_ratings_distribution,
        ratings_by_genre=ratings_by_genre,
        top_10_series=top_10_series,
        most_rewatched=most_rewatched,
        rewatch_comparison=rewatch_comparison,
        guilty_pleasures=guilty_pleasures
    )"""

content = content.replace(tv_stats_old, tv_stats_new)

with open("backend/domains/trackers/service.py", "w", encoding="utf-8") as f:
    f.write(content)
