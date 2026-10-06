import "dotenv/config";
import mysql from "mysql2/promise";
import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/mysql-core";
import * as schema from "../drizzle/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Schema audit failed: DATABASE_URL is required");
  process.exitCode = 1;
} else {
  await auditSchema(databaseUrl);
}

async function auditSchema(url: string) {
  let connection: mysql.Connection | undefined;
  try {
    connection = await mysql.createConnection(url);
    const [columnRows] = await connection.query(
      "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE()",
    );
    const liveColumnsByTable = new Map<string, Set<string>>();
    for (const row of columnRows as Array<{ TABLE_NAME: string; COLUMN_NAME: string }>) {
      const tableName = row.TABLE_NAME.toLowerCase();
      let columns = liveColumnsByTable.get(tableName);
      if (!columns) {
        columns = new Set<string>();
        liveColumnsByTable.set(tableName, columns);
      }
      columns.add(row.COLUMN_NAME.toLowerCase());
    }

  const sourceTables = Object.values(schema).filter((value): value is any => {
    try {
      return Boolean(value && getTableName(value as any));
    } catch {
      return false;
    }
  });

    const missingTables: string[] = [];
    const missingColumns: Array<{ table: string; columns: string[] }> = [];
    for (const table of sourceTables) {
      const tableName = getTableName(table);
      const liveColumns = liveColumnsByTable.get(tableName.toLowerCase());
      if (!liveColumns) {
        missingTables.push(tableName);
        continue;
      }

      const config = getTableConfig(table);
      const sourceColumns = (Array.isArray(config.columns)
        ? config.columns
        : Object.values(config.columns))
        .map((column: any) => String(column.name ?? column.config?.name ?? ""))
        .filter(Boolean);
      const missing = sourceColumns.filter((column) => !liveColumns.has(column.toLowerCase()));
      if (missing.length) missingColumns.push({ table: tableName, columns: missing });
    }

    console.log(JSON.stringify({
      sourceTableCount: sourceTables.length,
      liveTableCount: liveColumnsByTable.size,
      missingTables,
      missingColumns,
    }, null, 2));
    if (missingTables.length || missingColumns.length) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    console.error("Schema audit could not complete:", [code, message].filter(Boolean).join(": ") || "Unknown database error");
    process.exitCode = 1;
  } finally {
    await connection?.end();
  }
}