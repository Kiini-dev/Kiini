import { spawn } from 'child_process';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set in environment. Aborting.');
  process.exit(1);
}

console.log('Starting interactive db:push (auto-accept defaults)...');

const child = spawn('pnpm', ['run', 'db:push'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true,
  env: { ...process.env },
});

// Send a few newlines periodically to attempt to accept default prompts
const iv = setInterval(() => {
  try {
    child.stdin.write('\n');
  } catch (err) {
    // ignore
  }
}, 400);

child.on('exit', (code) => {
  clearInterval(iv);
  console.log('db:push process exited with code', code);
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  clearInterval(iv);
  console.error('Failed to start db:push:', err);
  process.exit(1);
});
