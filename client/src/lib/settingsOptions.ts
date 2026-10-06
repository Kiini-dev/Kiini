export type SettingsOptionEntry =
  | string
  | { name?: string; value?: string; label?: string }
  | null
  | undefined;

export function parseSettingsOptionList(rawValue: unknown, fallback: string[] = []): string[] {
  const normalize = (items: unknown): string[] => {
    if (!Array.isArray(items)) return [];

    const parsed = items
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          const candidate = (entry as any).name ?? (entry as any).value ?? (entry as any).label;
          return typeof candidate === "string" ? candidate.trim() : "";
        }
        return "";
      })
      .filter((value): value is string => Boolean(value));

    return [...new Set(parsed)];
  };

  if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      const values = normalize(parsed);
      if (values.length > 0) return values;
    } catch {
      // Ignore malformed JSON and fall through to the fallback list.
    }
  }

  const legacyValues = normalize(rawValue);
  return legacyValues.length > 0 ? legacyValues : fallback.filter(Boolean);
}
