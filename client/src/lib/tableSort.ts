export type SortDirection = "asc" | "desc";

export function getNextSortDirection<T extends string>(field: T, activeField: T | null, currentDirection: SortDirection): SortDirection {
  if (field !== activeField) return "asc";
  return currentDirection === "asc" ? "desc" : "asc";
}

export function getSortIndicator<T extends string>(field: T, activeField: T | null, currentDirection: SortDirection): "↑" | "↓" | "↕" {
  if (field !== activeField) return "↕";
  return currentDirection === "asc" ? "↑" : "↓";
}
