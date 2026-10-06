import { getPool } from "../db";

export type MarketingRecipient = {
  email: string;
  name?: string | null;
  unsubscribeToken: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

export function renderMarketingCampaign(
  body: string,
  campaignName: string,
  recipient: MarketingRecipient,
  baseUrl: string,
  companyName = "Kiini",
): string {
  const [firstName = "there", ...lastName] = (recipient.name || "").trim().split(/\s+/);
  const unsubscribeUrl = `${baseUrl.replace(/\/+$/, "")}/api/email/unsubscribe/${encodeURIComponent(recipient.unsubscribeToken)}`;
  const values: Record<string, string> = {
    first_name: firstName || "there",
    last_name: lastName.join(" "),
    company_name: companyName,
    campaign_name: campaignName,
    unsubscribe_url: unsubscribeUrl,
    dashboard_url: baseUrl,
  };
  let html = body.replace(/\{\{?\s*([a-z_]+)\s*\}?\}/gi, (match, key: string) => {
    const value = values[key.toLowerCase()];
    return value === undefined ? match : escapeHtml(value);
  });

  if (!/\{\{?\s*unsubscribe_url\s*\}?\}/i.test(body) && !/api\/email\/unsubscribe\//i.test(body)) {
    html += `<p style="font-size:12px;color:#64748b">You are receiving this email because you opted in to email updates. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>`;
  }
  return html;
}

export async function unsubscribeMarketingToken(token: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error("Database unavailable");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT email FROM emailMarketingSubscribers WHERE unsubscribeToken = ? LIMIT 1 FOR UPDATE",
      [token],
    );
    const email = (rows as Array<{ email: string }>)[0]?.email;
    if (!email) {
      await connection.rollback();
      return false;
    }
    await connection.query(
      "UPDATE emailMarketingSubscribers SET optedIn = 0, unsubscribedAt = CURRENT_TIMESTAMP WHERE email = ?",
      [email],
    );
    await connection.query(
      `INSERT INTO emailUnsubscribes (id, email, reason, unsubscribedAt)
       VALUES (?, ?, 'marketing unsubscribe link', CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE reason = VALUES(reason), unsubscribedAt = VALUES(unsubscribedAt)`,
      [`unsub_${token}`, email],
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
