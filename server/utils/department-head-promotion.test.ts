import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  invalidateLocalUserCache: vi.fn(),
  notifyUser: vi.fn(),
}));

vi.mock("../db", () => ({
  getPool: () => ({ query: mocks.query }),
}));

vi.mock("../_core/sdk", () => ({
  sdk: { invalidateLocalUserCache: mocks.invalidateLocalUserCache },
}));

vi.mock("../sse", () => ({
  notifyUser: mocks.notifyUser,
}));

import { promoteDepartmentHead } from "./department-head-promotion";

describe("promoteDepartmentHead", () => {
  beforeEach(() => {
    mocks.query.mockReset();
    mocks.invalidateLocalUserCache.mockReset();
    mocks.notifyUser.mockReset();
  });

  it("assigns the mapped department role and clears the prior custom role", async () => {
    mocks.query
      .mockResolvedValueOnce([[{ id: "user-1" }]])
      .mockResolvedValueOnce([{}]);

    await expect(promoteDepartmentHead("user-1", "Sales")).resolves.toBe(true);
    expect(mocks.query).toHaveBeenNthCalledWith(
      2,
      "UPDATE users SET role = ?, customRoleId = NULL WHERE id = ?",
      ["sales_manager", "user-1"],
    );
    expect(mocks.invalidateLocalUserCache).toHaveBeenCalledWith("user-1");
    expect(mocks.notifyUser).toHaveBeenCalledWith("user-1", expect.objectContaining({
      title: "Department Head Assignment",
    }));
  });

  it("does not assign a broad role to an unmapped department", async () => {
    await expect(promoteDepartmentHead("user-1", "Research")).resolves.toBe(false);
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.invalidateLocalUserCache).not.toHaveBeenCalled();
  });
});
