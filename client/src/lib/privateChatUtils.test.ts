import { describe, expect, it } from "vitest";
import { findExistingPrivateChannel, normalizeMembers } from "./privateChatUtils";

describe("privateChatUtils", () => {
  it("normalizes array and CSV string member payloads", () => {
    expect(normalizeMembers(["user-1", "user-2", ""])) .toEqual(["user-1", "user-2"]);
    expect(normalizeMembers('["user-1","user-2"]')).toEqual(["user-1", "user-2"]);
    expect(normalizeMembers("user-1, user-2")).toEqual(["user-1", "user-2"]);
    expect(normalizeMembers(null)).toEqual([]);
  });

  it("finds an existing private channel only for two-person matches", () => {
    const channels = [
      { id: "c1", type: "private", members: ["user-1", "user-2"] },
      { id: "c2", type: "private", members: '["user-1","user-2","user-3"]' },
      { id: "c3", type: "private", members: ["user-1", "user-3"] },
    ];

    expect(findExistingPrivateChannel(channels as any[], "user-1", "user-2")).toMatchObject({ id: "c1" });
    expect(findExistingPrivateChannel(channels as any[], "user-1", "user-3")).toMatchObject({ id: "c3" });
    expect(findExistingPrivateChannel(channels as any[], "user-2", "user-3")).toBeUndefined();
  });
});
