# Application Observability

## Collection

The Express observability middleware records API request count, status class, duration, active requests, and normalized route totals. Responses carry an `X-Request-Id` for correlation. It also records 24-hour rolling in-process metrics and up to 300 recent failure/rate-limit events.

Metrics and recent events are available in the admin-only System Health page and through the admin-protected `systemHealth.getMetrics`, `systemHealth.getEvents`, `monitoring.getMetrics`, `monitoring.getErrorMetrics`, and `monitoring.getAlerts` procedures. Basic health and uptime checks remain public for hosting probes.

## Alerts

- HTTP 5xx and uncaught exceptions are critical alerts delivered immediately to `logs@kiini.africa` by default.
- HTTP 429 responses are warning alerts.
- Matching alerts are deduplicated for five minutes to limit notification storms.
- Uncaught exceptions get up to 12 seconds for alert delivery, then the process exits with a failure code.

Set `OBSERVABILITY_ALERT_EMAIL` to override the recipient. Email requires `SMTP_HOST`, `SMTP_PORT`, and either `SMTP_FROM_EMAIL` or `SMTP_USER`; authentication uses `SMTP_USER` with `SMTP_PASSWORD` or `SMTP_PASS`. `SMTP_SECURE` controls TLS explicitly, otherwise port 465 uses implicit TLS.

## Privacy And Retention

Request bodies, query strings, cookies, authorization headers, and IP addresses are not recorded. Email addresses, numeric identifiers, and UUIDs in route paths are normalized. SQL text is omitted from error summaries, and common secret values are redacted.

Metrics are held in memory for 24 hours and reset when the process restarts. Recent events are bounded to 300 per process. Structured JSON failure events are also written to stderr so the hosting platform can retain them; configure host log retention or a centralized log drain for durable history and multi-instance aggregation.

## Operational Notes

Email alerts depend on the production SMTP configuration and are not queued when SMTP is unavailable. Delivery failures are written to stderr. After deployment, trigger a controlled test 5xx in a non-production environment and verify both receipt at the configured admin address and the event in System Health.
