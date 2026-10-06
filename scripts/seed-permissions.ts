import { getDb } from "../server/db";
import { permissionMetadata } from "../drizzle/schema";
import { v4 as uuid } from "uuid";

// Permission definitions from the frontend
const PERMISSION_DEFINITIONS = [
  // Invoices (6 permissions)
  { id: "invoice.view", label: "View Invoices", description: "View all invoices", category: "Invoices", icon: "eye" },
  { id: "invoice.create", label: "Create Invoices", description: "Create new invoices", category: "Invoices", icon: "plus" },
  { id: "invoice.edit", label: "Edit Invoices", description: "Edit existing invoices", category: "Invoices", icon: "edit" },
  { id: "invoice.delete", label: "Delete Invoices", description: "Delete invoices", category: "Invoices", icon: "trash" },
  { id: "invoice.approve", label: "Approve Invoices", description: "Approve invoice requests", category: "Invoices", icon: "check" },
  { id: "invoice.export", label: "Export Invoices", description: "Export invoices to file", category: "Invoices", icon: "download" },

  // Estimates (6 permissions)
  { id: "estimate.view", label: "View Estimates", description: "View all estimates", category: "Estimates", icon: "eye" },
  { id: "estimate.create", label: "Create Estimates", description: "Create new estimates", category: "Estimates", icon: "plus" },
  { id: "estimate.edit", label: "Edit Estimates", description: "Edit existing estimates", category: "Estimates", icon: "edit" },
  { id: "estimate.delete", label: "Delete Estimates", description: "Delete estimates", category: "Estimates", icon: "trash" },
  { id: "estimate.approve", label: "Approve Estimates", description: "Approve estimate requests", category: "Estimates", icon: "check" },
  { id: "estimate.reject", label: "Reject Estimates", description: "Reject estimate requests", category: "Estimates", icon: "x" },

  // Payments (5 permissions)
  { id: "payment.view", label: "View Payments", description: "View all payments", category: "Payments", icon: "eye" },
  { id: "payment.create", label: "Create Payments", description: "Create new payments", category: "Payments", icon: "plus" },
  { id: "payment.edit", label: "Edit Payments", description: "Edit existing payments", category: "Payments", icon: "edit" },
  { id: "payment.delete", label: "Delete Payments", description: "Delete payments", category: "Payments", icon: "trash" },
  { id: "payment.approve", label: "Approve Payments", description: "Approve payment requests", category: "Payments", icon: "check" },

  // Expenses (5 permissions)
  { id: "expense.view", label: "View Expenses", description: "View all expenses", category: "Expenses", icon: "eye" },
  { id: "expense.create", label: "Create Expenses", description: "Create new expenses", category: "Expenses", icon: "plus" },
  { id: "expense.edit", label: "Edit Expenses", description: "Edit existing expenses", category: "Expenses", icon: "edit" },
  { id: "expense.delete", label: "Delete Expenses", description: "Delete expenses", category: "Expenses", icon: "trash" },
  { id: "expense.approve", label: "Approve Expenses", description: "Approve expense requests", category: "Expenses", icon: "check" },

  // Clients (5 permissions)
  { id: "client.view", label: "View Clients", description: "View all clients", category: "Clients", icon: "eye" },
  { id: "client.create", label: "Create Clients", description: "Create new clients", category: "Clients", icon: "plus" },
  { id: "client.edit", label: "Edit Clients", description: "Edit client information", category: "Clients", icon: "edit" },
  { id: "client.delete", label: "Delete Clients", description: "Delete clients", category: "Clients", icon: "trash" },
  { id: "client.manage", label: "Manage Clients", description: "Full client management", category: "Clients", icon: "settings" },

  // Employees (5 permissions)
  { id: "employee.view", label: "View Employees", description: "View all employees", category: "Employees", icon: "eye" },
  { id: "employee.create", label: "Create Employees", description: "Create new employees", category: "Employees", icon: "plus" },
  { id: "employee.edit", label: "Edit Employees", description: "Edit employee information", category: "Employees", icon: "edit" },
  { id: "employee.deactivate", label: "Deactivate Employees", description: "Deactivate employee accounts", category: "Employees", icon: "ban" },
  { id: "employee.manage", label: "Manage Employees", description: "Full employee management", category: "Employees", icon: "settings" },

  // Reports (3 permissions)
  { id: "report.view", label: "View Reports", description: "View all reports", category: "Reports", icon: "eye" },
  { id: "report.create", label: "Create Reports", description: "Create custom reports", category: "Reports", icon: "plus" },
  { id: "report.export", label: "Export Reports", description: "Export reports to file", category: "Reports", icon: "download" },

  // Users (5 permissions)
  { id: "user.view", label: "View Users", description: "View all system users", category: "Users", icon: "eye" },
  { id: "user.create", label: "Create Users", description: "Create new user accounts", category: "Users", icon: "plus" },
  { id: "user.edit", label: "Edit Users", description: "Edit user information", category: "Users", icon: "edit" },
  { id: "user.delete", label: "Delete Users", description: "Delete user accounts", category: "Users", icon: "trash" },
  { id: "user.manage", label: "Manage Users", description: "Full user management", category: "Users", icon: "settings" },

  // Roles & Permissions (5 permissions)
  { id: "role.view", label: "View Roles", description: "View all roles", category: "Roles", icon: "eye" },
  { id: "role.create", label: "Create Roles", description: "Create new roles", category: "Roles", icon: "plus" },
  { id: "role.edit", label: "Edit Roles", description: "Edit existing roles", category: "Roles", icon: "edit" },
  { id: "role.delete", label: "Delete Roles", description: "Delete custom roles", category: "Roles", icon: "trash" },
  { id: "role.manage_permissions", label: "Manage Permissions", description: "Assign permissions to roles", category: "Roles", icon: "key" },

  // Settings (2 permissions)
  { id: "setting.view", label: "View Settings", description: "View system settings", category: "Settings", icon: "eye" },
  { id: "setting.manage", label: "Manage Settings", description: "Modify system settings", category: "Settings", icon: "settings" },

  // Workflows (4 permissions)
  { id: "workflow.view", label: "View Workflows", description: "View all workflows", category: "Workflows", icon: "eye" },
  { id: "workflow.create", label: "Create Workflows", description: "Create new workflows", category: "Workflows", icon: "plus" },
  { id: "workflow.edit", label: "Edit Workflows", description: "Edit existing workflows", category: "Workflows", icon: "edit" },
  { id: "workflow.delete", label: "Delete Workflows", description: "Delete workflows", category: "Workflows", icon: "trash" },

  // Dashboard (2 permissions)
  { id: "dashboard.view", label: "View Dashboard", description: "Access dashboard", category: "Dashboard", icon: "eye" },
  { id: "dashboard.customize", label: "Customize Dashboard", description: "Customize dashboard layouts", category: "Dashboard", icon: "settings" },
];

async function seedPermissions() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  console.log("Seeding permission metadata...");

  for (const perm of PERMISSION_DEFINITIONS) {
    try {
      // Check if permission already exists
      const existing = await db
        .select()
        .from(permissionMetadata)
        .where({ permissionId: perm.id });

      if (existing && existing.length > 0) {
        console.log(`Permission ${perm.id} already exists, skipping...`);
        continue;
      }

      // Insert permission
      await db.insert(permissionMetadata).values({
        id: uuid(),
        permissionId: perm.id,
        label: perm.label,
        description: perm.description,
        category: perm.category,
        icon: perm.icon,
        isSystem: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log(`✓ Seeded permission: ${perm.label}`);
    } catch (error) {
      console.error(`Failed to seed permission ${perm.id}:`, error);
    }
  }

  console.log("\n✓ Permission seeding completed!");
  process.exit(0);
}

seedPermissions().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
