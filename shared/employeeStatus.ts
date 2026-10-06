export function getEmployeeDisplayStatus(status: string | null | undefined, isCurrentlyOnLeave: boolean): string {
  if (isCurrentlyOnLeave) return "on-leave";
  return (status || "active").replace(/_/g, "-");
}
