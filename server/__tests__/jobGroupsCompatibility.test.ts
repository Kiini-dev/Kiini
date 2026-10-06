import { describe, expect, it } from 'vitest';
import { normalizeJobGroupSalaryFields } from '../routers/jobGroups';
import { resolveJobGroupPayrollAmount, toPayrollStorageAmount } from '../routers/employees';

describe('job group salary-field compatibility', () => {
  it('maps legacy min/max names onto canonical schema fields', () => {
    expect(normalizeJobGroupSalaryFields({
      name: 'Senior Engineer',
      minSalary: 50000,
      maxSalary: 90000,
    })).toMatchObject({
      name: 'Senior Engineer',
      minimumGrossSalary: 50000,
      maximumGrossSalary: 90000,
    });
  });

  it('keeps the canonical fields when they are already present', () => {
    expect(normalizeJobGroupSalaryFields({
      name: 'Manager',
      minimumGrossSalary: 120000,
      maximumGrossSalary: 180000,
    })).toMatchObject({
      name: 'Manager',
      minimumGrossSalary: 120000,
      maximumGrossSalary: 180000,
    });
  });

  it('converts whole currency units to payroll storage cents', () => {
    expect(toPayrollStorageAmount(50000)).toBe(5000000);
    expect(toPayrollStorageAmount(undefined)).toBeNull();
  });

  it('calculates percentage defaults from the employee basic salary', () => {
    expect(resolveJobGroupPayrollAmount({ percentage: 10 }, 75000)).toBe(750000);
    expect(resolveJobGroupPayrollAmount({ amount: 125000 }, 75000)).toBe(125000);
  });
});
