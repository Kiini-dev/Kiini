/**
 * Enhanced Seed Data Script for Kiini
 * This script adds comprehensive sample data for testing all modules
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { 
  clients, 
  projects, 
  projectTasks, 
  products, 
  services, 
  invoices, 
  invoiceItems,
  estimates, 
  estimateItems,
  payments, 
  expenses, 
  employees,
  opportunities,
  leaveRequests,
  payroll,
} from "../drizzle/schema";

async function seedAllData() {
  console.log("🌱 Seeding database with comprehensive sample data...");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  // Create connection pool
  const pool = mysql.createPool(process.env.DATABASE_URL);
  const db = drizzle(pool);

  try {
    // ============= CLIENTS =============
    const sampleClients = [
      {
        id: "client_1",
        companyName: "Acme Corporation",
        contactPerson: "John Smith",
        email: "john@acmecorp.com",
        phone: "+254712345678",
        address: "123 Business Street, Westlands",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        industry: "Technology",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_2",
        companyName: "Safari Tours Ltd",
        contactPerson: "Jane Wanjiku",
        email: "jane@safaritours.co.ke",
        phone: "+254723456789",
        address: "456 Tourism Road, Karen",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00502",
        industry: "Tourism",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_3",
        companyName: "Green Energy Solutions",
        contactPerson: "Peter Ochieng",
        email: "peter@greenenergy.co.ke",
        phone: "+254734567890",
        address: "789 Solar Avenue, Industrial Area",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00501",
        industry: "Energy",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_4",
        companyName: "Mombasa Shipping Co",
        contactPerson: "Ahmed Hassan",
        email: "ahmed@mombasashipping.com",
        phone: "+254745678901",
        address: "Port Road, Kilindini",
        city: "Mombasa",
        country: "Kenya",
        postalCode: "80100",
        industry: "Logistics",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_5",
        companyName: "Rift Valley Farms",
        contactPerson: "Mary Chebet",
        email: "mary@riftvalleyfarms.co.ke",
        phone: "+254756789012",
        address: "Farm Road, Nakuru",
        city: "Nakuru",
        country: "Kenya",
        postalCode: "20100",
        industry: "Agriculture",
        status: "active" as const,
        createdBy: "system",
      },
    ];

    console.log("📊 Inserting clients...");
    for (const client of sampleClients) {
      try {
        await db.insert(clients).values(client).onDuplicateKeyUpdate({ set: { companyName: client.companyName } });
      } catch (e) {
        console.log(`  Client ${client.companyName} already exists or error: ${e}`);
      }
    }

    // ============= PRODUCTS =============
    const sampleProducts = [
      {
        id: "prod_1",
        name: "Enterprise Server",
        sku: "SRV-001",
        description: "High-performance enterprise server solution",
        category: "Hardware",
        price: 50000000, // 500,000 KES in cents
        cost: 35000000,
        stockQuantity: 10,
        unit: "unit",
        status: "active" as const,
      },
      {
        id: "prod_2",
        name: "Network Switch 24-Port",
        sku: "NET-024",
        description: "24-port managed network switch",
        category: "Networking",
        price: 4500000,
        cost: 3000000,
        stockQuantity: 25,
        unit: "unit",
        status: "active" as const,
      },
      {
        id: "prod_3",
        name: "UPS 3000VA",
        sku: "UPS-3000",
        description: "Uninterruptible power supply 3000VA",
        category: "Power",
        price: 8500000,
        cost: 6000000,
        stockQuantity: 15,
        unit: "unit",
        status: "active" as const,
      },
      {
        id: "prod_4",
        name: "Workstation Desktop",
        sku: "WRK-001",
        description: "Professional workstation computer",
        category: "Hardware",
        price: 15000000,
        cost: 10000000,
        stockQuantity: 20,
        unit: "unit",
        status: "active" as const,
      },
      {
        id: "prod_5",
        name: "Security Camera System",
        sku: "SEC-CAM",
        description: "8-channel CCTV security system",
        category: "Security",
        price: 12000000,
        cost: 8000000,
        stockQuantity: 8,
        unit: "set",
        status: "active" as const,
      },
    ];

    console.log("📦 Inserting products...");
    for (const product of sampleProducts) {
      try {
        await db.insert(products).values(product).onDuplicateKeyUpdate({ set: { name: product.name } });
      } catch (e) {
        console.log(`  Product ${product.name} already exists or error: ${e}`);
      }
    }

    // ============= SERVICES =============
    const sampleServices = [
      {
        id: "svc_1",
        name: "IT Consulting",
        code: "SVC-CON",
        description: "Professional IT consulting services",
        category: "Consulting",
        hourlyRate: 1000000, // 10,000 KES/hr in cents
        billingType: "hourly" as const,
        status: "active" as const,
      },
      {
        id: "svc_2",
        name: "Network Installation",
        code: "SVC-NET",
        description: "Complete network setup and installation",
        category: "Technical",
        hourlyRate: 800000,
        billingType: "hourly" as const,
        status: "active" as const,
      },
      {
        id: "svc_3",
        name: "Software Development",
        code: "SVC-DEV",
        description: "Custom software development services",
        category: "Development",
        hourlyRate: 1500000,
        billingType: "hourly" as const,
        status: "active" as const,
      },
      {
        id: "svc_4",
        name: "Technical Support",
        code: "SVC-SUP",
        description: "24/7 technical support services",
        category: "Support",
        hourlyRate: 500000,
        billingType: "hourly" as const,
        status: "active" as const,
      },
      {
        id: "svc_5",
        name: "Cybersecurity Audit",
        code: "SVC-SEC",
        description: "Comprehensive security assessment",
        category: "Security",
        hourlyRate: 2000000,
        billingType: "project" as const,
        status: "active" as const,
      },
    ];

    console.log("🔧 Inserting services...");
    for (const service of sampleServices) {
      try {
        await db.insert(services).values(service).onDuplicateKeyUpdate({ set: { name: service.name } });
      } catch (e) {
        console.log(`  Service ${service.name} already exists or error: ${e}`);
      }
    }

    // ============= EMPLOYEES =============
    const sampleEmployees = [
      {
        id: "emp_1",
        firstName: "James",
        lastName: "Mwangi",
        email: "james.mwangi@kiini.africa",
        phone: "+254712111111",
        employeeNumber: "EMP-001",
        department: "Engineering",
        position: "Senior Developer",
        hireDate: new Date("2022-01-15"),
        salary: 15000000, // 150,000 KES in cents
        status: "active" as const,
      },
      {
        id: "emp_2",
        firstName: "Grace",
        lastName: "Akinyi",
        email: "grace.akinyi@kiini.africa",
        phone: "+254723222222",
        employeeNumber: "EMP-002",
        department: "Sales",
        position: "Sales Manager",
        hireDate: new Date("2021-06-01"),
        salary: 12000000,
        status: "active" as const,
      },
      {
        id: "emp_3",
        firstName: "David",
        lastName: "Kipchoge",
        email: "david.kipchoge@kiini.africa",
        phone: "+254734333333",
        employeeNumber: "EMP-003",
        department: "Finance",
        position: "Accountant",
        hireDate: new Date("2023-03-10"),
        salary: 10000000,
        status: "active" as const,
      },
      {
        id: "emp_4",
        firstName: "Sarah",
        lastName: "Wambui",
        email: "sarah.wambui@kiini.africa",
        phone: "+254745444444",
        employeeNumber: "EMP-004",
        department: "HR",
        position: "HR Manager",
        hireDate: new Date("2020-09-20"),
        salary: 11000000,
        status: "active" as const,
      },
      {
        id: "emp_5",
        firstName: "Michael",
        lastName: "Omondi",
        email: "michael.omondi@kiini.africa",
        phone: "+254756555555",
        employeeNumber: "EMP-005",
        department: "Engineering",
        position: "Junior Developer",
        hireDate: new Date("2024-01-05"),
        salary: 8000000,
        status: "active" as const,
      },
    ];

    console.log("👥 Inserting employees...");
    for (const employee of sampleEmployees) {
      try {
        await db.insert(employees).values(employee).onDuplicateKeyUpdate({ set: { firstName: employee.firstName } });
      } catch (e) {
        console.log(`  Employee ${employee.firstName} ${employee.lastName} already exists or error: ${e}`);
      }
    }

    // ============= OPPORTUNITIES =============
    const sampleOpportunities = [
      {
        id: "opp_1",
        name: "Enterprise IT Infrastructure",
        clientId: "client_1",
        value: 250000000, // 2.5M KES
        stage: "proposal" as const,
        probability: 60,
        expectedCloseDate: new Date("2025-02-28"),
        owner: "Grace Akinyi",
        source: "Referral",
      },
      {
        id: "opp_2",
        name: "Tourism Portal Development",
        clientId: "client_2",
        value: 150000000,
        stage: "negotiation" as const,
        probability: 80,
        expectedCloseDate: new Date("2025-01-31"),
        owner: "Grace Akinyi",
        source: "Website",
      },
      {
        id: "opp_3",
        name: "Solar Monitoring System",
        clientId: "client_3",
        value: 80000000,
        stage: "qualification" as const,
        probability: 40,
        expectedCloseDate: new Date("2025-03-15"),
        owner: "James Mwangi",
        source: "Trade Show",
      },
      {
        id: "opp_4",
        name: "Port Logistics Software",
        clientId: "client_4",
        value: 300000000,
        stage: "prospecting" as const,
        probability: 20,
        expectedCloseDate: new Date("2025-06-30"),
        owner: "Grace Akinyi",
        source: "Cold Call",
      },
      {
        id: "opp_5",
        name: "Farm Management System",
        clientId: "client_5",
        value: 120000000,
        stage: "closed_won" as const,
        probability: 100,
        expectedCloseDate: new Date("2024-12-15"),
        owner: "James Mwangi",
        source: "Referral",
      },
    ];

    console.log("💼 Inserting opportunities...");
    for (const opportunity of sampleOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onDuplicateKeyUpdate({ set: { name: opportunity.name } });
      } catch (e) {
        console.log(`  Opportunity ${opportunity.name} already exists or error: ${e}`);
      }
    }

    // ============= EXPENSES =============
    const sampleExpenses = [
      {
        id: "exp_1",
        description: "Office Supplies",
        category: "Office Supplies",
        amount: 2500000, // 25,000 KES
        date: new Date("2024-12-01"),
        vendor: "Stationary World",
        paymentMethod: "mpesa" as const,
        status: "approved" as const,
      },
      {
        id: "exp_2",
        description: "Internet Subscription",
        category: "Utilities",
        amount: 1500000,
        date: new Date("2024-12-05"),
        vendor: "Safaricom",
        paymentMethod: "bank_transfer" as const,
        status: "approved" as const,
      },
      {
        id: "exp_3",
        description: "Software Licenses",
        category: "Software",
        amount: 5000000,
        date: new Date("2024-12-10"),
        vendor: "Microsoft",
        paymentMethod: "card" as const,
        status: "approved" as const,
      },
      {
        id: "exp_4",
        description: "Team Lunch",
        category: "Entertainment",
        amount: 800000,
        date: new Date("2024-12-12"),
        vendor: "Java House",
        paymentMethod: "cash" as const,
        status: "pending" as const,
      },
      {
        id: "exp_5",
        description: "Client Travel",
        category: "Travel",
        amount: 3500000,
        date: new Date("2024-12-08"),
        vendor: "Kenya Airways",
        paymentMethod: "card" as const,
        status: "approved" as const,
      },
    ];

    console.log("💸 Inserting expenses...");
    for (const expense of sampleExpenses) {
      try {
        await db.insert(expenses).values(expense).onDuplicateKeyUpdate({ set: { description: expense.description } });
      } catch (e) {
        console.log(`  Expense ${expense.description} already exists or error: ${e}`);
      }
    }

    // ============= PAYMENTS =============
    const samplePayments = [
      {
        id: "pay_1",
        clientId: "client_1",
        amount: 50000000, // 500,000 KES
        paymentMethod: "bank_transfer" as const,
        status: "completed" as const,
        date: new Date("2024-12-01"),
        receiptNumber: "REC-2024-001",
        reference: "TRX123456",
      },
      {
        id: "pay_2",
        clientId: "client_2",
        amount: 25000000,
        paymentMethod: "mpesa" as const,
        status: "completed" as const,
        date: new Date("2024-12-05"),
        receiptNumber: "REC-2024-002",
        reference: "MPESA789012",
      },
      {
        id: "pay_3",
        clientId: "client_3",
        amount: 15000000,
        paymentMethod: "cheque" as const,
        status: "pending" as const,
        date: new Date("2024-12-10"),
        receiptNumber: "REC-2024-003",
        reference: "CHQ345678",
      },
      {
        id: "pay_4",
        clientId: "client_5",
        amount: 30000000,
        paymentMethod: "bank_transfer" as const,
        status: "completed" as const,
        date: new Date("2024-12-12"),
        receiptNumber: "REC-2024-004",
        reference: "TRX901234",
      },
    ];

    console.log("💰 Inserting payments...");
    for (const payment of samplePayments) {
      try {
        await db.insert(payments).values(payment).onDuplicateKeyUpdate({ set: { receiptNumber: payment.receiptNumber } });
      } catch (e) {
        console.log(`  Payment ${payment.receiptNumber} already exists or error: ${e}`);
      }
    }

    // ============= PROJECTS =============
    const sampleProjects = [
      {
        id: "proj_1",
        name: "Website Redesign",
        clientId: "client_1",
        description: "Complete website redesign with modern UI/UX",
        status: "in_progress" as const,
        startDate: new Date("2024-11-01"),
        endDate: new Date("2025-02-28"),
        budget: 80000000,
        progress: 45,
      },
      {
        id: "proj_2",
        name: "Mobile App Development",
        clientId: "client_2",
        description: "Tourism booking mobile application",
        status: "in_progress" as const,
        startDate: new Date("2024-10-15"),
        endDate: new Date("2025-03-31"),
        budget: 150000000,
        progress: 30,
      },
      {
        id: "proj_3",
        name: "Network Infrastructure",
        clientId: "client_4",
        description: "Port network infrastructure upgrade",
        status: "planning" as const,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-06-30"),
        budget: 200000000,
        progress: 10,
      },
      {
        id: "proj_4",
        name: "Farm Management System",
        clientId: "client_5",
        description: "IoT-based farm management solution",
        status: "completed" as const,
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-12-01"),
        budget: 120000000,
        progress: 100,
      },
    ];

    console.log("📁 Inserting projects...");
    for (const project of sampleProjects) {
      try {
        await db.insert(projects).values(project).onDuplicateKeyUpdate({ set: { name: project.name } });
      } catch (e) {
        console.log(`  Project ${project.name} already exists or error: ${e}`);
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\nSummary:");
    console.log(`  - ${sampleClients.length} clients`);
    console.log(`  - ${sampleProducts.length} products`);
    console.log(`  - ${sampleServices.length} services`);
    console.log(`  - ${sampleEmployees.length} employees`);
    console.log(`  - ${sampleOpportunities.length} opportunities`);
    console.log(`  - ${sampleExpenses.length} expenses`);
    console.log(`  - ${samplePayments.length} payments`);
    console.log(`  - ${sampleProjects.length} projects`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedAllData().catch(console.error);
