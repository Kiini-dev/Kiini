# Execute on server via SSH or Terminal
cd /home3/kiiniafr/public_html/Kiini

# List current structure
echo '=== Current structure ==='
ls -la | grep dist

# Check if dist/dist/public exists
if [ -d 'dist/dist/public' ]; then
  echo 'Found dist/dist/public - copying files'
  cp -v dist/dist/public/* dist/public/ 2>&1 | head -10
  cp -rv dist/dist/server . 2>/dev/null || echo 'No server directory to copy'
  rm -rf dist/dist
fi

# Verify index.html exists in correct location
echo '=== Checking dist/public/index.html ==='
head -5 dist/public/index.html | grep -o 'index-[A-Za-z0-9]*'
