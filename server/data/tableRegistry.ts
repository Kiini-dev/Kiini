import { getTableColumns, getTableName } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import * as schemaExtended from "../../drizzle/schema-extended";
import * as phase20 from "../../drizzle/schema_extended_phase20";
import * as pricing from "../../drizzle/schema_pricing";
import * as approvals from "../../drizzle/approvalSchema";

export interface RegisteredTableColumn {
  name: string;
  required: boolean;
  hasDefault: boolean;
  dataType: string;
}

export interface RegisteredTable {
  key: string;
  name: string;
  label: string;
  schema: unknown;
  columns: RegisteredTableColumn[];
  organizationColumn?: string;
  sensitiveColumns: string[];
}

const schemaModules = [schema, schemaExtended, phase20, pricing, approvals];
const sensitiveColumnPattern = /(password|secret|token|apiKey|privateKey|accessKey)/i;

function humanizeTableName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inspectTable(key: string, value: unknown): RegisteredTable | null {
  try {
    const tableName = getTableName(value as any);
    const columns = getTableColumns(value as any);
    const registeredColumns = Object.entries(columns).map(([name, column]: [string, any]) => ({
      name,
      required: Boolean(column?.notNull && !column?.hasDefault && !column?.primary),
      hasDefault: Boolean(column?.hasDefault),
      dataType: String(column?.dataType || "unknown"),
    }));
    const organizationColumn = registeredColumns.some((column) => column.name === "organizationId")
      ? "organizationId"
      : undefined;

    return {
      key: tableName,
      name: tableName,
      label: humanizeTableName(tableName),
      schema: value,
      columns: registeredColumns,
      organizationColumn,
      sensitiveColumns: registeredColumns
        .map((column) => column.name)
        .filter((column) => sensitiveColumnPattern.test(column)),
    };
  } catch {
    return null;
  }
}

let cachedRegistry: RegisteredTable[] | undefined;

export function getTableRegistry(): RegisteredTable[] {
  if (cachedRegistry) return cachedRegistry;

  const byTableName = new Map<string, RegisteredTable>();
  for (const module of schemaModules) {
    for (const [key, value] of Object.entries(module)) {
      const table = inspectTable(key, value);
      if (!table || byTableName.has(table.name)) continue;
      byTableName.set(table.name, table);
    }
  }

  cachedRegistry = [...byTableName.values()].sort((left, right) => left.name.localeCompare(right.name));
  return cachedRegistry;
}

export function getRegisteredTable(tableName: string): RegisteredTable | undefined {
  const normalized = tableName.toLowerCase();
  return getTableRegistry().find((table) => table.name.toLowerCase() === normalized);
}

export function getImportableColumns(table: RegisteredTable): RegisteredTableColumn[] {
  return table.columns.filter((column) => !table.sensitiveColumns.includes(column.name));
}

export function getBackupTableRegistry(): RegisteredTable[] {
  return getTableRegistry();
}
