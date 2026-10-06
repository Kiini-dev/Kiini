/**
 * Seed Data Script for Kiini
 * 
 * Run this script to populate the database with sample data.
 * 
 * Usage:
 *   cd kiini-one-hub-total-control_extracted
 *   npx tsx scripts/seed.ts
 * 
 * Or via npm script:
 *   npm run seed
 */

import { getDb } from "../server/db";
import { v4 as uuidv4 } from "uuid";
import {
  clients,
  employees,
  products,
  services,
  projects,
  estimates,
  invoices,
  payments,
  expenses,
  opportunities,
  departments,
  settings,
  activityLog,
} from "../drizzle/schema";

async function seed() {
  console.log("🌱 Starting database seed...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  const now = new Date();
  const userId = "system-seed";

  try {
    // Seed Settings
    console.log("📋 Seeding settings...");
    const settingsData = [
      { id: uuidv4(), key: "company_name", value: "Kiini", category: "company" },
      { id: uuidv4(), key: "company_email", value: "info@kiini.africa", category: "company" },
      { id: uuidv4(), key: "company_phone", value: "+254 712 236 643", category: "company" },
      { id: uuidv4(), key: "company_website", value: "www.kiini.africa", category: "company" },
      { id: uuidv4(), key: "company_address", value: "Tropicana, Kitengela", category: "company" },
      { id: uuidv4(), key: "company_city", value: "Nairobi", category: "company" },
      { id: uuidv4(), key: "company_country", value: "Kenya", category: "company" },
      { id: uuidv4(), key: "company_postal_code", value: "00200", category: "company" },
      { id: uuidv4(), key: "tax_id", value: "A123456789X", category: "company" },
      { id: uuidv4(), key: "bank_name", value: "Kenya Commercial Bank", category: "bank" },
      { id: uuidv4(), key: "bank_account_number", value: "1295660644", category: "bank" },
      { id: uuidv4(), key: "bank_branch", value: "Kitengela", category: "bank" },
      { id: uuidv4(), key: "invoice_prefix", value: "INV", category: "document_numbering" },
      { id: uuidv4(), key: "invoice_next_number", value: "1", category: "document_numbering" },
      { id: uuidv4(), key: "estimate_prefix", value: "EST", category: "document_numbering" },
      { id: uuidv4(), key: "estimate_next_number", value: "1", category: "document_numbering" },
      { id: uuidv4(), key: "receipt_prefix", value: "REC", category: "document_numbering" },
      { id: uuidv4(), key: "receipt_next_number", value: "1", category: "document_numbering" },
    ];
    
    for (const setting of settingsData) {
      await db.insert(settings).values(setting as any).onDuplicateKeyUpdate({ set: { value: setting.value } });
    }

    // Seed Departments
    console.log("🏢 Seeding departments...");
    const departmentsData = [
      { id: uuidv4(), name: "Engineering", code: "ENG", description: "Software development and engineering", isActive: 1 },
      { id: uuidv4(), name: "Sales", code: "SALES", description: "Sales and business development", isActive: 1 },
      { id: uuidv4(), name: "Finance", code: "FIN", description: "Accounting and finance", isActive: 1 },
      { id: uuidv4(), name: "Human Resources", code: "HR", description: "HR and administration", isActive: 1 },
      { id: uuidv4(), name: "Operations", code: "OPS", description: "Operations and support", isActive: 1 },
    ];
    
    for (const dept of departmentsData) {
      await db.insert(departments).values(dept as any).onDuplicateKeyUpdate({ set: { name: dept.name } });
    }

    // Seed Clients
    console.log("👥 Seeding clients...");
    const clientsData = [
      {
        id: uuidv4(),
        companyName: "Safaricom PLC",
        contactPerson: "John Kamau",
        email: "john.kamau@safaricom.co.ke",
        phone: "+254 722 000 001",
        address: "Safaricom House, Waiyaki Way",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        taxId: "P051234567A",
        industry: "Telecommunications",
        status: "active",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        companyName: "Kenya Power & Lighting",
        contactPerson: "Mary Wanjiku",
        email: "mary.wanjiku@kplc.co.ke",
        phone: "+254 733 000 002",
        address: "Stima Plaza, Kolobot Road",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        taxId: "P051234568B",
        industry: "Energy",
        status: "active",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        companyName: "Equity Bank Kenya",
        contactPerson: "Peter Ochieng",
        email: "peter.ochieng@equitybank.co.ke",
        phone: "+254 700 000 003",
        address: "Equity Centre, Upper Hill",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        taxId: "P051234569C",
        industry: "Banking",
        status: "active",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        companyName: "Nation Media Group",
        contactPerson: "Grace Muthoni",
        email: "grace.muthoni@nation.co.ke",
        phone: "+254 711 000 004",
        address: "Nation Centre, Kimathi Street",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        taxId: "P051234570D",
        industry: "Media",
        status: "active",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        companyName: "Twiga Foods Ltd",
        contactPerson: "David Mwangi",
        email: "david.mwangi@twigafoods.com",
        phone: "+254 720 000 005",
        address: "Industrial Area",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00500",
        taxId: "P051234571E",
        industry: "Agriculture",
        status: "prospect",
        createdBy: userId,
      },
    ];
    
    const insertedClients: string[] = [];
    for (const client of clientsData) {
      await db.insert(clients).values(client as any);
      insertedClients.push(client.id);
    }

    // Seed Products
    console.log("📦 Seeding products...");
    const productsData = [
      {
        id: uuidv4(),
        name: "Dell Laptop - Latitude 5520",
        sku: "DELL-LAT-5520",
        description: "15.6 inch business laptop with Intel Core i7",
        category: "Computers",
        unitPrice: 15000000, // KES 150,000 in cents
        costPrice: 12000000,
        quantity: 25,
        reorderLevel: 5,
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "HP LaserJet Pro MFP",
        sku: "HP-LJ-PRO-MFP",
        description: "Multi-function printer with scanner and copier",
        category: "Printers",
        unitPrice: 4500000, // KES 45,000 in cents
        costPrice: 3500000,
        quantity: 15,
        reorderLevel: 3,
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Cisco Router - RV340",
        sku: "CISCO-RV340",
        description: "Dual WAN Gigabit VPN Router",
        category: "Networking",
        unitPrice: 3500000, // KES 35,000 in cents
        costPrice: 2800000,
        quantity: 20,
        reorderLevel: 5,
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Microsoft 365 Business - Annual",
        sku: "MS365-BUS-ANN",
        description: "Microsoft 365 Business Standard annual subscription",
        category: "Software",
        unitPrice: 1500000, // KES 15,000 in cents
        costPrice: 1200000,
        quantity: 100,
        reorderLevel: 10,
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "UPS - APC 1500VA",
        sku: "APC-UPS-1500",
        description: "Uninterruptible Power Supply 1500VA",
        category: "Power",
        unitPrice: 2500000, // KES 25,000 in cents
        costPrice: 2000000,
        quantity: 30,
        reorderLevel: 5,
        isActive: 1,
        createdBy: userId,
      },
    ];
    
    for (const product of productsData) {
      await db.insert(products).values(product as any);
    }

    // Seed Services
    console.log("🔧 Seeding services...");
    const servicesData = [
      {
        id: uuidv4(),
        name: "Network Installation",
        code: "SVC-NET-INST",
        description: "Complete network infrastructure setup and configuration",
        category: "Installation",
        hourlyRate: 500000, // KES 5,000/hour in cents
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "IT Support - Monthly",
        code: "SVC-IT-SUPP",
        description: "Monthly IT support and maintenance contract",
        category: "Support",
        hourlyRate: 2000000, // KES 20,000/month in cents
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Software Development",
        code: "SVC-SW-DEV",
        description: "Custom software development services",
        category: "Development",
        hourlyRate: 800000, // KES 8,000/hour in cents
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Data Recovery",
        code: "SVC-DATA-REC",
        description: "Professional data recovery services",
        category: "Recovery",
        hourlyRate: 1000000, // KES 10,000/session in cents
        isActive: 1,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Training - IT Basics",
        code: "SVC-TRAIN-IT",
        description: "IT fundamentals training for staff",
        category: "Training",
        hourlyRate: 300000, // KES 3,000/hour in cents
        isActive: 1,
        createdBy: userId,
      },
    ];
    
    for (const service of servicesData) {
      await db.insert(services).values(service as any);
    }

    // Seed Employees
    console.log("👨‍💼 Seeding employees...");
    const employeesData = [
      {
        id: uuidv4(),
        employeeNumber: "EMP001",
        firstName: "James",
        lastName: "Kariuki",
        email: "james.kariuki@kiini.africa",
        phone: "+254 712 111 001",
        department: "Engineering",
        position: "Senior Software Engineer",
        salary: 15000000, // KES 150,000 in cents
        employmentType: "full_time",
        status: "active",
        hireDate: new Date("2022-01-15"),
        createdBy: userId,
      },
      {
        id: uuidv4(),
        employeeNumber: "EMP002",
        firstName: "Sarah",
        lastName: "Njeri",
        email: "sarah.njeri@kiini.africa",
        phone: "+254 712 111 002",
        department: "Sales",
        position: "Sales Manager",
        salary: 12000000, // KES 120,000 in cents
        employmentType: "full_time",
        status: "active",
        hireDate: new Date("2021-06-01"),
        createdBy: userId,
      },
      {
        id: uuidv4(),
        employeeNumber: "EMP003",
        firstName: "Michael",
        lastName: "Omondi",
        email: "michael.omondi@kiini.africa",
        phone: "+254 712 111 003",
        department: "Finance",
        position: "Accountant",
        salary: 8000000, // KES 80,000 in cents
        employmentType: "full_time",
        status: "active",
        hireDate: new Date("2023-03-01"),
        createdBy: userId,
      },
      {
        id: uuidv4(),
        employeeNumber: "EMP004",
        firstName: "Lucy",
        lastName: "Wambui",
        email: "lucy.wambui@kiini.africa",
        phone: "+254 712 111 004",
        department: "Human Resources",
        position: "HR Manager",
        salary: 10000000, // KES 100,000 in cents
        employmentType: "full_time",
        status: "active",
        hireDate: new Date("2022-08-15"),
        createdBy: userId,
      },
      {
        id: uuidv4(),
        employeeNumber: "EMP005",
        firstName: "Daniel",
        lastName: "Kipchoge",
        email: "daniel.kipchoge@kiini.africa",
        phone: "+254 712 111 005",
        department: "Operations",
        position: "IT Support Technician",
        salary: 6000000, // KES 60,000 in cents
        employmentType: "full_time",
        status: "active",
        hireDate: new Date("2023-09-01"),
        createdBy: userId,
      },
    ];
    
    for (const employee of employeesData) {
      await db.insert(employees).values(employee as any);
    }

    // Seed Projects
    console.log("📁 Seeding projects...");
    const projectsData = [
      {
        id: uuidv4(),
        name: "Safaricom Network Upgrade",
        clientId: insertedClients[0],
        description: "Complete network infrastructure upgrade for Safaricom regional offices",
        status: "in_progress",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-06-30"),
        budget: 500000000, // KES 5,000,000 in cents
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "KPLC ERP Implementation",
        clientId: insertedClients[1],
        description: "Enterprise resource planning system implementation",
        status: "planning",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-12-31"),
        budget: 1000000000, // KES 10,000,000 in cents
        createdBy: userId,
      },
      {
        id: uuidv4(),
        name: "Equity Bank Mobile App",
        clientId: insertedClients[2],
        description: "Mobile banking application development",
        status: "in_progress",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-08-31"),
        budget: 800000000, // KES 8,000,000 in cents
        createdBy: userId,
      },
    ];
    
    const insertedProjects: string[] = [];
    for (const project of projectsData) {
      await db.insert(projects).values(project as any);
      insertedProjects.push(project.id);
    }

    // Seed Estimates
    console.log("📄 Seeding estimates...");
    const estimatesData = [
      {
        id: uuidv4(),
        estimateNumber: "EST-2024-001",
        clientId: insertedClients[0],
        title: "Network Equipment Quote",
        status: "sent",
        issueDate: new Date("2024-01-10"),
        expiryDate: new Date("2024-02-10"),
        subtotal: 250000000, // KES 2,500,000 in cents
        taxAmount: 40000000, // 16% VAT
        total: 290000000,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        estimateNumber: "EST-2024-002",
        clientId: insertedClients[1],
        title: "IT Support Contract",
        status: "accepted",
        issueDate: new Date("2024-02-01"),
        expiryDate: new Date("2024-03-01"),
        subtotal: 120000000, // KES 1,200,000 in cents
        taxAmount: 19200000,
        total: 139200000,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        estimateNumber: "EST-2024-003",
        clientId: insertedClients[3],
        title: "Website Redesign",
        status: "draft",
        issueDate: new Date("2024-03-01"),
        expiryDate: new Date("2024-04-01"),
        subtotal: 80000000, // KES 800,000 in cents
        taxAmount: 12800000,
        total: 92800000,
        createdBy: userId,
      },
    ];
    
    for (const estimate of estimatesData) {
      await db.insert(estimates).values(estimate as any);
    }

    // Seed Invoices
    console.log("🧾 Seeding invoices...");
    const invoicesData = [
      {
        id: uuidv4(),
        invoiceNumber: "INV-2024-001",
        clientId: insertedClients[0],
        title: "Network Equipment Supply",
        status: "paid",
        issueDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        subtotal: 250000000,
        taxAmount: 40000000,
        total: 290000000,
        paidAmount: 290000000,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        invoiceNumber: "INV-2024-002",
        clientId: insertedClients[1],
        title: "IT Support - January",
        status: "partial",
        issueDate: new Date("2024-02-01"),
        dueDate: new Date("2024-03-01"),
        subtotal: 120000000,
        taxAmount: 19200000,
        total: 139200000,
        paidAmount: 70000000,
        createdBy: userId,
      },
      {
        id: uuidv4(),
        invoiceNumber: "INV-2024-003",
        clientId: insertedClients[2],
        title: "Software Development - Phase 1",
        status: "sent",
        issueDate: new Date("2024-03-01"),
        dueDate: new Date("2024-04-01"),
        subtotal: 300000000,
        taxAmount: 48000000,
        total: 348000000,
        paidAmount: 0,
        createdBy: userId,
      },
    ];
    
    const insertedInvoices: string[] = [];
    for (const invoice of invoicesData) {
      await db.insert(invoices).values(invoice as any);
      insertedInvoices.push(invoice.id);
    }

    // Seed Payments
    console.log("💰 Seeding payments...");
    const paymentsData = [
      {
        id: uuidv4(),
        invoiceId: insertedInvoices[0],
        clientId: insertedClients[0],
        amount: 290000000,
        paymentDate: new Date("2024-02-10"),
        paymentMethod: "bank_transfer",
        referenceNumber: "TRF-001-2024",
        notes: "Full payment received",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        invoiceId: insertedInvoices[1],
        clientId: insertedClients[1],
        amount: 70000000,
        paymentDate: new Date("2024-02-15"),
        paymentMethod: "mpesa",
        referenceNumber: "MPESA-12345",
        notes: "Partial payment",
        createdBy: userId,
      },
    ];
    
    for (const payment of paymentsData) {
      await db.insert(payments).values(payment as any);
    }

    // Seed Expenses
    console.log("💸 Seeding expenses...");
    const expensesData = [
      {
        id: uuidv4(),
        expenseNumber: "EXP-2024-001",
        category: "Office Supplies",
        vendor: "Nairobi Office Supplies",
        amount: 2500000, // KES 25,000 in cents
        expenseDate: new Date("2024-01-20"),
        paymentMethod: "cash",
        description: "Printer paper and stationery",
        status: "approved",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        expenseNumber: "EXP-2024-002",
        category: "Utilities",
        vendor: "Kenya Power",
        amount: 4500000, // KES 45,000 in cents
        expenseDate: new Date("2024-02-01"),
        paymentMethod: "bank_transfer",
        description: "Electricity bill - February",
        status: "paid",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        expenseNumber: "EXP-2024-003",
        category: "Travel",
        vendor: "Kenya Airways",
        amount: 8000000, // KES 80,000 in cents
        expenseDate: new Date("2024-02-15"),
        paymentMethod: "card",
        description: "Business trip to Mombasa",
        status: "pending",
        createdBy: userId,
      },
    ];
    
    for (const expense of expensesData) {
      await db.insert(expenses).values(expense as any);
    }

    // Seed Opportunities
    console.log("🎯 Seeding opportunities...");
    const opportunitiesData = [
      {
        id: uuidv4(),
        clientId: insertedClients[4],
        title: "Twiga Foods ERP System",
        description: "Enterprise resource planning system for supply chain management",
        value: 1500000000, // KES 15,000,000 in cents
        stage: "proposal",
        probability: 60,
        expectedCloseDate: new Date("2024-06-30"),
        source: "Referral",
        createdBy: userId,
      },
      {
        id: uuidv4(),
        clientId: insertedClients[3],
        title: "Nation Media Digital Transformation",
        description: "Complete digital transformation project",
        value: 2000000000, // KES 20,000,000 in cents
        stage: "negotiation",
        probability: 75,
        expectedCloseDate: new Date("2024-05-15"),
        source: "Direct",
        createdBy: userId,
      },
    ];
    
    for (const opportunity of opportunitiesData) {
      await db.insert(opportunities).values(opportunity as any);
    }

    // Seed Activity Log
    console.log("📝 Seeding activity log...");
    const activityLogData = [
      {
        id: uuidv4(),
        userId: userId,
        action: "create_client",
        entityType: "client",
        entityId: insertedClients[0],
        description: "Created new client: Safaricom PLC",
      },
      {
        id: uuidv4(),
        userId: userId,
        action: "create_invoice",
        entityType: "invoice",
        entityId: insertedInvoices[0],
        description: "Created invoice INV-2024-001",
      },
      {
        id: uuidv4(),
        userId: userId,
        action: "receive_payment",
        entityType: "payment",
        description: "Received payment of KES 2,900,000 from Safaricom PLC",
      },
      {
        id: uuidv4(),
        userId: userId,
        action: "create_project",
        entityType: "project",
        entityId: insertedProjects[0],
        description: "Created new project: Safaricom Network Upgrade",
      },
    ];
    
    for (const activity of activityLogData) {
      await db.insert(activityLog).values(activity as any);
    }

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${settingsData.length} settings`);
    console.log(`   - ${departmentsData.length} departments`);
    console.log(`   - ${clientsData.length} clients`);
    console.log(`   - ${productsData.length} products`);
    console.log(`   - ${servicesData.length} services`);
    console.log(`   - ${employeesData.length} employees`);
    console.log(`   - ${projectsData.length} projects`);
    console.log(`   - ${estimatesData.length} estimates`);
    console.log(`   - ${invoicesData.length} invoices`);
    console.log(`   - ${paymentsData.length} payments`);
    console.log(`   - ${expensesData.length} expenses`);
    console.log(`   - ${opportunitiesData.length} opportunities`);
    console.log(`   - ${activityLogData.length} activity logs`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
