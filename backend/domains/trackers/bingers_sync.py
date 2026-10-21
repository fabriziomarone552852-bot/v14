"""
Service for Bingers Sync (Bidirectional Import and Export).
Handles parsing ZIP / CSV archives and generating export archives.
"""

import csv
import io
import zipfile
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any

from fastapi import UploadFile
from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session

from backend.domains.trackers.models import (
    TMDBSeries,
    TMDBEpisode,
    UserSeriesTracking,
    UserEpisodeLog,
    UserSeriesLog,
    MediaList,
    MediaListItem,
)
from backend.domains.trackers import service
from backend.domains.users.models import User

logger = logging.getLogger(__name__)


def parse_iso_datetime(date_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO datetime string with timezone awareness."""
    if not date_str:
        return None
    cleaned = date_str.strip()
    if not cleaned:
        return None
    try:
        if cleaned.endswith("Z"):
            cleaned = cleaned[:-1] + "+00:00"
        return datetime.fromisoformat(cleaned)
    except Exception:
        try:
            # Fallback for YYYY-MM-DD
            d = datetime.strptime(cleaned[:10], "%Y-%m-%d")
            return d.replace(tzinfo=timezone.utc)
        except Exception:
            return None


def format_iso_datetime(dt: Optional[datetime]) -> str:
    """Format datetime as ISO 8601 with Z suffix."""
    if not dt:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


async def extract_csv_contents_from_upload(files: List[UploadFile]) -> Dict[str, str]:
    """
    Extracts text contents of CSV files from either:
    1) A single uploaded .zip archive containing the CSVs.
    2) Multiple uploaded .csv files.
    
    Returns a dictionary mapping canonical keys ('library', 'watches', 'ratings', 'lists')
    to their string content.
    """
    csv_map: Dict[str, str] = {}

    for file in files:
        filename = (file.filename or "").lower()
        content = await file.read()

        if filename.endswith(".zip"):
            try:
                with zipfile.ZipFile(io.BytesIO(content)) as z:
                    for zip_info in z.infolist():
                        inner_name = zip_info.filename.lower()
                        if inner_name.endswith(".csv"):
                            with z.open(zip_info) as f:
                                text = f.read().decode("utf-8-sig", errors="replace")
                                _categorize_and_store_csv(inner_name, text, csv_map)
            except Exception as e:
                logger.error(f"Errore apertura archivio ZIP {filename}: {e}")
        elif filename.endswith(".csv"):
            text = content.decode("utf-8-sig", errors="replace")
            _categorize_and_store_csv(filename, text, csv_map)

    return csv_map


def _categorize_and_store_csv(filename: str, text: str, csv_map: Dict[str, str]) -> None:
    """Classifies a CSV filename into its canonical Bingers bucket."""
    name = filename.lower()
    if "library" in name or "media" in name:
        csv_map["library"] = text
    elif "watch" in name or "episode" in name:
        csv_map["watches"] = text
    elif "rating" in name or "vote" in name:
        csv_map["ratings"] = text
    elif "list" in name:
        csv_map["lists"] = text


async def process_bingers_import(db: Session, user: User, files: List[UploadFile]) -> Dict[str, Any]:
    """
    Main orchestration logic for importing Bingers data.
    Parses library.csv, watches.csv, ratings.csv, and lists.csv.
    """
    csv_contents = await extract_csv_contents_from_upload(files)

    result = {
        "success": True,
        "series_imported": 0,
        "episodes_logged": 0,
        "ratings_imported": 0,
        "lists_created": 0,
        "movies_skipped": 0,
        "warnings": [],
        "errors": [],
    }

    if not csv_contents:
        result["success"] = False
        result["errors"].append("Nessun file CSV valido (o archivio ZIP) rilevato nell'upload.")
        return result

    # 1. Ingestione library.csv (Serie TV)
    series_id_map: Dict[int, TMDBSeries] = {}
    if "library" in csv_contents:
        await _import_library_csv(db, user, csv_contents["library"], series_id_map, result)

    # 2. Ingestione watches.csv (Diario Puntate Viste)
    watches_map: Dict[Tuple[int, int, int], List[UserEpisodeLog]] = {}
    watches_timestamps: Dict[Tuple[int, int, int], datetime] = {}

    if "watches" in csv_contents:
        await _import_watches_csv(
            db, user, csv_contents["watches"], series_id_map, result, watches_map, watches_timestamps
        )

    # 3. Ingestione ratings.csv (Voti)
    if "ratings" in csv_contents:
        await _import_ratings_csv(
            db, user, csv_contents["ratings"], series_id_map, result, watches_map, watches_timestamps
        )

    # 4. Ingestione lists.csv (Liste Personali)
    if "lists" in csv_contents:
        await _import_lists_csv(db, user, csv_contents["lists"], series_id_map, result)

    db.commit()
    return result


async def _import_library_csv(
    db: Session,
    user: User,
    csv_text: str,
    series_id_map: Dict[int, TMDBSeries],
    result: Dict[str, Any],
) -> None:
    reader = csv.DictReader(io.StringIO(csv_text))
    
    # Cache existing user trackings
    existing_trackings_stmt = select(UserSeriesTracking).where(UserSeriesTracking.user_id == user.id)
    existing_trackings = {t.series_tmdb_id: t for t in db.execute(existing_trackings_stmt).scalars().all()}

    # Check for favorite list
    fav_list = db.execute(
        select(MediaList).where(MediaList.user_id == user.id, MediaList.name == "Preferite")
    ).scalar_one_or_none()

    for row in reader:
        media_type = (row.get("type") or "").strip().lower()
        if media_type == "movie":
            result["movies_skipped"] += 1
            continue

        tmdb_id_str = (row.get("tmdb_id") or "").strip()
        if not tmdb_id_str or not tmdb_id_str.isdigit():
            continue
        tmdb_id = int(tmdb_id_str)

        # 1. Check or fetch TMDB Series
        tmdb_series = db.execute(select(TMDBSeries).where(TMDBSeries.tmdb_id == tmdb_id)).scalar_one_or_none()
        if not tmdb_series:
            try:
                tmdb_series = await service.sync_tmdb_series_lazy(db, tmdb_id)
            except Exception as e:
                logger.warning(f"Impossibile sincronizzare metadati TMDB per id {tmdb_id}: {e}")
                title = row.get("title") or row.get("original_title") or f"Serie {tmdb_id}"
                tmdb_series = TMDBSeries(
                    tmdb_id=tmdb_id,
                    title=title,
                    original_title=row.get("original_title"),
                    last_sync_at=datetime.now(timezone.utc),
                )
                db.add(tmdb_series)
                db.flush()

        series_id_map[tmdb_id] = tmdb_series

        # 2. Determine tracking status
        list_status = (row.get("list_status") or "").strip().lower()
        stopped_watching_at = (row.get("stopped_watching_at") or "").strip()
        for_later_at = (row.get("for_later_at") or "").strip()

        if stopped_watching_at or list_status in ["stopped_watching", "dropped"]:
            status_val = "dropped"
        elif for_later_at or list_status in ["for_later", "to_watch"]:
            status_val = "to_watch"
        elif list_status in ["completed", "watched"]:
            status_val = "completed"
        elif list_status in ["on_hold", "paused"]:
            status_val = "on_hold"
        else:
            status_val = "watching"

        added_at = parse_iso_datetime(row.get("added_at")) or datetime.now(timezone.utc)
        is_favorite = (row.get("favorite") or "").strip().lower() in ["yes", "true", "1"]

        # 3. Upsert UserSeriesTracking
        tracking = existing_trackings.get(tmdb_id)
        if tracking:
            tracking.status = status_val
            tracking.added_at = added_at
            tracking.updated_at = datetime.now(timezone.utc)
        else:
            tracking = UserSeriesTracking(
                user_id=user.id,
                series_tmdb_id=tmdb_id,
                status=status_val,
                added_at=added_at,
            )
            db.add(tracking)
            existing_trackings[tmdb_id] = tracking

        result["series_imported"] += 1

        # 4. Handle favorite
        if is_favorite:
            if not fav_list:
                fav_list = MediaList(user_id=user.id, name="Preferite", description="Le tue serie preferite", visibility="private")
                db.add(fav_list)
                db.flush()
            
            fav_item_exists = db.execute(
                select(MediaListItem.id).where(MediaListItem.list_id == fav_list.id, MediaListItem.series_tmdb_id == tmdb_id)
            ).scalar_one_or_none()
            if not fav_item_exists:
                db.add(MediaListItem(list_id=fav_list.id, series_tmdb_id=tmdb_id))

    db.flush()


async def _import_watches_csv(
    db: Session,
    user: User,
    csv_text: str,
    series_id_map: Dict[int, TMDBSeries],
    result: Dict[str, Any],
    watches_map: Dict[Tuple[int, int, int], List[UserEpisodeLog]],
    watches_timestamps: Dict[Tuple[int, int, int], datetime],
) -> None:
    reader = csv.DictReader(io.StringIO(csv_text))
    
    for row in reader:
        tmdb_id_str = (row.get("tmdb_id") or "").strip()
        season_str = (row.get("season_number") or "").strip()
        episode_str = (row.get("episode_number") or "").strip()

        if not (tmdb_id_str.isdigit() and season_str.isdigit() and episode_str.isdigit()):
            continue

        tmdb_id = int(tmdb_id_str)
        season_num = int(season_str)
        ep_num = int(episode_str)
        key = (tmdb_id, season_num, ep_num)

        # Find episode in tmdb_episodes
        ep = db.execute(
            select(TMDBEpisode).where(
                TMDBEpisode.series_tmdb_id == tmdb_id,
                TMDBEpisode.season_number == season_num,
                TMDBEpisode.episode_number == ep_num,
            )
        ).scalar_one_or_none()

        if not ep:
            ep = TMDBEpisode(
                series_tmdb_id=tmdb_id,
                season_number=season_num,
                episode_number=ep_num,
                title=f"Episodio {ep_num}",
            )
            db.add(ep)
            db.flush()

        watched_at = (
            parse_iso_datetime(row.get("last_watched_at"))
            or parse_iso_datetime(row.get("first_watched_at"))
            or datetime.now(timezone.utc)
        )
        watches_timestamps[key] = watched_at

        plays_str = (row.get("plays") or "1").strip()
        plays = int(plays_str) if plays_str.isdigit() else 1
        if plays < 1:
            plays = 1

        # Query all existing logs for this user and episode
        existing_logs = db.execute(
            select(UserEpisodeLog)
            .where(
                UserEpisodeLog.user_id == user.id,
                UserEpisodeLog.episode_id == ep.id,
            )
            .order_by(UserEpisodeLog.watched_at.desc())
        ).scalars().all()

        if key not in watches_map:
            watches_map[key] = []

        # Check if an existing log matches this exact watched_at timestamp (within 60s)
        matching_log = None
        for el in existing_logs:
            if el.watched_at and abs((el.watched_at - watched_at).total_seconds()) < 60:
                matching_log = el
                break

        if matching_log:
            # Already imported from a previous run; register for rating attribution
            watches_map[key].append(matching_log)
        else:
            # Need to create new log(s) for this Bingers watch
            for _ in range(plays):
                new_log = UserEpisodeLog(
                    user_id=user.id,
                    episode_id=ep.id,
                    watched_at=watched_at,
                )
                db.add(new_log)
                db.flush()
                watches_map[key].append(new_log)
                result["episodes_logged"] += 1

    db.flush()


async def _import_ratings_csv(
    db: Session,
    user: User,
    csv_text: str,
    series_id_map: Dict[int, TMDBSeries],
    result: Dict[str, Any],
    watches_map: Dict[Tuple[int, int, int], List[UserEpisodeLog]],
    watches_timestamps: Dict[Tuple[int, int, int], datetime],
) -> None:
    reader = csv.DictReader(io.StringIO(csv_text))

    for row in reader:
        tmdb_id_str = (row.get("tmdb_id") or "").strip()
        rating_str = (row.get("rating") or "").strip()

        if not tmdb_id_str.isdigit() or not rating_str:
            continue

        try:
            raw_rating = float(rating_str)
            raw_rating = max(1.0, min(5.0, raw_rating))
            # Bingers scale is 1.0 - 5.0 stars.
            # Vita DB scale is 1.0 - 10.0 (half-star steps: db_rating / 2.0 = star count).
            vita_rating = round(raw_rating * 2.0, 1)
            if vita_rating.is_integer():
                vita_rating = float(int(vita_rating))
        except ValueError:
            continue

        tmdb_id = int(tmdb_id_str)
        season_str = (row.get("season_number") or "").strip()
        episode_str = (row.get("episode_number") or "").strip()

        if season_str.isdigit() and episode_str.isdigit():
            season_num = int(season_str)
            ep_num = int(episode_str)
            key = (tmdb_id, season_num, ep_num)

            ep = db.execute(
                select(TMDBEpisode).where(
                    TMDBEpisode.series_tmdb_id == tmdb_id,
                    TMDBEpisode.season_number == season_num,
                    TMDBEpisode.episode_number == ep_num,
                )
            ).scalar_one_or_none()

            if ep:
                target_log = None

                # 1. First, check if watches_map has an unrated log from this Bingers import (or one with old 1-5 scale)
                if key in watches_map:
                    for l in watches_map[key]:
                        if l.rating is None or l.rating == raw_rating:
                            target_log = l
                            break

                # 2. If not found in watches_map, inspect existing logs in DB
                if not target_log:
                    existing_logs = db.execute(
                        select(UserEpisodeLog)
                        .where(UserEpisodeLog.user_id == user.id, UserEpisodeLog.episode_id == ep.id)
                        .order_by(UserEpisodeLog.watched_at.desc())
                    ).scalars().all()

                    # Look for a log without rating and without notes, or one matching raw_rating to upgrade
                    for l in existing_logs:
                        if (l.rating is None and not l.notes) or l.rating == raw_rating:
                            target_log = l
                            break

                    # 3. If ALL existing logs already have a rating or notes (separate reviews in Vita),
                    # check if one already matches this rating and timestamp (idempotence)
                    if not target_log:
                        already_has_rating = False
                        b_ts = watches_timestamps.get(key)
                        for l in existing_logs:
                            if l.rating in (vita_rating, raw_rating):
                                if b_ts and l.watched_at and abs((l.watched_at - b_ts).total_seconds()) < 60:
                                    l.rating = vita_rating
                                    already_has_rating = True
                                    target_log = l
                                    break
                                elif not b_ts:
                                    l.rating = vita_rating
                                    already_has_rating = True
                                    target_log = l
                                    break

                        if not already_has_rating:
                            # Create a second review / log for this distinct rating!
                            target_log = UserEpisodeLog(
                                user_id=user.id,
                                episode_id=ep.id,
                                rating=vita_rating,
                                watched_at=watches_timestamps.get(key) or datetime.now(timezone.utc),
                            )
                            db.add(target_log)
                            db.flush()
                            result["ratings_imported"] += 1
                            continue

                if target_log:
                    target_log.rating = vita_rating
                    result["ratings_imported"] += 1
        else:
            # Whole series rating
            existing_series_logs = db.execute(
                select(UserSeriesLog)
                .where(UserSeriesLog.user_id == user.id, UserSeriesLog.series_tmdb_id == tmdb_id)
                .order_by(UserSeriesLog.created_at.desc())
            ).scalars().all()

            target_series_log = None
            for sl in existing_series_logs:
                if (sl.rating is None and not sl.notes) or sl.rating == raw_rating:
                    target_series_log = sl
                    break

            if not target_series_log:
                already_matched = any(sl.rating in (vita_rating, raw_rating) for sl in existing_series_logs)
                if not already_matched and len(existing_series_logs) > 0:
                    # User already had a different series review, create an additional one
                    target_series_log = UserSeriesLog(
                        user_id=user.id,
                        series_tmdb_id=tmdb_id,
                        rating=vita_rating,
                        watched_at=datetime.now(timezone.utc),
                    )
                    db.add(target_series_log)
                    db.flush()
                    result["ratings_imported"] += 1
                    continue
                elif existing_series_logs:
                    target_series_log = existing_series_logs[0]
                else:
                    target_series_log = UserSeriesLog(
                        user_id=user.id,
                        series_tmdb_id=tmdb_id,
                        rating=vita_rating,
                        watched_at=datetime.now(timezone.utc),
                    )
                    db.add(target_series_log)
                    db.flush()
                    result["ratings_imported"] += 1
                    continue

            if target_series_log:
                target_series_log.rating = vita_rating
                target_series_log.updated_at = datetime.now(timezone.utc)
                result["ratings_imported"] += 1

    db.flush()


async def _import_lists_csv(
    db: Session,
    user: User,
    csv_text: str,
    series_id_map: Dict[int, TMDBSeries],
    result: Dict[str, Any],
) -> None:
    reader = csv.DictReader(io.StringIO(csv_text))
    
    existing_lists = {
        l.name.strip().lower(): l
        for l in db.execute(select(MediaList).where(MediaList.user_id == user.id)).scalars().all()
    }

    lists_created_set = set()

    for row in reader:
        list_name = (row.get("list_name") or "").strip()
        if not list_name:
            continue

        list_desc = (row.get("list_description") or "").strip()
        tmdb_id_str = (row.get("tmdb_id") or "").strip()

        key = list_name.lower()
        media_list = existing_lists.get(key)
        if not media_list:
            media_list = MediaList(
                user_id=user.id,
                name=list_name,
                description=list_desc if list_desc else None,
                visibility="private",
            )
            db.add(media_list)
            db.flush()
            existing_lists[key] = media_list
            lists_created_set.add(key)

        if tmdb_id_str.isdigit():
            tmdb_id = int(tmdb_id_str)
            item_exists = db.execute(
                select(MediaListItem.id).where(
                    MediaListItem.list_id == media_list.id,
                    MediaListItem.series_tmdb_id == tmdb_id,
                )
            ).scalar_one_or_none()

            if not item_exists:
                db.add(MediaListItem(list_id=media_list.id, series_tmdb_id=tmdb_id))

    result["lists_created"] += len(lists_created_set)
    db.flush()


def generate_bingers_export_archive(db: Session, user: User) -> io.BytesIO:
    """
    Generates a ZIP archive containing 4 CSV files formatted to Bingers specifications:
    1. library.csv
    2. watches.csv
    3. ratings.csv
    4. lists.csv
    """
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        # 1. library.csv
        library_csv = _generate_library_csv(db, user)
        z.writestr("library.csv", library_csv)

        # 2. watches.csv
        watches_csv = _generate_watches_csv(db, user)
        z.writestr("watches.csv", watches_csv)

        # 3. ratings.csv
        ratings_csv = _generate_ratings_csv(db, user)
        z.writestr("ratings.csv", ratings_csv)

        # 4. lists.csv
        lists_csv = _generate_lists_csv(db, user)
        z.writestr("lists.csv", lists_csv)

    buf.seek(0)
    return buf


def _generate_library_csv(db: Session, user: User) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "type", "title", "original_title", "year", "tvdb_id", "tmdb_id",
        "favorite", "list_status", "added_at", "for_later_at", "stopped_watching_at", "hidden_at"
    ])

    fav_list = db.execute(
        select(MediaList).where(MediaList.user_id == user.id, MediaList.name == "Preferite")
    ).scalar_one_or_none()
    fav_series_ids = set()
    if fav_list:
        fav_series_ids = set(
            db.execute(select(MediaListItem.series_tmdb_id).where(MediaListItem.list_id == fav_list.id)).scalars().all()
        )

    trackings = db.execute(
        select(UserSeriesTracking, TMDBSeries)
        .join(TMDBSeries, TMDBSeries.tmdb_id == UserSeriesTracking.series_tmdb_id)
        .where(UserSeriesTracking.user_id == user.id)
        .order_by(UserSeriesTracking.added_at.desc())
    ).all()

    for tracking, series in trackings:
        year_str = str(series.first_air_date.year) if series.first_air_date else ""
        is_fav = "yes" if tracking.series_tmdb_id in fav_series_ids else "no"
        
        status_raw = tracking.status
        list_status = "watching"
        stopped_at = ""
        for_later_at = ""

        if status_raw == "dropped":
            list_status = "stopped_watching"
            stopped_at = format_iso_datetime(tracking.updated_at or tracking.added_at)
        elif status_raw == "to_watch":
            list_status = "for_later"
            for_later_at = format_iso_datetime(tracking.added_at)
        elif status_raw in ["completed", "watched"]:
            list_status = "completed"
        elif status_raw in ["on_hold", "paused"]:
            list_status = "on_hold"
        else:
            list_status = "watching"

        writer.writerow([
            "show",
            series.title,
            series.original_title or series.title,
            year_str,
            "",  # tvdb_id
            series.tmdb_id,
            is_fav,
            list_status,
            format_iso_datetime(tracking.added_at),
            for_later_at,
            stopped_at,
            "",  # hidden_at
        ])

    return output.getvalue()


def _generate_watches_csv(db: Session, user: User) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "type", "title", "tvdb_id", "tmdb_id", "season_number", "episode_number",
        "first_watched_at", "last_watched_at", "plays"
    ])

    stmt = (
        select(
            TMDBSeries.title,
            TMDBSeries.tmdb_id,
            TMDBEpisode.season_number,
            TMDBEpisode.episode_number,
            func.min(UserEpisodeLog.watched_at).label("first_watched"),
            func.max(UserEpisodeLog.watched_at).label("last_watched"),
            func.count(UserEpisodeLog.id).label("plays"),
        )
        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)
        .join(TMDBSeries, TMDBSeries.tmdb_id == TMDBEpisode.series_tmdb_id)
        .where(UserEpisodeLog.user_id == user.id)
        .group_by(
            TMDBSeries.title,
            TMDBSeries.tmdb_id,
            TMDBEpisode.season_number,
            TMDBEpisode.episode_number,
        )
        .order_by(func.max(UserEpisodeLog.watched_at).desc())
    )

    rows = db.execute(stmt).all()
    for row in rows:
        writer.writerow([
            "episode",
            row.title,
            "",  # tvdb_id
            row.tmdb_id,
            row.season_number,
            row.episode_number,
            format_iso_datetime(row.first_watched),
            format_iso_datetime(row.last_watched),
            row.plays,
        ])

    return output.getvalue()


def _generate_ratings_csv(db: Session, user: User) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "type", "title", "tvdb_id", "tmdb_id", "season_number", "episode_number",
        "rating", "favorite_character", "emotions"
    ])

    # 1. Episode ratings
    ep_stmt = (
        select(
            TMDBSeries.title,
            TMDBSeries.tmdb_id,
            TMDBEpisode.season_number,
            TMDBEpisode.episode_number,
            UserEpisodeLog.rating,
        )
        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)
        .join(TMDBSeries, TMDBSeries.tmdb_id == TMDBEpisode.series_tmdb_id)
        .where(UserEpisodeLog.user_id == user.id, UserEpisodeLog.rating.isnot(None))
        .order_by(UserEpisodeLog.watched_at.desc())
    )
    for ep_row in db.execute(ep_stmt).all():
        b_rating = (ep_row.rating or 0.0) / 2.0
        writer.writerow([
            "episode",
            ep_row.title,
            "",  # tvdb_id
            ep_row.tmdb_id,
            ep_row.season_number,
            ep_row.episode_number,
            int(b_rating) if b_rating.is_integer() else b_rating,
            "",  # favorite_character
            "",  # emotions
        ])

    # 2. Series ratings
    series_stmt = (
        select(TMDBSeries.title, TMDBSeries.tmdb_id, UserSeriesLog.rating)
        .join(TMDBSeries, TMDBSeries.tmdb_id == UserSeriesLog.series_tmdb_id)
        .where(UserSeriesLog.user_id == user.id, UserSeriesLog.rating.isnot(None))
    )
    for s_row in db.execute(series_stmt).all():
        b_rating = (s_row.rating or 0.0) / 2.0
        writer.writerow([
            "show",
            s_row.title,
            "",  # tvdb_id
            s_row.tmdb_id,
            "",  # season_number
            "",  # episode_number
            int(b_rating) if b_rating.is_integer() else b_rating,
            "",  # favorite_character
            "",  # emotions
        ])

    return output.getvalue()


def _generate_lists_csv(db: Session, user: User) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["list_name", "list_description", "title", "type", "tvdb_id", "tmdb_id"])

    stmt = (
        select(MediaList.name, MediaList.description, TMDBSeries.title, TMDBSeries.tmdb_id)
        .join(MediaListItem, MediaListItem.list_id == MediaList.id)
        .join(TMDBSeries, TMDBSeries.tmdb_id == MediaListItem.series_tmdb_id)
        .where(MediaList.user_id == user.id)
        .order_by(MediaList.name.asc(), MediaListItem.sort_order.asc())
    )

    for row in db.execute(stmt).all():
        writer.writerow([
            row.name,
            row.description or "",
            row.title,
            "show",
            "",  # tvdb_id
            row.tmdb_id,
        ])

    return output.getvalue()
