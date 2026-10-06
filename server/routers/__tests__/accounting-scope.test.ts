import { describe, expect, it } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { accountOrganizationScope } from "../chartOfAccounts";
import { journalOrganizationScope } from "../journalEntries";

const dialect = new MySqlDialect();

describe("global and tenant accounting scopes", () => {
  it("limits global chart-of-accounts reads to null-organization accounts", () => {
    const query = dialect.sqlToQuery(accountOrganizationScope(null));

    expect(query.sql.toLowerCase()).toContain("is null");
    expect(query.sql).toContain("organization");
    expect(query.params).toEqual([]);
  });

  it("limits tenant chart-of-accounts reads to that tenant", () => {
    const query = dialect.sqlToQuery(accountOrganizationScope("org-tenant"));

    expect(query.sql).toContain("organization");
    expect(query.params).toContain("org-tenant");
  });

  it("limits global journal-ledger reads to null-organization entries", () => {
    const query = dialect.sqlToQuery(journalOrganizationScope(null));

    expect(query.sql.toLowerCase()).toContain("is null");
    expect(query.sql).toContain("organization");
    expect(query.params).toEqual([]);
  });

  it("limits tenant journal-ledger reads to that tenant", () => {
    const query = dialect.sqlToQuery(journalOrganizationScope("org-tenant"));

    expect(query.sql).toContain("organization");
    expect(query.params).toContain("org-tenant");
  });
});
