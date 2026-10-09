import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import path from "node:path";

const { launch } = vi.hoisted(() => ({ launch: vi.fn() }));
vi.mock("puppeteer-core", () => ({ default: { launch } }));

import { renderHtmlToPdf, resolveChromiumExecutable } from "../../server/services/documentPdf";

describe("renderHtmlToPdf", () => {
  const pdf = Buffer.from("%PDF-1.7");
  const page = {
    setContent: vi.fn(),
    pdf: vi.fn(),
  };
  const browser = {
    newPage: vi.fn(),
    close: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PUPPETEER_EXECUTABLE_PATH", "");
    vi.stubEnv("CHROME_BIN", "");
    vi.stubEnv("CHROMIUM_PATH", "");
    vi.stubEnv("PATH", "");
    page.setContent.mockResolvedValue(undefined);
    page.pdf.mockResolvedValue(pdf);
    browser.newPage.mockResolvedValue(page);
    browser.close.mockResolvedValue(undefined);
    launch.mockResolvedValue(browser);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the configured browser to render an A4 PDF and closes it", async () => {
    vi.stubEnv("PUPPETEER_EXECUTABLE_PATH", process.execPath);

    const result = await renderHtmlToPdf("<html><body>Signed copy</body></html>");

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(pdf);
    expect(launch).toHaveBeenCalledWith({
      executablePath: process.execPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    expect(page.setContent).toHaveBeenCalledWith(
      "<html><body>Signed copy</body></html>",
      { waitUntil: "domcontentloaded" },
    );
    expect(page.pdf).toHaveBeenCalledWith({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    expect(browser.close).toHaveBeenCalledOnce();
  });

  it("discovers Chromium from PATH when no executable path is configured", async () => {
    const pathExecutable = path.join("test-bin", process.platform === "win32" ? "chrome.exe" : "chromium");
    vi.stubEnv("PATH", "test-bin");

    expect(resolveChromiumExecutable((candidate) => candidate === pathExecutable)).toBe(pathExecutable);

    expect(launch).not.toHaveBeenCalled();
  });

  it("reports how to configure Chromium when it is unavailable", async () => {
    expect(() => resolveChromiumExecutable(() => false)).toThrow(
      "Chromium was not found on the application host. Install Chromium and set PUPPETEER_EXECUTABLE_PATH to its executable path.",
    );
  });

  it("reports an invalid explicitly configured executable path", async () => {
    vi.stubEnv("PUPPETEER_EXECUTABLE_PATH", "/missing/chromium");

    expect(() => resolveChromiumExecutable(() => false)).toThrow(
      'PUPPETEER_EXECUTABLE_PATH points to "/missing/chromium", but no browser exists there.',
    );
  });

  it("closes the browser when PDF generation fails", async () => {
    page.pdf.mockRejectedValueOnce(new Error("PDF renderer failed"));

    await expect(renderHtmlToPdf("<html></html>")).rejects.toThrow("PDF renderer failed");
    expect(browser.close).toHaveBeenCalledOnce();
  });
});
