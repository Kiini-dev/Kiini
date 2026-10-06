import { describe, expect, it } from 'vitest';
import { getMissingDepartmentColumns } from './departmentsSchema';

describe('getMissingDepartmentColumns', () => {
  it('returns defaultRole when the table is missing it', () => {
    expect(getMissingDepartmentColumns(['id', 'name', 'status'])).toEqual([
      { name: 'defaultRole', definition: 'varchar(100) NULL' },
      { name: 'organizationId', definition: 'varchar(64) NULL' },
    ]);
  });

  it('returns only the columns that are still absent', () => {
    expect(getMissingDepartmentColumns(['id', 'name', 'status', 'defaultRole', 'organizationId'])).toEqual([]);
  });
});
