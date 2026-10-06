import subprocess
import textwrap
import shlex

query = textwrap.dedent("""
SELECT table_name, 
  MAX(column_name='createdAt') AS has_createdAt,
  MAX(column_name='userId') AS has_userId,
  MAX(column_name='created_at') AS has_created_at,
  MAX(column_name='user_id') AS has_user_id
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
GROUP BY table_name
HAVING (MAX(column_name='createdAt')=1 AND MAX(column_name='created_at')=0)
   OR (MAX(column_name='userId')=1 AND MAX(column_name='user_id')=0);
""")

cmd = ['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-N', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', '-D', 'Kiini: One Hub. Total Control', '-e', query]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    raise RuntimeError(f"Query failed: {result.stderr}")

lines = [line.strip() for line in result.stdout.strip().splitlines() if line.strip()]
if not lines:
    print('No alias columns needed.')
    raise SystemExit(0)

for line in lines:
    table, has_createdAt, has_userId, has_created_at, has_user_id = line.split()
    print(f'Processing table: {table}')
    if has_createdAt == '1':
        print(f' - Adding created_at alias to {table}')
        alter = f"ALTER TABLE `{table}` ADD COLUMN `created_at` GENERATED ALWAYS AS (`createdAt`) STORED;"
        proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', alter], capture_output=True, text=True)
        if proc.returncode != 0:
            print(f'ERROR adding created_at to {table}: {proc.stderr}')
        else:
            print(f'OK created_at for {table}')
        idx = f"CREATE INDEX `idx_{table}_created_at` ON `{table}` (`created_at`);"
        proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', idx], capture_output=True, text=True)
        if proc.returncode != 0:
            if 'Duplicate key name' in proc.stderr or 'already exists' in proc.stderr:
                print(f'Index idx_{table}_created_at already exists')
            else:
                print(f'ERROR creating created_at index on {table}: {proc.stderr}')
        else:
            print(f'OK index created_at for {table}')
    if has_userId == '1':
        print(f' - Adding user_id alias to {table}')
        alter = f"ALTER TABLE `{table}` ADD COLUMN `user_id` GENERATED ALWAYS AS (`userId`) STORED;"
        proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', alter], capture_output=True, text=True)
        if proc.returncode != 0:
            print(f'ERROR adding user_id to {table}: {proc.stderr}')
        else:
            print(f'OK user_id for {table}')
        idx = f"CREATE INDEX `idx_{table}_user_id` ON `{table}` (`user_id`);"
        proc = subprocess.run(['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', 'Kiini: One Hub. Total Control', '-e', idx], capture_output=True, text=True)
        if proc.returncode != 0:
            if 'Duplicate key name' in proc.stderr or 'already exists' in proc.stderr:
                print(f'Index idx_{table}_user_id already exists')
            else:
                print(f'ERROR creating user_id index on {table}: {proc.stderr}')
        else:
            print(f'OK index user_id for {table}')
    print()
