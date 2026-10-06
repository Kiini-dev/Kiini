#!/bin/sh
set -eu

APP_ROOT="${APP_ROOT:-/home3/kiiniafr/Kiini}"
cd "$APP_ROOT"
exec node scripts/migrate.mjs
