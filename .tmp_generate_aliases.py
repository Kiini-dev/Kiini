import subprocess

sql = """SELECT table_name, MAX(column_name='createdAt') AS has_createdAt, MAX(column_name='userId') AS has_userId, MAX(column_name='created_at') AS has_created_at, MAX(column_name='user_id') AS has_user_id
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
GROUP BY table_name
HAVING (MAX(column_name='createdAt')=1 AND MAX(column_name='created_at')=0)
   OR (MAX(column_name='userId')=1 AND MAX(column_name='user_id')=0);"""

cmd = [
    'docker', 'compose', 'exec', '-T', 'db',
    'mysql', '-N', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', '-D', 'Kiini: One Hub. Total Control', '-e', sql
]

result = subprocess.run(cmd, capture_output=True, text=True, check=True)
for line in result.stdout.strip().splitlines():
    table, has_createdAt, has_userId, has_created_at, has_user_id = line.split()
    if has_createdAt == '1':
        print(f"ALTER TABLE `{table}` ADD COLUMN IF NOT EXISTS `created_at` GENERATED ALWAYS AS (`createdAt`) STORED;")
    if has_userId == '1':
        print(f"ALTER TABLE `{table}` ADD COLUMN IF NOT EXISTS `user_id` GENERATED ALWAYS AS (`userId`) STORED;")
    if has_createdAt == '1':
        print(f"CREATE INDEX IF NOT EXISTS `idx_{table}_created_at` ON `{table}` (`created_at`);")
    if has_userId == '1':
        print(f"CREATE INDEX IF NOT EXISTS `idx_{table}_user_id` ON `{table}` (`user_id`);")
    if has_createdAt == '1' or has_userId == '1':
        print()
