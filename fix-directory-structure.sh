#!/bin/bash
# Fix script to reorganize extracted files
# This should be run on the server via cPanel Terminal

cd /home3/kiiniafr/public_html/Kiini

# Backup old files
mkdir -p /tmp/kiini_backup
cp -r assets /tmp/kiini_backup/ 2>/dev/null || true
cp -r public /tmp/kiini_backup/ 2>/dev/null || true

# Remove old directories
rm -rf assets public

# Move the correctly extracted files from dist/dist/public/* to the root
if [ -d "dist/dist/public" ]; then
  # Copy dist/dist/public/* to dist/public/ (should already be there)
  # Copy dist/dist/server/* to server/ if it exists
  # Copy dist/index.js to the root
  cp -v dist/dist/public/* dist/public/ 2>/dev/null || true
  if [ -d "dist/dist/server" ]; then
    cp -rv dist/dist/server/* . 2>/dev/null || true
  fi
fi

# Verify the correct structure exists
echo "Current dist directory structure:"
ls -la dist/public/ | head -20
