export interface AppDocSection {
  id: string;
  title: string;
  summary: string;
  routes: string[];
  features: string[];
  workflow: string[];
  roles: string;
  visual: "dashboard" | "finance" | "people" | "pipeline" | "operations";
}

export const appDocumentation: AppDocSection[] = [
  {
    id: "overview",
    title: "Platform Overview",
    summary: "Kiini is an organization-aware business operations platform covering customer management, finance, projects, people, procurement, reporting, and administration.",
    routes: ["/crm-home", "/dashboard", "/documentation"],
    features: ["Role-based navigation", "Organization-scoped records", "Notifications and activity history", "Global search and command palette", "Responsive desktop and mobile layouts"],
    workflow: ["Sign in", "Open role dashboard", "Choose a business module", "Create or review records", "Track notifications and reports"],
    roles: "All authenticated users; available modules depend on role and permissions.",
    visual: "dashboard",
  },
  {
    id: "sales",
    title: "CRM and Sales",
    summary: "Manage the customer lifecycle from lead and client records through opportunities, proposals, estimates, invoices, receipts, and follow-up communication.",
    routes: ["/clients", "/leads", "/opportunities", "/proposals", "/estimates", "/invoices", "/receipts"],
    features: ["Client profiles and contacts", "Sales pipeline stages", "Quotes, estimates, and proposals", "Invoice generation and delivery", "Payment and receipt tracking", "Client portal access"],
    workflow: ["Create client", "Create opportunity", "Prepare estimate or proposal", "Convert to invoice", "Record payment", "Review client history"],
    roles: "Sales, account managers, admins, accountants, and clients have different read/write scopes.",
    visual: "pipeline",
  },
  {
    id: "finance",
    title: "Accounting and Finance",
    summary: "Track revenue, expenses, payments, budgets, accounts, reconciliations, and financial performance through operational and management reports.",
    routes: ["/accounting", "/invoices", "/payments", "/payments/reports", "/financial-dashboard", "/budgets", "/chart-of-accounts"],
    features: ["Invoices and payment allocations", "Payment reports and filters", "Expense management", "Budgets and variance tracking", "Bank reconciliation", "Financial dashboards and exports"],
    workflow: ["Create invoice", "Send or approve invoice", "Record payment", "Reconcile account", "Review reports", "Export evidence"],
    roles: "Accountants, finance managers, admins, and authorized approvers.",
    visual: "finance",
  },
  {
    id: "projects", title: "Projects and Delivery", summary: "Plan delivery work with projects, milestones, tasks, team assignments, progress, files, comments, and project-level financial context.", routes: ["/projects", "/projects/create", "/projects/:id", "/projects/:id/edit", "/project-reports"], features: ["Project metadata and cover visuals", "Progress and status tracking", "Task lists and approvals", "Team assignments", "Project comments", "Client read-only project portal"], workflow: ["Create project", "Assign manager and team", "Create tasks", "Track progress", "Review comments", "Complete delivery"], roles: "Project managers and authorized staff manage delivery. Client portal access is read-only.", visual: "operations",
  },
  {
    id: "people", title: "HR and Payroll", summary: "Maintain employee records and handle attendance, leave, payroll, allowances, deductions, benefits, performance, and statutory reporting.", routes: ["/employees", "/attendance", "/leave-management", "/payroll", "/allowances-deductions", "/hr-reports", "/payroll/tax-compliance"], features: ["Employee profiles and photos", "Attendance and leave workflows", "Payroll processing", "Allowances and deductions", "Payslips and statutory reports", "Performance and contract records"], workflow: ["Create employee", "Configure compensation", "Capture attendance", "Process payroll", "Review approvals", "Issue payslips"], roles: "HR, payroll, admins, managers, and employees according to configured permissions.", visual: "people",
  },
  {
    id: "procurement", title: "Procurement and Operations", summary: "Manage suppliers, purchase requests, orders, inventory, assets, work orders, service records, and operational controls.", routes: ["/suppliers", "/procurement", "/purchase-orders", "/inventory", "/assets", "/work-orders", "/erp-operations"], features: ["Supplier directory", "LPO and purchase order workflows", "Inventory and warehouse records", "Assets and maintenance", "Approvals and audit trail", "Operational dashboards"], workflow: ["Create supplier", "Raise request", "Approve purchase", "Receive or issue stock", "Track cost", "Review audit trail"], roles: "Procurement, finance, operations, admins, and assigned managers.", visual: "operations",
  },
  {
    id: "admin", title: "Administration and Security", summary: "Configure organizations, users, roles, permissions, templates, integrations, backups, system health, and audit controls.", routes: ["/admin/management", "/admin/email-templates", "/settings", "/system-health", "/audit-logs", "/documentation"], features: ["User and role management", "Feature permissions", "Email templates", "Organization settings", "Backups and restore", "System health and audit logs", "API and integration settings"], workflow: ["Create user", "Assign role", "Grant permissions", "Configure settings", "Monitor activity", "Review audit evidence"], roles: "Admins and super admins; sensitive operations require elevated permissions.", visual: "dashboard",
  },
  {
    id: "reports", title: "Reports and Exports", summary: "Use live report pages and exports for operational review, management decisions, compliance, and record sharing.", routes: ["/reports", "/reports/sales", "/payments/reports", "/financial-reports", "/hr-reports", "/project-reports", "/reports/customers"], features: ["Live filtered reports", "CSV exports", "Detailed multi-page PDF export", "Weekly and monthly management reports", "AI-assisted analytics summaries", "Role-scoped report access"], workflow: ["Choose report", "Set date and record filters", "Review totals and details", "Export CSV or PDF", "Share or archive output"], roles: "Report visibility follows organization and feature permissions.", visual: "finance",
  },
];
