export function getUserInitials(name?: string | null): string {
  const words = (name || "User").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "US";

  return words
    .slice(0, 2)
    .map((word) => word.slice(0, 2))
    .join("")
    .toUpperCase();
}