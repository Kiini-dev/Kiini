import subprocess
import textwrap

query = textwrap.dedent("""
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
  AND column_name IN ('createdAt', 'userId')
ORDER BY table_name, column_name;
""")
cmd = ['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-B', '-N', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', '-D', 'Kiini: One Hub. Total Control', '-e', query]
proc = subprocess.run(cmd, capture_output=True, text=True)
if proc.returncode != 0:
    raise RuntimeError(proc.stderr)
rows = []
for line in proc.stdout.strip().splitlines():
    if not line.strip():
        continue
    parts = line.split('\t')
    if len(parts) < 3:
        continue
    table, col, coltype = parts[0], parts[1], parts[2]
    alias = 'created_at' if col == 'createdAt' else 'user_id'
    rows.append((table, col, coltype, alias))

output_path = 'generated_snake_case_aliases.sql'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('-- Permanent SQL patch for generated snake_case aliases\n')
    f.write('-- Use explicit types for generated columns to match MySQL 8.4 syntax.\n')
    f.write('-- Apply this patch once after verifying the DB schema is based on createdAt/userId columns.\n\n')
    for table, col, coltype, alias in rows:
        f.write(f"ALTER TABLE `{table}` ADD COLUMN `{alias}` {coltype} GENERATED ALWAYS AS (`{col}`) STORED;\n")
        f.write(f"CREATE INDEX `idx_{table}_{alias}` ON `{table}` (`{alias}`);\n\n")

print(f'Wrote {len(rows)} alias definitions to {output_path}')
