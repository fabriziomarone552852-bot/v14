file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace async with httpx.AsyncClient() as client: with async with httpx.AsyncClient(timeout=15.0) as client:
content = content.replace("async with httpx.AsyncClient() as client:", "async with httpx.AsyncClient(timeout=15.0) as client:")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Timeout increased successfully!")
