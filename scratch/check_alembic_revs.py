import os
versions_dir = 'alembic/versions'
revs = {}
for fname in os.listdir(versions_dir):
    if not fname.endswith('.py'):
        continue
    with open(os.path.join(versions_dir, fname), 'r', encoding='utf-8') as f:
        content = f.read()
    rev = None
    down = None
    for line in content.splitlines():
        if line.startswith('revision =') or 'revision: str =' in line or 'revision: str=' in line:
            rev = line.split('=')[1].strip().strip("'\" ")
        if 'down_revision' in line and '=' in line and not line.startswith('#'):
            down = line.split('=')[1].strip().strip("'\" ")
    revs[rev] = (fname, down)

print('Total revisions found:', len(revs))
for r, (fn, d) in sorted(revs.items(), key=lambda x: str(x[0])):
    print(f"{r} (down: {d}) in {fn}")
