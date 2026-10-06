import { describe, expect, it } from "vitest";
import { normalizeClientImportRow, normalizeEmployeeImportRow } from "./csvImportExport";

describe("employee CSV import normalization", () => {
  it("maps legacy snake_case headers to the employee import schema", () => {
    expect(normalizeEmployeeImportRow({
      employee_number: "EMP001",
      first_name: "Jane",
      last_name: "Smith",
      hire_date: "2024-01-15",
      job_group_id: "jg-1",
    })).toMatchObject({
      employeeNumber: "EMP001",
      firstName: "Jane",
      lastName: "Smith",
      hireDate: "2024-01-15",
      jobGroupId: "jg-1",
    });
  });

  it("maps readable client CSV headers to companyName", () => {
    expect(normalizeClientImportRow({ "Company Name": "Acme Ltd", Status: "active" })).toMatchObject({
      companyName: "Acme Ltd",
      status: "active",
    });
  });
});
