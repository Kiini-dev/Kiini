export const normalizeSupplierDateValue = (value?: string | Date | null | { toISOString?: () => string }) => {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value === "string") return value;

  if (value instanceof Date) return value.toISOString().slice(0, 10);

  if (typeof value === "object" && typeof value.toISOString === "function") {
    try {
      return value.toISOString().slice(0, 10);
    } catch {
      return undefined;
    }
  }

  return String(value);
};
