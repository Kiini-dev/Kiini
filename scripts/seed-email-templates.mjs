import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const directory = path.resolve("email-templates");

function templateId(fileName) {
  return path.basename(fileName, ".html").toLowerCase().replace(/[^a-z0-9_-]/g, "-");
}

function categoryFor(fileName) {
  return path.basename(fileName, ".html").toLowerCase();
}

function plainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function variablesFor(html) {
  return JSON.stringify([...new Set(
    [...html.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((match) => `{{${match[1]}}}`),
  )]);
}

async function seedEmailTemplates() {
  if (!process.env.DATABASE_URL) {
    console.log("[EmailTemplates] DATABASE_URL not set - skipping seed");
    return;
  }

  const url = new URL(process.env.DATABASE_URL);
  const pool = await mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 3,
  });

  try {
    const files = fs.readdirSync(directory).filter((file) => file.endsWith(".html"));
    for (const file of files) {
      const html = fs.readFileSync(path.join(directory, file), "utf8");
      const id = templateId(file);
      const category = categoryFor(file);
      const name = category.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      const subject = `${name} - {{company_name}}`;
      await pool.query(
        `INSERT INTO emailTemplates
          (id, name, subject, htmlContent, plainTextContent, variables, category, attachments, isDefault, isSystem, createdBy, organizationId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'system-seed', NULL)
         ON DUPLICATE KEY UPDATE
           htmlContent = IF(createdBy = 'system-seed' AND organizationId IS NULL, VALUES(htmlContent), htmlContent),
           plainTextContent = IF(createdBy = 'system-seed' AND organizationId IS NULL, VALUES(plainTextContent), plainTextContent),
           variables = IF(createdBy = 'system-seed' AND organizationId IS NULL, VALUES(variables), variables),
           updatedAt = IF(createdBy = 'system-seed' AND organizationId IS NULL, CURRENT_TIMESTAMP, updatedAt)`,
        [id, name, subject, html, plainText(html), variablesFor(html), category, JSON.stringify([])],
      );
    }
    console.log(`[EmailTemplates] Seeded ${files.length} global default templates`);
  } finally {
    await pool.end();
  }
}

seedEmailTemplates().catch((error) => {
  console.error("[EmailTemplates] Seed failed:", error);
  process.exitCode = 1;
});