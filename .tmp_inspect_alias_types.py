import subprocess
import textwrap

query = textwrap.dedent("""
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema='Kiini: One Hub. Total Control'
  AND column_name IN ('createdAt', 'userId')
ORDER BY table_name, column_name;
""")
cmd = ['docker', 'compose', 'exec', '-T', 'db', 'mysql', '-N', '-uKiini: One Hub. Total Control', '-pKiini: One Hub. Total Control', '-D', 'Kiini: One Hub. Total Control', '-e', query]
result = subprocess.run(cmd, capture_output=True, text=True)
print(result.stdout)
print('ERR:', result.stderr)
