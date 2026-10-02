class GenreStat(BaseModel):
    genre: str
    count: int
    percentage: float

class TimeTrendStat(BaseModel):
    period: str
    episodes: int
    hours: float

class TotalWatchTime(BaseModel):
    days: int
    hours: int
    minutes: int

class CompletionRate(BaseModel):
    completed: int
    dropped: int
    percentage: float

class WatchlistForecast(BaseModel):
    estimated_date: Optional[str]
    remaining_minutes: int
    daily_pace: float

class PlatformStat(BaseModel):
    platform: str
    count: int
    percentage: float

class ViewingHabits(BaseModel):
    by_day: Dict[str, int]
    by_time: Dict[str, int]

class GraveyardStat(BaseModel):
    title: str
    abandoned_date: Optional[str]

class SatisfactionStat(BaseModel):
    title: str
    time_spent_hours: float
    rating: int

class PersonalRecords(BaseModel):
    max_episodes_in_day: int
    max_episodes_day: Optional[str]
    fastest_binge_series: Optional[str]
    fastest_binge_days: Optional[int]

class RatingDistribution(BaseModel):
    rating: int
    count: int

class GenreRating(BaseModel):
    genre: str
    average_rating: float

class TopSeries(BaseModel):
    title: str
    rating: int

class RewatchStat(BaseModel):
    title: str
    rewatch_count: int

class RewatchComparison(BaseModel):
    first_watch_hours: float
    rewatch_hours: float

class TVFullStats(BaseModel):
    genres_distribution: List[GenreStat]
    time_trend: List[TimeTrendStat]
    total_watch_time: TotalWatchTime
    completion_rate: CompletionRate
    watchlist_forecast: WatchlistForecast
    platform_distribution: List[PlatformStat]
    viewing_habits: ViewingHabits
    graveyard: List[GraveyardStat]
    satisfaction_index: List[SatisfactionStat]
    personal_records: PersonalRecords
    ratings_distribution: List[RatingDistribution]
    ratings_by_genre: List[GenreRating]
    top_10_series: List[TopSeries]
    most_rewatched: List[RewatchStat]
    rewatch_comparison: RewatchComparison
