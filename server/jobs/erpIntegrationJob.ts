import crypto from "node:crypto";
import { getPool } from "../db";
import { dispatchSystemAlert } from "../services/systemReportingService";

function signature(secret: string, body: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function processERPIntegrationEvents(limit = 20): Promise<{ processed: number; succeeded: number; failed: number; deadLettered: number }> {
  const pool = getPool();
  if (!pool) return { processed: 0, succeeded: 0, failed: 0, deadLettered: 0 };
  const [events] = await pool.query(
    "SELECT * FROM integration_events WHERE status='pending' AND (nextAttemptAt IS NULL OR nextAttemptAt<=NOW()) ORDER BY createdAt LIMIT ?",
    [limit]
  ) as [any[], any];
  let succeeded = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const event of events) {
    const body = JSON.stringify({ id: event.id, provider: event.provider, eventType: event.eventType, payload: JSON.parse(event.payload || "{}") });
    const [webhooks] = await pool.query(
      "SELECT * FROM api_webhooks WHERE organizationId=? AND isActive=1 AND (events LIKE ? OR events LIKE '%*%')",
      [event.organizationId, `%${event.eventType}%`]
    ) as [any[], any];
    const attemptNumber = Number(event.attempts || 0) + 1;
    await pool.query("UPDATE integration_events SET status='processing',attempts=? WHERE id=?", [attemptNumber, event.id]);
    let eventSucceeded = webhooks.length === 0;
    let lastError = "";

    for (const webhook of webhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: { "content-type": "application/json", "x-Kiini-event": event.eventType, "x-Kiini-signature": signature(webhook.secret || "", body) },
          body,
        });
        const responseBody = (await response.text()).slice(0, 4000);
        await pool.query("INSERT INTO integration_attempts (id,eventId,attemptNumber,status,responseCode,responseBody) VALUES (?,?,?,?,?,?)", [`attempt_${event.id}_${attemptNumber}_${webhook.id}`, event.id, attemptNumber, response.ok ? "succeeded" : "failed", response.status, responseBody]);
        if (!response.ok) { eventSucceeded = false; lastError = `Webhook ${webhook.id} returned ${response.status}`; }
      } catch (error) {
        eventSucceeded = false;
        lastError = error instanceof Error ? error.message : String(error);
        await pool.query("INSERT INTO integration_attempts (id,eventId,attemptNumber,status,error) VALUES (?,?,?,?,?)", [`attempt_${event.id}_${attemptNumber}_${webhook.id}`, event.id, attemptNumber, "failed", lastError]);
      }
    }

    if (eventSucceeded) {
      await pool.query("UPDATE integration_events SET status='succeeded',lastError=NULL WHERE id=?", [event.id]);
      succeeded++;
    } else if (attemptNumber >= 5) {
      await pool.query("UPDATE integration_events SET status='dead_letter',lastError=? WHERE id=?", [lastError || "No webhook delivery succeeded", event.id]);
      await dispatchSystemAlert({
        title: `Integration delivery failed: ${event.provider}`,
        message: lastError || "The integration event could not be delivered after five attempts.",
        organizationId: event.organizationId,
        category: "integration_failure",
        priority: "critical",
        integrationName: event.provider,
        errorCode: "DEAD_LETTER",
        failedCount: attemptNumber,
      });
      deadLettered++;
    } else {
      const delayMinutes = Math.min(60, 2 ** attemptNumber);
      await pool.query("UPDATE integration_events SET status='pending',lastError=?,nextAttemptAt=DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id=?", [lastError, delayMinutes, event.id]);
      failed++;
    }
  }

  return { processed: events.length, succeeded, failed, deadLettered };
}
