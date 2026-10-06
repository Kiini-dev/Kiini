import mysql from 'mysql2/promise';

async function createPricingPlans() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'kiini_user',
    password: process.env.DB_PASSWORD || 'tjwzT9pW;NGYq1QxSq0B',
    database: process.env.DB_NAME || 'kiini-one-hub-total-control',
    port: process.env.DB_PORT || 3307
  });

  try {
    // Define pricing plans based on the tiers from multitenancy
    const plans = [
      {
        id: 'plan_trial',
        planName: 'Trial Plan',
        planSlug: 'trial',
        description: 'Free trial with basic CRM and project management features',
        tier: 'free',
        monthlyPrice: '0.00',
        annualPrice: '0.00',
        monthlyAnnualDiscount: '0.00',
        maxUsers: 5,
        maxProjects: 3,
        maxStorageGB: 1,
        features: JSON.stringify(['crm', 'projects', 'communications', 'tickets']),
        supportLevel: 'email',
        isActive: 1,
        displayOrder: 1
      },
      {
        id: 'plan_starter',
        planName: 'Starter Plan',
        planSlug: 'starter',
        description: 'Perfect for small businesses starting their digital transformation',
        tier: 'starter',
        monthlyPrice: '2500.00',
        annualPrice: '25000.00',
        monthlyAnnualDiscount: '16.67',
        maxUsers: 10,
        maxProjects: 10,
        maxStorageGB: 5,
        features: JSON.stringify(['crm', 'projects', 'communications', 'tickets', 'hr', 'leave', 'invoicing', 'payments', 'expenses', 'reports']),
        supportLevel: 'email',
        isActive: 1,
        displayOrder: 2
      },
      {
        id: 'plan_professional',
        planName: 'Professional Plan',
        planSlug: 'professional',
        description: 'Comprehensive business management solution for growing companies',
        tier: 'professional',
        monthlyPrice: '7500.00',
        annualPrice: '75000.00',
        monthlyAnnualDiscount: '16.67',
        maxUsers: 50,
        maxProjects: 50,
        maxStorageGB: 25,
        features: JSON.stringify(['crm', 'projects', 'communications', 'tickets', 'hr', 'payroll', 'leave', 'attendance', 'invoicing', 'payments', 'expenses', 'procurement', 'accounting', 'budgets', 'reports', 'contracts', 'work_orders']),
        supportLevel: 'priority',
        isActive: 1,
        displayOrder: 3
      },
      {
        id: 'plan_enterprise',
        planName: 'Enterprise Plan',
        planSlug: 'enterprise',
        description: 'Full-featured enterprise solution with advanced analytics and AI',
        tier: 'enterprise',
        monthlyPrice: '15000.00',
        annualPrice: '150000.00',
        monthlyAnnualDiscount: '16.67',
        maxUsers: -1, // unlimited
        maxProjects: -1,
        maxStorageGB: -1,
        features: JSON.stringify(['crm', 'projects', 'communications', 'tickets', 'hr', 'payroll', 'leave', 'attendance', 'invoicing', 'payments', 'expenses', 'procurement', 'accounting', 'budgets', 'reports', 'ai_hub', 'contracts', 'work_orders']),
        supportLevel: '24/7_phone',
        isActive: 1,
        displayOrder: 4
      }
    ];

    for (const plan of plans) {
      await connection.execute(
        `INSERT IGNORE INTO pricingPlans
         (id, planName, planSlug, description, tier, monthlyPrice, annualPrice, monthlyAnnualDiscount,
          maxUsers, maxProjects, maxStorageGB, features, supportLevel, isActive, displayOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          plan.id, plan.planName, plan.planSlug, plan.description, plan.tier,
          plan.monthlyPrice, plan.annualPrice, plan.monthlyAnnualDiscount,
          plan.maxUsers, plan.maxProjects, plan.maxStorageGB, plan.features,
          plan.supportLevel, plan.isActive, plan.displayOrder
        ]
      );
      console.log(`Created pricing plan: ${plan.planName}`);
    }

    console.log('All pricing plans created successfully!');
  } catch (error) {
    console.error('Error creating pricing plans:', error);
  } finally {
    await connection.end();
  }
}

createPricingPlans();