import { drizzle } from "drizzle-orm/mysql2";
import { clients, projects, projectTasks, notifications } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedData() {
  console.log("🌱 Seeding database with sample data...");

  try {
    // Create sample clients
    const sampleClients = [
      {
        id: "client_1",
        companyName: "Acme Corporation",
        contactPerson: "John Smith",
        email: "john@acmecorp.com",
        phone: "+254712345678",
        address: "123 Business Street",
        city: "Nairobi",
        country: "Kenya",
        postalCode: "00100",
        industry: "Technology",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_2",
        companyName: "TechStart Solutions",
        contactPerson: "Sarah Johnson",
        email: "sarah@techstart.com",
        phone: "+254723456789",
        address: "456 Innovation Hub",
        city: "Mombasa",
        country: "Kenya",
        postalCode: "80100",
        industry: "Software Development",
        status: "active" as const,
        createdBy: "system",
      },
      {
        id: "client_3",
        companyName: "Global Enterprises Ltd",
        contactPerson: "Michael Brown",
        email: "michael@globalent.com",
        phone: "+254734567890",
        address: "789 Corporate Plaza",
        city: "Kisumu",
        country: "Kenya",
        postalCode: "40100",
        industry: "Consulting",
        status: "active" as const,
        createdBy: "system",
      },
    ];

    console.log("Creating clients...");
    for (const client of sampleClients) {
      await db.insert(clients).values(client).onDuplicateKeyUpdate({ set: { companyName: client.companyName } });
    }
    console.log("✅ Clients created");

    // Create sample projects
    const sampleProjects = [
      {
        id: "proj_1",
        projectNumber: "PRJ-2024-001",
        name: "Website Redesign",
        description: "Complete redesign of corporate website with modern UI/UX",
        clientId: "client_1",
        status: "active" as const,
        priority: "high" as const,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-04-30"),
        actualStartDate: new Date("2024-01-15"),
        budget: 50000000, // 500,000 KES in cents
        actualCost: 20000000, // 200,000 KES in cents
        progress: 65,
        projectManager: "Alice Manager",
        assignedTo: "Development Team",
        createdBy: "system",
      },
      {
        id: "proj_2",
        projectNumber: "PRJ-2024-002",
        name: "Mobile App Development",
        description: "iOS and Android mobile application for customer engagement",
        clientId: "client_2",
        status: "active" as const,
        priority: "urgent" as const,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-06-30"),
        actualStartDate: new Date("2024-02-01"),
        budget: 120000000, // 1,200,000 KES in cents
        actualCost: 45000000, // 450,000 KES in cents
        progress: 40,
        projectManager: "Bob Anderson",
        assignedTo: "Mobile Team",
        createdBy: "system",
      },
      {
        id: "proj_3",
        projectNumber: "PRJ-2024-003",
        name: "CRM System Implementation",
        description: "Deploy and customize CRM system for sales team",
        clientId: "client_3",
        status: "planning" as const,
        priority: "medium" as const,
        startDate: new Date("2024-05-01"),
        endDate: new Date("2024-08-31"),
        budget: 80000000, // 800,000 KES in cents
        actualCost: 0,
        progress: 0,
        projectManager: "Carol Davis",
        assignedTo: "Implementation Team",
        createdBy: "system",
      },
      {
        id: "proj_4",
        projectNumber: "PRJ-2024-004",
        name: "Data Migration Project",
        description: "Migrate legacy data to new cloud infrastructure",
        clientId: "client_1",
        status: "on_hold" as const,
        priority: "low" as const,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-05-31"),
        actualStartDate: new Date("2024-03-01"),
        budget: 35000000, // 350,000 KES in cents
        actualCost: 15000000, // 150,000 KES in cents
        progress: 30,
        projectManager: "David Wilson",
        assignedTo: "Infrastructure Team",
        createdBy: "system",
      },
      {
        id: "proj_5",
        projectNumber: "PRJ-2023-015",
        name: "E-commerce Platform",
        description: "Full-featured online shopping platform with payment integration",
        clientId: "client_2",
        status: "completed" as const,
        priority: "high" as const,
        startDate: new Date("2023-09-01"),
        endDate: new Date("2023-12-31"),
        actualStartDate: new Date("2023-09-01"),
        actualEndDate: new Date("2023-12-28"),
        budget: 150000000, // 1,500,000 KES in cents
        actualCost: 145000000, // 1,450,000 KES in cents
        progress: 100,
        projectManager: "Eve Thompson",
        assignedTo: "E-commerce Team",
        createdBy: "system",
      },
    ];

    console.log("Creating projects...");
    for (const project of sampleProjects) {
      await db.insert(projects).values(project).onDuplicateKeyUpdate({ set: { name: project.name } });
    }
    console.log("✅ Projects created");

    // Create sample tasks for the first project
    const sampleTasks = [
      {
        id: "task_1",
        projectId: "proj_1",
        title: "Design mockups and wireframes",
        description: "Create initial design concepts and user flow diagrams",
        status: "completed" as const,
        priority: "high" as const,
        assignedTo: "Design Team",
        dueDate: new Date("2024-02-15"),
        completedDate: new Date("2024-02-14"),
        estimatedHours: 40,
        actualHours: 38,
        order: 1,
        createdBy: "system",
      },
      {
        id: "task_2",
        projectId: "proj_1",
        title: "Frontend development",
        description: "Implement responsive UI components",
        status: "in_progress" as const,
        priority: "high" as const,
        assignedTo: "Frontend Team",
        dueDate: new Date("2024-03-30"),
        estimatedHours: 120,
        actualHours: 75,
        order: 2,
        createdBy: "system",
      },
      {
        id: "task_3",
        projectId: "proj_1",
        title: "Backend API integration",
        description: "Connect frontend to backend services",
        status: "todo" as const,
        priority: "medium" as const,
        assignedTo: "Backend Team",
        dueDate: new Date("2024-04-15"),
        estimatedHours: 60,
        order: 3,
        createdBy: "system",
      },
      {
        id: "task_4",
        projectId: "proj_1",
        title: "Testing and QA",
        description: "Comprehensive testing across all browsers and devices",
        status: "todo" as const,
        priority: "high" as const,
        assignedTo: "QA Team",
        dueDate: new Date("2024-04-25"),
        estimatedHours: 40,
        order: 4,
        createdBy: "system",
      },
    ];

    console.log("Creating project tasks...");
    for (const task of sampleTasks) {
      await db.insert(projectTasks).values(task).onDuplicateKeyUpdate({ set: { title: task.title } });
    }
    console.log("✅ Project tasks created");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log("✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });

