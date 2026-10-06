import { describe, expect, it } from 'vitest';
import { normalizeEmployeePayload, normalizeEmployeePhotoUrl } from '../routers/employees';

describe('employee payload compatibility', () => {
  it('keeps canonical employee fields and preserves country metadata', () => {
    expect(normalizeEmployeePayload({
      firstName: 'Mary',
      lastName: 'Wanjiku',
      jobGroupId: 'job-123',
      country: 'KE',
      emergencyContactName: 'Grace Wanjiku',
      bankName: 'KCB',
      nhifNumber: '1234567890',
      nssfNumber: '12345678',
    })).toMatchObject({
      firstName: 'Mary',
      lastName: 'Wanjiku',
      jobGroupId: 'job-123',
      country: 'KE',
      emergencyContactName: 'Grace Wanjiku',
      bankName: 'KCB',
      nhifNumber: '1234567890',
      nssfNumber: '12345678',
    });
  });

  it('maps legacy aliases to the canonical employee schema', () => {
    expect(normalizeEmployeePayload({
      firstName: 'John',
      lastName: 'Doe',
      jobGroupId: 'job-456',
      countryCode: 'UG',
      bankAccount: '0123456789',
      nextOfKinName: 'Jane Doe',
      nextOfKinPhone: '+256700000000',
      nationalID: 'CM123456',
      grossSalary: 135000,
    })).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      jobGroupId: 'job-456',
      country: 'UG',
      bankAccountNumber: '0123456789',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+256700000000',
      nationalId: 'CM123456',
      salary: 135000,
    });
  });

  it('preserves supported photo URLs and rejects oversized inline data', () => {
    expect(normalizeEmployeePhotoUrl('https://example.com/employee.jpg')).toBe('https://example.com/employee.jpg');
    expect(normalizeEmployeePhotoUrl(`data:image/jpeg;base64,${'a'.repeat(6_500_000)}`)).toBeNull();
  });
});
