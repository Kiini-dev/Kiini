#!/usr/bin/env python3
"""
FTP script to upload and execute the directory fix on the server.
This script uploads the fix-distdist.php file and then makes an HTTP request to execute it.
"""

import ftplib
import requests
import sys
import os

# Configuration
FTP_HOST = "Kiini.africa"
FTP_USER = "melitec1"
# Note: You'll need to provide the password
FTP_REMOTE_PATH = "/Kiini: One Hub. Total Control"

# Local file path
LOCAL_PHP_FILE = "fix-distdist.php"

if not os.path.exists(LOCAL_PHP_FILE):
    print(f"ERROR: {LOCAL_PHP_FILE} not found in current directory")
    sys.exit(1)

print(f"To complete this upload, you need to:")
print(f"1. Upload {LOCAL_PHP_FILE} to /public_html/Kiini: One Hub. Total Control/ via FTP")
print(f"2. Visit https://Kiini: One Hub. Total Control.Kiini.africa/fix-distdist.php")
print(f"3. Check the output to verify the fix succeeded")
print(f"4. Delete the fix-distdist.php file from the server")
print(f"\nAlternatively, run these terminal commands on the server:")
print(f"cd /home3/kiiniafr/public_html/Kiini: One Hub. Total Control")
print(f"[ -d 'dist/dist/public' ] && cp -r dist/dist/public/* dist/public/ && rm -rf dist/dist && head -5 dist/public/index.html | grep -o 'vendor-react[^\"]*' || echo 'No dist/dist found'")
