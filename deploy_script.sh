@'
#!/bin/bash
set -e

TARGET_DIR="/home3/kiiniafr/Kiini"
ZIP_PATH="$TARGET_DIR/deploy.zip"

echo "Extracting $ZIP_PATH to $TARGET_DIR"
unzip -o "$ZIP_PATH" -d "$TARGET_DIR"

bash "$TARGET_DIR/do_restart.sh"
'@ 
