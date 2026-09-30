import re

# Update schemas.py
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\schemas.py', 'r', encoding='utf-8') as f:
    schemas_content = f.read()

old_schema = r'''    is_watched: bool
    watch_count: int
    logs: List\[EpisodeLogResponse\] = Field\(default_factory=list\)'''

new_schema = '''    is_watched: bool
    watch_count: int
    logs: List[EpisodeLogResponse] = Field(default_factory=list)
    quotes: List[TVQuoteResponse] = Field(default_factory=list)'''

schemas_content = re.sub(old_schema, new_schema, schemas_content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\schemas.py', 'w', encoding='utf-8') as f:
    f.write(schemas_content)


# Update service.py
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'r', encoding='utf-8') as f:
    service_content = f.read()

old_service = r'''        is_watched=len\(user_logs\) > 0,
        watch_count=len\(user_logs\),
        logs=logs_resp,
    \)'''

new_service = '''        is_watched=len(user_logs) > 0,
        watch_count=len(user_logs),
        logs=logs_resp,
        quotes=quotes_resp,
    )'''

service_content = re.sub(old_service, new_service, service_content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'w', encoding='utf-8') as f:
    f.write(service_content)

