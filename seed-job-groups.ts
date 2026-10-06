import { getDb } from './server/db';
import { jobGroups } from './drizzle/schema';

async function seedJobGroups() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      process.exit(1);
    }

    // Check existing job groups
    const existingGroups = await db.select().from(jobGroups);
    console.log(`Found ${existingGroups.length} existing job groups`);

    if (existingGroups.length > 0) {
      console.log('Job groups already exist:', existingGroups.map(g => g.id).join(', '));
      return;
    }

    // Seed the default job groups
    const defaultGroups = [
      { id: 'jg-001', name: 'Junior Staff', minimumGrossSalary: 25000, maximumGrossSalary: 50000, description: 'Entry-level position' },
      { id: 'jg-002', name: 'Senior Staff', minimumGrossSalary: 50000, maximumGrossSalary: 100000, description: 'Mid-level position with responsibilities' },
      { id: 'jg-003', name: 'Supervisor', minimumGrossSalary: 100000, maximumGrossSalary: 150000, description: 'Team leadership role' },
      { id: 'jg-004', name: 'Manager', minimumGrossSalary: 150000, maximumGrossSalary: 250000, description: 'Department manager' },
      { id: 'jg-005', name: 'Executive', minimumGrossSalary: 250000, maximumGrossSalary: 500000, description: 'Executive position' },
    ];

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    for (const group of defaultGroups) {
      await db.insert(jobGroups).values({
        id: group.id,
        name: group.name,
        minimumGrossSalary: group.minimumGrossSalary,
        maximumGrossSalary: group.maximumGrossSalary,
        description: group.description,
        isActive: 1,
        createdAt: now,
        updatedAt: now,
      } as any);
      console.log(`✓ Created job group: ${group.id} (${group.name})`);
    }

    console.log('\n✅ Successfully seeded all job groups');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding job groups:', error);
    process.exit(1);
  }
}

seedJobGroups();
