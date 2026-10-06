import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getPoolMock, createNotificationMock, queueEmailMock, renderTemplateMock } = vi.hoisted(() => ({
  getPoolMock: vi.fn(),
  createNotificationMock: vi.fn(),
  queueEmailMock: vi.fn(),
  renderTemplateMock: vi.fn(),
}));

vi.mock("../db", () => ({ getPool: getPoolMock }));
vi.mock("../_core/notification", () => ({ createNotification: createNotificationMock }));
vi.mock("../routers/emailQueue", () => ({ queueEmail: queueEmailMock }));
vi.mock("./notificationRenderer", () => ({ renderNotificationTemplate: renderTemplateMock }));

import { dispatchSystemReport } from "./systemReportingService";

describe("system department reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
    const queuedReports = new Set<string>();
    const pool = {
      query: vi.fn(async (query: string, params: unknown[] = []) => {
        if (query.startsWith("SHOW COLUMNS")) {
          return [[{ Field: "organizationId" }, { Field: "createdAt" }]];
        }
        if (query.includes("FROM organizations ORDER BY")) {
          return [[{
            id: "org-1",
            name: "Melitech",
            slug: "melitech",
            email: "hr@melitech.example",
            currency: "KES",
          }]];
        }
        if (query.includes("FROM departments d")) {
          return [[
            {
              id: "dept-1",
              name: "Human Resources",
              organizationId: "org-1",
              organizationName: "Melitech",
              organizationSlug: "melitech",
              managerId: "manager-1",
              managerEmail: "hr.manager@melitech.example",
              managerName: "HR Manager",
            },
            {
              id: "dept-2",
              name: "Finance",
              organizationId: "org-1",
              organizationName: "Melitech",
              organizationSlug: "melitech",
              managerId: null,
              managerEmail: null,
              managerName: null,
            },
          ]];
        }
        if (query.includes("FROM employees e") && query.includes("COUNT(*) AS total")) {
          return [[{ total: 4 }]];
        }
        if (query.startsWith("SELECT (SELECT COUNT(DISTINCT")) {
          return [[{
            "Employee hires current": 3,
            "Employee hires previous": 2,
            "Leave requests current": 4,
            "Leave requests previous": 1,
            "Payroll current": 5,
            "Payroll previous": 5,
            "Tasks current": 6,
            "Tasks previous": 4,
            "Expenses current": 7,
            "Expenses previous": 3,
          }]];
        }
        if (query.includes("SELECT id, email, name, organizationId, role FROM users")) {
          return [[
            {
              id: "admin-1",
              email: "superadmin@melitech.example",
              name: "Super Admin",
              organizationId: null,
              role: "super_admin",
            },
            {
              id: "org-admin-1",
              email: "hr.admin@melitech.example",
              name: "HR Admin",
              organizationId: "org-1",
              role: "hr",
            },
          ]];
        }
        if (query.includes("FROM emailQueue") && query.includes("LIMIT 1")) {
          const key = params.join(":");
          return [queuedReports.has(key) ? [{ id: "existing-email" }] : []];
        }
        if (query.startsWith("SELECT COUNT(*) AS total")) return [[{ total: 2 }]];
        throw new Error(`Unexpected report query: ${query}`);
      }),
    };
    getPoolMock.mockReturnValue(pool);
    queueEmailMock.mockImplementation(async (input: { eventType: string; entityType: string; entityId: string; recipientEmail: string }) => {
      queuedReports.add([input.eventType, input.entityType, input.entityId, input.recipientEmail].join(":"));
      return { success: true, queueId: "queued" };
    });
    renderTemplateMock.mockImplementation(async (_templateId: string, _context: unknown, fallback: unknown) => fallback);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends one department report to its manager with the super-admin copied and suppresses repeats", async () => {
    const firstRun = await dispatchSystemReport("weekly");
    const secondRun = await dispatchSystemReport("weekly");
    const queuedInputs = queueEmailMock.mock.calls.map(([input]) => input);
    const departmentEmail = queuedInputs.find((input) => input.eventType === "system_report_weekly_department");
    const globalEmail = queuedInputs.find((input) => input.eventType === "system_report_weekly");
    const unassignedDepartmentEmail = queuedInputs.find((input) =>
      input.eventType === "system_report_weekly_department"
      && input.recipientEmail === "superadmin@melitech.example"
    );

    expect(firstRun.delivered).toBe(3);
    expect(secondRun.delivered).toBe(0);
    expect(queueEmailMock).toHaveBeenCalledTimes(3);
    expect(globalEmail.recipientEmail).toBe("superadmin@melitech.example");
    expect(departmentEmail.recipientEmail).toBe("hr.manager@melitech.example");
    expect(departmentEmail.ccEmails).toEqual(["superadmin@melitech.example"]);
    expect(departmentEmail.htmlContent).toContain("Employee hires (current period)");
    expect(departmentEmail.htmlContent).toContain("logo.png");
    expect(unassignedDepartmentEmail.ccEmails).toEqual([]);
    expect(queuedInputs.some((input) => input.recipientEmail === "hr.admin@melitech.example")).toBe(false);
  });
});
