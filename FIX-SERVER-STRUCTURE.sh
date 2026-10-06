#!/bin/bash
# Single command to fix the dist/dist directory structure issue
# Copy and paste this entire line into the cPanel Terminal

cd /home3/kiiniafr/public_html/Kiini && [ -d dist/dist/public ] && (cp -r dist/dist/public/* dist/public/; cp -r dist/dist/server . 2>/dev/null; cp dist/dist/index.js dist/ 2>/dev/null; rm -rf dist/dist; echo "✓ Fixed! Checking index.html..."; head -5 dist/public/index.html | grep -o 'vendor-react[^"]*' || echo "✗ Still wrong chunk") || echo "✗ dist/dist not found"
