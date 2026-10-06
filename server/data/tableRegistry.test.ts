import { describe, expect, it } from "vitest";
import { getTableRegistry } from "./tableRegistry";

describe("schema table registry", () => {
  it("contains unique physical tables across all schema modules", () => {
    const tables = getTableRegistry();
    const names = tables.map((table) => table.name);
    expect(tables.length).toBeGreaterThan(100);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain("clients");
    expect(names).toContain("jobGroups");
    expect(names).toContain("backup_history");
  });

  it("exposes required columns from the active schema", () => {
    const clients = getTableRegistry().find((table) => table.name === "clients");
    expect(clients?.columns.map((column) => column.name)).toContain("companyName");
    expect(clients?.columns.find((column) => column.name === "companyName")?.required).toBe(true);
  });
});
