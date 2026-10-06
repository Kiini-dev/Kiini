import { beforeEach, describe, expect, it, vi } from 'vitest';

const { eqMock } = vi.hoisted(() => ({
  eqMock: vi.fn((field: any, value: any) => ({ field, value })),
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    eq: eqMock,
    and: (...args: any[]) => ({ type: 'and', args }),
    desc: vi.fn((value) => ({ type: 'desc', value })),
    like: vi.fn((value) => ({ type: 'like', value })),
    sql: vi.fn((strings: TemplateStringsArray, ...values: any[]) => ({ strings, values })),
  };
});

vi.mock('../../db', () => ({
  getDb: vi.fn(),
}));

import * as db from '../../db';
import { communicationsRouter } from '../communications';

describe('communications delete guardrails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not filter by empty organization id when the user has no org context', async () => {
    const mockDb = {
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ affectedRows: 1 }),
      }),
    };

    (db.getDb as any).mockResolvedValue(mockDb);

    const caller = communicationsRouter.createCaller({
      user: { id: 'u1', organizationId: undefined, role: 'admin' },
    } as any);

    await caller.delete({ id: 'c1' });

    expect(eqMock).not.toHaveBeenCalledWith(expect.anything(), '');
    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });
});
