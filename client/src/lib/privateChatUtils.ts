export function normalizeMembers(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeMembers(parsed);
      }
    } catch {
      // fall through to CSV parsing below
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function findExistingPrivateChannel(
  channels: Array<{ id?: string; type?: string; members?: unknown }>,
  currentUserId: string,
  otherUserId: string
) {
  if (!currentUserId || !otherUserId) return undefined;

  return channels.find((channel) => {
    if (channel.type !== "private") return false;

    const memberIds = normalizeMembers(channel.members);
    const uniqueMembers = Array.from(new Set(memberIds));
    return uniqueMembers.length === 2 && uniqueMembers.includes(currentUserId) && uniqueMembers.includes(otherUserId);
  });
}
