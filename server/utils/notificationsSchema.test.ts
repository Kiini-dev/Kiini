import { describe, expect, it } from 'vitest';
import { getMissingNotificationColumns } from './notificationsSchema';

describe('getMissingNotificationColumns', () => {
  it('returns all required columns when the table is missing them', () => {
    expect(getMissingNotificationColumns([])).toEqual([
      { name: 'deliveryStatus', definition: "enum('pending','sent','failed') NOT NULL DEFAULT 'pending'" },
      { name: 'deliveryDate', definition: 'timestamp NULL' },
      { name: 'status', definition: "enum('active','archived') NOT NULL DEFAULT 'active'" },
    ]);
  });

  it('returns only the columns that are still absent', () => {
    expect(getMissingNotificationColumns(['id', 'deliveryStatus', 'status'])).toEqual([
      { name: 'deliveryDate', definition: 'timestamp NULL' },
    ]);
  });
});
