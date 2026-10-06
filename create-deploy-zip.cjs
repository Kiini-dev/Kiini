const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function createDeployZip() {
  const output = fs.createWriteStream('kiini-production-deploy.zip');
  const archive = new archiver.ZipArchive();

  output.on('close', () => {
    console.log(`✓ Deploy zip created successfully: ${archive.pointer()} bytes`);
    console.log(`✓ File: kiini-production-deploy.zip`);
  });

  archive.on('error', (err) => {
    console.error('Error creating zip:', err);
    process.exit(1);
  });

  archive.pipe(output);

  // Add files and directories
  console.log('Adding files to deploy package...');

  // Server bundle
  if (fs.existsSync('dist/index.js')) {
    archive.file('dist/index.js', { name: 'dist/index.js' });
    console.log('  ✓ Added server bundle');
  }

  // Client assets
  if (fs.existsSync('dist/public')) {
    archive.directory('dist/public', 'dist/public');
    console.log('  ✓ Added client assets');
  }

  // Database migrations
  if (fs.existsSync('drizzle')) {
    archive.directory('drizzle', 'drizzle');
    console.log('  ✓ Added database migrations');
  }

  // Operational scripts, including the default-user seed
  if (fs.existsSync('scripts')) {
    archive.directory('scripts', 'scripts');
    console.log('  ✓ Added operational scripts');
  }

  // Configuration files
  if (fs.existsSync('package.json')) {
    archive.file('package.json', { name: 'package.json' });
  }
  if (fs.existsSync('pnpm-lock.yaml')) {
    archive.file('pnpm-lock.yaml', { name: 'pnpm-lock.yaml' });
  }
  if (fs.existsSync('.env.example')) {
    archive.file('.env.example', { name: '.env.example' });
  }
  if (fs.existsSync('.env.production')) {
    archive.file('.env.production', { name: '.env.production' });
  }
  if (fs.existsSync('DEPLOY_README.md')) {
    archive.file('DEPLOY_README.md', { name: 'DEPLOY_README.md' });
  }

  console.log('  ✓ Added configuration files');

  // Create startup script
  const startScript = `#!/bin/bash
# Kiini Production Startup Script

echo "🚀 Starting Kiini..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please copy .env.example to .env and configure your settings"
    exit 1
fi

# Set production environment
export NODE_ENV=production

# Start the application
node dist/index.js
`;

  archive.append(startScript, { name: 'start.sh', mode: 0o755 });
  console.log('  ✓ Added startup script');

  // Create Windows batch script
  const startBatch = `@echo off
REM Kiini Production Startup Script

echo Starting Kiini...

if not exist .env (
    echo Error: .env file not found
    echo Please copy .env.example to .env and configure your settings
    pause
    exit /b 1
)

set NODE_ENV=production
node dist/index.js
pause
`;

  archive.append(startBatch, { name: 'start.bat' });
  console.log('  ✓ Added Windows startup script');

  // Finalize
  return new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
    archive.finalize().catch(reject);
  });
}

createDeployZip()
  .then(() => {
    console.log('\n✓ Deploy package created successfully!');
    console.log('\nNext steps:');
    console.log('1. Extract: unzip kiini-production-deploy.zip');
    console.log('2. Install: npm install (or pnpm install)');
    console.log('3. Configure: cp .env.example .env');
    console.log('4. Setup DB: npm run db:push');
    console.log('5. Start: npm start (or ./start.sh on Linux)');
  })
  .catch((err) => {
    console.error('Failed to create deploy zip:', err);
    process.exit(1);
  });
