import { defineConfig } from "drizzle-kit";

// Handle missing DATABASE_URL during build time
// It will be provided at runtime via environment variables
let connectionString = process.env.DATABASE_URL || "mysql://user:password@localhost:3306/kiini-one-hub-total-control";

// Ensure multipleStatements is enabled for migrations
if (!connectionString.includes("multipleStatements=true")) {
  const separator = connectionString.includes("?") ? "&" : "?";
  connectionString += `${separator}multipleStatements=true`;
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
  // Don't try to introspect during build
  introspect: {
    casing: "camelCase",
  },
});
