import { createRequire } from 'node:module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createDeployZip() {
  const output = fs.createWriteStream('kiini-production-deploy.zip');
  const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`✓ Deploy zip created successfully: ${archive.pointer()} bytes`);
  });

  archive.on('error', (err) => {
    console.error('Error creating zip:', err);
    process.exit(1);
  });

  archive.pipe(output);

  // Add files and directories
  console.log('Adding files to deploy package...');

  // Server bundle
  archive.file('dist/index.js', { name: 'dist/index.js' });
  archive.file('dist/scheduled-jobs.js', { name: 'dist/scheduled-jobs.js' });
  console.log('  ✓ Added server bundle');

  // Client assets
  archive.directory('dist/public', 'dist/public');
  console.log('  ✓ Added client assets');

  // Database migrations
  archive.directory('drizzle', 'drizzle');
  console.log('  ✓ Added database migrations');

  // Operational scripts, including the default-user seed
  archive.directory('scripts', 'scripts');
  console.log('  ✓ Added operational scripts');

  // Email template source files used by the production seed
  archive.directory('email-templates', 'email-templates');
  console.log('  ✓ Added email templates');

  // Configuration files
  archive.file('package.json', { name: 'package.json' });
  if (fs.existsSync('package-lock.json')) {
    archive.file('package-lock.json', { name: 'package-lock.json' });
  }
  archive.file('pnpm-lock.yaml', { name: 'pnpm-lock.yaml' });
  archive.file('app.js', { name: 'app.js' });
  archive.file('init-db.ts', { name: 'init-db.ts' });

  if (fs.existsSync('DEPLOY_README.md')) {
    archive.file('DEPLOY_README.md', { name: 'DEPLOY_README.md' });
  }
  if (fs.existsSync('docs/OBSERVABILITY.md')) {
    archive.file('docs/OBSERVABILITY.md', { name: 'docs/OBSERVABILITY.md' });
  }
  if (fs.existsSync('docs/CPANEL_CRON.md')) {
    archive.file('docs/CPANEL_CRON.md', { name: 'docs/CPANEL_CRON.md' });
  }
  if (fs.existsSync('PRODUCTION_DEPLOY_SUMMARY.md')) {
    archive.file('PRODUCTION_DEPLOY_SUMMARY.md', { name: 'PRODUCTION_DEPLOY_SUMMARY.md' });
  }
  console.log('  ✓ Added configuration files');

  // Create startup script
  const startScript = `#!/bin/bash
set -e
# Kiini Production Startup Script
# Environment variables are provided by the host/cPanel runtime.

echo "Starting Kiini: One Hub. Total Control..."

# Set production environment
export NODE_ENV=production

# app.js loads the environment, runs migrations, then starts the server.
exec node app.js
`;

  archive.append(startScript, { name: 'start.sh', mode: 0o755 });
  console.log('  ✓ Added startup script');

  if (fs.existsSync('do_restart.sh')) {
    archive.file('do_restart.sh', { name: 'do_restart.sh', mode: 0o755 });
    console.log('  ✓ Added restart script');
  }

  if (fs.existsSync('monitor.sh')) {
    archive.file('monitor.sh', { name: 'monitor.sh', mode: 0o755 });
    console.log('  ✓ Added process monitor');
  }

  // Finalize
  await archive.finalize();
}

createDeployZip().catch(err => {
  console.error('Failed to create deploy zip:', err);
  process.exit(1);
});
