import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
}));

vi.mock("../db", () => ({ getDb: getDbMock }));

import { CustomFieldsService } from "./customFieldsService";

describe("CustomFieldsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads active fields without relying on Drizzle relational queries", async () => {
    const fields = [{ id: "field-1", fieldName: "industry" }];
    const orderBy = vi.fn().mockResolvedValue(fields);
    const where = vi.fn().mockReturnValue({ orderBy });
    const from = vi.fn().mockReturnValue({ where });
    const select = vi.fn().mockReturnValue({ from });
    getDbMock.mockResolvedValue({ select });

    const result = await new CustomFieldsService().getFieldsByEntity("org-1", "client");

    expect(result).toBe(fields);
    expect(select).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledOnce();
    expect(where).toHaveBeenCalledOnce();
    expect(orderBy).toHaveBeenCalledOnce();
  });
});
