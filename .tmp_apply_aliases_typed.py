import subprocess
import textwrap
import sys

query = textwrap.dedent("""
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
  AND column_name IN ('createdAt','userId')
  AND table_name NOT IN (
    SELECT table_name FROM information_schema.columns
    WHERE table_schema='Kiini: One Hub. Total Control' AND column_name='created_at'
  )
  AND column_name = 'createdAt'
UNION ALL
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
  AND column_name IN ('createdAt','userId')
  AND table_name NOT IN (
    SELECT table_name FROM information_schema.columns
    WHERE table_schema='Kiini: One Hub. Total Control' AND column_name='user_id'
  )
  AND column_name = 'userId'
ORDER BY table_name, column_name;
""")

cmd = ['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-N', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', '-D', 'Kiini: One Hub. Total Control', '-e', query]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    print('Schema query failed:', result.stderr, file=sys.stderr)
    sys.exit(1)

lines = [line.strip() for line in result.stdout.strip().splitlines() if line.strip()]
if not lines:
    print('No alias columns needed.')
    sys.exit(0)

for line in lines:
    parts = line.split('\t') if '\t' in line else line.split()
    if len(parts) < 3:
        continue
    table, column, coltype = parts[0], parts[1], parts[2]
    alias = 'created_at' if column == 'createdAt' else 'user_id'
    print(f'Processing {table}: {column} -> {alias} ({coltype})')

    if column == 'createdAt':
        col_def = coltype
        sql = f"ALTER TABLE `{table}` ADD COLUMN `{alias}` {col_def} GENERATED ALWAYS AS (`createdAt`) STORED;"
    else:
        col_def = coltype
        sql = f"ALTER TABLE `{table}` ADD COLUMN `{alias}` {col_def} GENERATED ALWAYS AS (`userId`) STORED;"

    proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', sql], capture_output=True, text=True)
    if proc.returncode != 0:
        if 'Duplicate column name' in proc.stderr or 'already exists' in proc.stderr:
            print(f'  alias column already exists: {alias}')
        else:
            print(f'  ERROR adding alias column: {proc.stderr.strip()}')
    else:
        print(f'  added alias column {alias}')

    idx_name = f'idx_{table}_{alias}'
    idx_sql = f"CREATE INDEX `{idx_name}` ON `{table}` (`{alias}`);"
    proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', idx_sql], capture_output=True, text=True)
    if proc.returncode != 0:
        if 'Duplicate key name' in proc.stderr or 'already exists' in proc.stderr:
            print(f'  index already exists: {idx_name}')
        else:
            print(f'  ERROR creating index: {proc.stderr.strip()}')
    else:
        print(f'  created index {idx_name}')
    print()
