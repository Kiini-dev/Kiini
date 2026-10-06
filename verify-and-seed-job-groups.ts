import { getDb } from './server/db.js';
import { jobGroups } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

async function checkJobGroups() {
  console.log('=== Checking Job Groups ===\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }
  
  // Query existing job groups
  const groups = await db.select().from(jobGroups);
  
  console.log(`Found ${groups.length} job groups in database`);
  if (groups.length > 0) {
    console.log('\nExisting Job Groups:');
    groups.forEach(g => {
      console.log(`  - ${g.id}: ${g.name} (${g.minimumGrossSalary} - ${g.maximumGrossSalary})`);
    });
  } else {
    console.log('\n⚠️  No job groups found! This will cause employee creation to fail.');
    console.log('\nSeeding default job groups...\n');
    
    const defaultGroups = [
      { id: 'jg-001', name: 'Junior Staff', minimumGrossSalary: 25000, maximumGrossSalary: 50000 },
      { id: 'jg-002', name: 'Senior Staff', minimumGrossSalary: 50000, maximumGrossSalary: 100000 },
      { id: 'jg-003', name: 'Supervisor', minimumGrossSalary: 100000, maximumGrossSalary: 150000 },
      { id: 'jg-004', name: 'Manager', minimumGrossSalary: 150000, maximumGrossSalary: 250000 },
      { id: 'jg-005', name: 'Executive', minimumGrossSalary: 250000, maximumGrossSalary: 500000 },
    ];
    
    try {
      for (const group of defaultGroups) {
        await db.insert(jobGroups).values(group);
        console.log(`✅ Inserted ${group.name} (${group.id})`);
      }
      console.log('\n✅ Job groups seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding job groups:', error);
      process.exit(1);
    }
  }
  
  // Verify jg-005 exists (the one needed for the failing employee)
  const jg005 = await db.select().from(jobGroups).where(eq(jobGroups.id, 'jg-005'));
  
  if (jg005.length > 0) {
    console.log('\n✅ jg-005 (Executive) exists - employee creation should work');
  } else {
    console.log('\n❌ jg-005 (Executive) NOT FOUND - employee creation will still fail');
  }
  
  process.exit(0);
}

checkJobGroups().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
