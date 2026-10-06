import { getDb } from './server/db.ts';
import { jobGroups, employees } from './drizzle/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  try {
    console.log('🔍 Checking for invalid job groups...');
    
    // Find all jobGroups with non-UUID IDs (shorter than UUID length)
    const allJobGroups = await db.select().from(jobGroups);
    const invalidJobGroups = allJobGroups.filter(jg => !isValidUUID(jg.id));
    
    if (invalidJobGroups.length === 0) {
      console.log('✅ No invalid job groups found!');
      return;
    }

    console.log(`⚠️  Found ${invalidJobGroups.length} invalid job group(s):`);
    invalidJobGroups.forEach(jg => {
      console.log(`   - ID: "${jg.id}" | Name: "${jg.name}"`);
    });

    console.log('\n🔧 Fixing invalid job groups...\n');

    for (const invalidJg of invalidJobGroups) {
      const newId = uuidv4();
      console.log(`   Migrating: "${invalidJg.id}" → "${newId}"`);

      // Update employees that reference this job group
      const empCount = await db
        .update(employees)
        .set({ jobGroupId: newId })
        .where(eq(employees.jobGroupId, invalidJg.id));

      // Delete the invalid job group
      await db.delete(jobGroups).where(eq(jobGroups.id, invalidJg.id));

      // Re-create with valid UUID
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db.insert(jobGroups).values({
        id: newId,
        name: invalidJg.name,
        minimumGrossSalary: invalidJg.minimumGrossSalary,
        maximumGrossSalary: invalidJg.maximumGrossSalary,
        description: invalidJg.description,
        isActive: invalidJg.isActive,
        createdAt: now,
        updatedAt: now,
      } as any);

      console.log(`   ✓ Created new job group with ID: ${newId}`);
    }

    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

main();
