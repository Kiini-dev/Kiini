#!/usr/bin/env bash
# Kiini -> Railway variable setup.
# Usage: ./railway-setup.sh [env-file]   (default: railway.env)
#
# Prereqs: `railway login`, then `railway link` in the project dir,
# and a MySQL service already added to the Railway project.
#
# railway.env holds KEY=value lines (no quotes). Minimum:
#   APP_URL=https://kiini-production.up.railway.app
# Everything else (SMTP_*, STRIPE_*, MPESA_*, GROQ_*, ...) is optional.
set -euo pipefail

ENV_FILE="${1:-railway.env}"
SERVICE="${RAILWAY_SERVICE:-kiini}"        # app service name in Railway
MYSQL_SERVICE="${MYSQL_SERVICE:-MySQL}"    # MySQL service name in Railway
UPLOAD_MOUNT="${UPLOAD_MOUNT:-/app/uploads}"

command -v railway >/dev/null || { echo "railway CLI not installed"; exit 1; }
railway whoami >/dev/null 2>&1 || { echo "Run: railway login"; exit 1; }
railway status >/dev/null 2>&1 || { echo "Run: railway link"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }

declare -A V

# Load env file (skip blanks/comments; keep everything after the first '=')
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  [[ -z "${line// }" || "$line" =~ ^[[:space:]]*# ]] && continue
  key="${line%%=*}"; val="${line#*=}"
  V["$key"]="$val"
done < "$ENV_FILE"

[ -n "${V[APP_URL]:-}" ] || { echo "APP_URL is required in $ENV_FILE"; exit 1; }
APP_URL="${V[APP_URL]%/}"

# Required / derived defaults (file values win where already set)
V[NODE_ENV]="${V[NODE_ENV]:-production}"
V[PUBLIC_APP_URL]="${V[PUBLIC_APP_URL]:-$APP_URL}"
V[VITE_API_URL]="${V[VITE_API_URL]:-$APP_URL/api}"
V[UPLOAD_DIR]="${V[UPLOAD_DIR]:-$UPLOAD_MOUNT}"
V[JWT_SECRET]="${V[JWT_SECRET]:-$(openssl rand -hex 48)}"
# Railway reference variable - single-quoted so bash doesn't expand it
V[DATABASE_URL]="${V[DATABASE_URL]:-\${{${MYSQL_SERVICE}.MYSQL_URL}}}"
# Code reads both spellings
if [ -n "${V[SMTP_PASSWORD]:-}" ] && [ -z "${V[SMTP_PASS]:-}" ]; then
  V[SMTP_PASS]="${V[SMTP_PASSWORD]}"
fi
# Railway injects PORT; never set it
unset 'V[PORT]'

args=()
for k in "${!V[@]}"; do
  args+=(--set "$k=${V[$k]}")
done

echo "Setting ${#V[@]} variables on service '$SERVICE'..."
railway variables --service "$SERVICE" --skip-deploys "${args[@]}"

# Persistent volume for uploads (skip if it already exists)
if ! railway volume list 2>/dev/null | grep -q "$UPLOAD_MOUNT"; then
  echo "Adding volume at $UPLOAD_MOUNT..."
  railway volume add --service "$SERVICE" --mount-path "$UPLOAD_MOUNT" \
    || echo "Volume add failed - add it in the dashboard (Service > Volumes)."
fi

# Attach the custom domain (host taken from APP_URL). Railway prints the
# DNS record(s) to create at your registrar.
CUSTOM_DOMAIN="${APP_URL#*://}"; CUSTOM_DOMAIN="${CUSTOM_DOMAIN%%/*}"
if [[ "$CUSTOM_DOMAIN" != *.up.railway.app ]]; then
  echo "Attaching custom domain $CUSTOM_DOMAIN..."
  railway domain "$CUSTOM_DOMAIN" --service "$SERVICE" \
    || echo "Domain add failed - add it in the dashboard (Service > Settings > Networking)."
  # Per-org subdomains (org.kiini.africa) need a wildcard domain too
  railway domain "*.$CUSTOM_DOMAIN" --service "$SERVICE" \
    || echo "Wildcard add failed - add *.$CUSTOM_DOMAIN in the dashboard."
  echo "Create the DNS record Railway shows above, then wait for it to verify."
  echo "Apex domain? Use a registrar/DNS host with CNAME flattening/ALIAS (e.g. Cloudflare)."
fi

echo
echo "Done. VITE_* values are baked in at build time, so deploy now:"
echo "  railway up --service $SERVICE"
echo "Verify: railway variables --service $SERVICE --json"
