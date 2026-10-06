from pathlib import Path
import re
root = Path('e:/Kiini: One Hub. Total Control')
paths = [root / 'templates', root / 'email-templates']
pattern = re.compile(r'\[([^\]]+)\]')
allowed = re.compile(r'^[A-Z0-9_]+$')
files = []
for path in paths:
    for f in path.rglob('*'):
        if f.is_file() and f.suffix.lower() in {'.html', '.md', '.txt', '.tmpl', '.htm'}:
            files.append(f)

bad = []
for f in sorted(files):
    text = f.read_text(encoding='utf-8', errors='ignore')
    for m in pattern.finditer(text):
        token = m.group(1)
        if not allowed.fullmatch(token):
            bad.append((str(f.relative_to(root)), token))

print('FILES SCANNED:', len(files))
print('INVALID PLACEHOLDERS:', len(bad))
for path, token in bad[:200]:
    print(path, token)
