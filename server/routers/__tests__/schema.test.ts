import { expect, it } from 'vitest';
import { settings } from '../../../drizzle/schema';

// A small regression test to catch the bug where we inadvertently
// renamed the `value` column to "longtext" by passing the type as the
// first argument to `text()`.  The correct column name should remain
// "value" and the SQL type should be longtext.

it('settings schema value column has correct name and type', () => {
  // the column builder object exposes its configured name via `.name`
  expect(settings.value.name).toBe('value');

  // MySqlText.columns include a `getSQLType()` helper which should return
  // the actual MySQL type string that will be used when generating SQL.
  // when we switched to the dedicated helper the type should still be
  // "longtext".
  // (this assertion is mostly here to document the intent and provide
  // an extra layer of guarding in case the API changes.)
  // @ts-ignore - builder type includes getSQLType
  expect(settings.value.getSQLType()).toBe('longtext');
});
