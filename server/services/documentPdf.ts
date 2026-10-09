import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { v4 as uuidv4 } from "uuid";
import { getPool } from "../db";

export type SignedDocumentType = "contract" | "proposal";

export function resolveChromiumExecutable(
  isAvailable: (candidate: string) => boolean = existsSync,
): string {
  const configuredPath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (configuredPath) {
    if (isAvailable(configuredPath)) return configuredPath;
    throw new Error(
      `PUPPETEER_EXECUTABLE_PATH points to "${configuredPath}", but no browser exists there. Install Chromium or update this setting to its executable path.`,
    );
  }

  const executableNames = process.platform === "win32"
    ? ["chrome.exe", "chromium.exe", "chromium-browser.exe"]
    : ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"];
  const pathCandidates = (process.env.PATH || "")
    .split(path.delimiter)
    .filter(Boolean)
    .flatMap((directory) => executableNames.map((name) => path.join(directory, name)));
  const platformCandidates = process.platform === "win32"
    ? [
      process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
      process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
    ]
    : process.platform === "darwin"
      ? [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
      ]
      : [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/lib/chromium/chromium",
        "/snap/bin/chromium",
      ];
  const alternateConfiguredPath = process.env.CHROME_BIN?.trim() || process.env.CHROMIUM_PATH?.trim();
  const executablePath = [
    alternateConfiguredPath,
    ...pathCandidates,
    ...platformCandidates,
  ].find((candidate): candidate is string => Boolean(candidate && isAvailable(candidate)));

  if (!executablePath) {
    throw new Error(
      "Chromium was not found on the application host. Install Chromium and set PUPPETEER_EXECUTABLE_PATH to its executable path.",
    );
  }
  return executablePath;
}

export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    executablePath: resolveChromiumExecutable(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    return Buffer.from(await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    }));
  } finally {
    await browser.close();
  }
}

export async function storeSignedDocumentPdf(
  input: {
    organizationId: string | null;
    workflowId: string;
    documentType: SignedDocumentType;
    documentId: string;
    documentHash: string;
    pdf: Buffer;
  },
): Promise<void> {
  const pool = getPool();
  if (!pool) throw new Error("Database unavailable while storing signed PDF");
  await pool.query(
    `INSERT INTO eSignatureSignedDocuments
      (id, organizationId, workflowId, documentType, documentId, documentHash, pdf)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        organizationId = VALUES(organizationId),
        documentHash = VALUES(documentHash),
        pdf = VALUES(pdf)`,
    [
      uuidv4(),
      input.organizationId,
      input.workflowId,
      input.documentType,
      input.documentId,
      input.documentHash,
      input.pdf,
    ],
  );
}

export async function getOrCreateSignedDocumentPdf(
  input: {
    organizationId: string | null;
    workflowId: string;
    documentType: SignedDocumentType;
    documentId: string;
    documentHash: string;
    signedHtml: string;
  },
): Promise<Buffer> {
  const pool = getPool();
  if (!pool) throw new Error("Database unavailable while retrieving signed PDF");
  const organizationClause = input.organizationId === null
    ? "organizationId IS NULL"
    : "organizationId = ?";
  const queryParams = [
    input.documentType,
    input.documentId,
    input.workflowId,
    ...(input.organizationId === null ? [] : [input.organizationId]),
  ];
  const [rows] = await pool.query(
    `SELECT documentHash, pdf FROM eSignatureSignedDocuments
      WHERE documentType = ? AND documentId = ? AND workflowId = ? AND ${organizationClause}
      LIMIT 1`,
    queryParams,
  );
  const saved = (rows as Array<{ documentHash: string; pdf: Buffer }>)[0];
  if (saved?.documentHash === input.documentHash && saved.pdf) {
    return Buffer.from(saved.pdf);
  }

  const pdf = await renderHtmlToPdf(input.signedHtml);
  await storeSignedDocumentPdf({ ...input, pdf });
  return pdf;
}
