#!/bin/bash

# Read the encoded base64 data from file and deploy
cat << 'DEPLOY_EOF' | base64 -d | gzip -d > /home3/kiiniafr/public_html/Kiini/dist/index.js
