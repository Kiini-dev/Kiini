import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, getCompanyInfoMock, sendMailMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getCompanyInfoMock: vi.fn(),
  sendMailMock: vi.fn(),
}));

vi.mock("../db", () => ({ getDb: getDbMock }));
vi.mock("../utils/company-info", () => ({ getCompanyInfo: getCompanyInfoMock }));
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

import { sendEmail } from "./mail";

describe("shared email HTML delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "mailer@example.com");
    vi.stubEnv("SMTP_PASSWORD", "test-password");
    vi.stubEnv("SMTP_FROM_EMAIL", "mailer@example.com");
    vi.stubEnv("APP_URL", "https://kiini.example");
    getDbMock.mockResolvedValue(null);
    getCompanyInfoMock.mockResolvedValue({
      name: "Kiini",
      email: "support@kiini.example",
      logo: "/logo.png",
    });
    sendMailMock.mockResolvedValue({ messageId: "mail-1" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("wraps HTML fragments in the branded template and resolves relative paths", async () => {
    const result = await sendEmail({
      to: "recipient@example.com",
      subject: "New project",
      html: '<h2>New Project</h2><p><a href="/projects/project-12">View Project</a></p>',
    });
    const sent = sendMailMock.mock.calls[0][0];

    expect(result.success).toBe(true);
    expect(sent.html).toContain("<html");
    expect(sent.html).toContain('href="https://kiini.example/projects/project-12"');
    expect(sent.html).toContain("Kiini");
    expect(sent.text).toContain("View Project");
  });

  it("provides a branded HTML alternative for text-only email callers", async () => {
    const result = await sendEmail({
      to: "recipient@example.com",
      subject: "Reminder",
      text: "Please review <the> invoice.",
    });
    const sent = sendMailMock.mock.calls[0][0];

    expect(result.success).toBe(true);
    expect(sent.html).toContain("<html");
    expect(sent.html).toContain("Please review &lt;the&gt; invoice.");
    expect(sent.text).toBe("Please review <the> invoice.");
  });
});
