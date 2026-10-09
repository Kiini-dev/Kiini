# cPanel Scheduled Jobs

Passenger and similar shared-hosting runtimes may suspend an idle Node.js web process. Timers inside that process cannot run while it is suspended. The standalone runner below starts a short-lived Node process from cPanel Cron Jobs, so payroll and P9 execution does not depend on web traffic.

## Process Model

This deployment has one request-serving Node process: `app.js` starts `dist/index.js`, and the API, static-site routes, and in-process schedulers all live in that same process. A single health request therefore warms the shared app; there is no separate web process per module. The standalone scheduled-job runner is intentionally started for a task and then exits, rather than remaining resident.

If the hosting account is configured with multiple Passenger instances or replicas, a request to the public domain may reach only one instance. A URL ping cannot guarantee that every replica stays warm. In that setup, use the host's always-on process controls or an external worker/queue, and do not rely on in-process cron for work that must run on every instance.

## Setup

1. Deploy `kiini-production-deploy.zip` and restart the Kiini Node.js application.
2. In cPanel, open **Cron Jobs** and use the same Node.js version configured for the application. Get its absolute executable path from the Node.js application environment; do not assume the cron shell uses the same `PATH`.
3. Confirm the application directory and production environment variables are available to the cron process. The runner loads `.env.production` and `.env` if present, while preserving environment variables already supplied by cPanel.
4. Set the cron timezone to `Africa/Nairobi` where supported. The runner itself calculates payroll periods and month-end using that timezone.
5. Set `DB_CONNECTION_LIMIT=6` in the cPanel Node.js environment (or `.env.production`) to keep the single shared MySQL pool within the hosting account's connection budget. The application defaults to 6 and clamps configured values to 10; coordinate larger values with the database administrator before changing them.

Use `/home3/kiiniafr/Kiini` below as the application-directory example; replace it if the cPanel application is installed elsewhere. Replace `/path/to/node` with the Node executable path from cPanel.

## Keep the Web Process Warm

Add this entry every minute. It pings the existing public health endpoint and helps shared hosting keep the single request-serving process active for the other in-process automations:

```cron
* * * * * curl -fsS https://kiini.africa/api/health >/dev/null 2>&1
```

This is a best-effort keepalive. Payroll and P9 use the independent runner below and do not rely on the health ping.

## Payroll and Payslips

Run payroll on the 21st at 08:05 EAT. The five-minute offset avoids colliding with the web process's in-process schedule when it is awake.

```cron
5 8 21 * * cd /home3/kiiniafr/Kiini && /path/to/node scripts/run-scheduled-job.mjs payroll-process >> "$HOME/kiini-cron.log" 2>&1
```

Dispatch payslips at 00:05 on days 28 through 31. The runner checks the Nairobi calendar and does nothing unless the date is the actual last day of that month.

```cron
5 0 28-31 * * cd /home3/kiiniafr/Kiini && /path/to/node scripts/run-scheduled-job.mjs payslip-dispatch >> "$HOME/kiini-cron.log" 2>&1
```

## Signed PDF Generation

Signed-document downloads and completion-email attachments are rendered from HTML using Chromium. The application searches `PATH` for Chromium/Chrome and checks common Linux install locations. If Chromium is installed elsewhere, set `PUPPETEER_EXECUTABLE_PATH` in the cPanel Node.js application's environment variables to the installed executable's absolute path (for example, `/usr/bin/chromium`). Restart the application after installing Chromium or changing the environment. A configured path must exist on the application host; setting the variable alone does not install the browser.

Verify the path from the application host's shell before restarting:

```sh
command -v chromium || command -v chromium-browser || command -v google-chrome
test -x "$PUPPETEER_EXECUTABLE_PATH"
"$PUPPETEER_EXECUTABLE_PATH" --version
```

If the host does not permit installing or running Chromium, use the repository's Docker deployment instead; its `Dockerfile` installs Chromium. Do not substitute an HTML file when PDF rendering fails.

## Annual P9 Forms

Generate P9 forms on March 31 at 02:05 EAT. The runner generates forms for the prior tax year and skips forms already generated for each employee, so interrupted runs can be retried.

```cron
5 2 31 3 * cd /home3/kiiniafr/Kiini && /path/to/node scripts/run-scheduled-job.mjs p9-generate >> "$HOME/kiini-cron.log" 2>&1
```

The payroll processor is idempotent for existing employee/pay-period payroll records. Payslip dispatch skips records already sent, viewed, or downloaded; P9 generation skips existing employee/year records. Review `$HOME/kiini-cron.log` after the first scheduled run and confirm the cPanel cron timezone matches the configured schedule.