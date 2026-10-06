#!/usr/bin/env python3
import os
import re

# Module configuration: (filename, icon, breadcrumb_path, title, description)
modules = [
    ("Receipts", "Receipt", "Sales", "Receipts", "Manage payment receipts and records"),
    ("Expenses", "TrendingDown", "Accounting", "Expenses", "Track and manage business expenses"),
    ("Departments", "Building2", "HR", "Departments", "Manage company departments"),
    ("Attendance", "Calendar", "HR", "Attendance", "Track employee attendance"),
    ("Payroll", "DollarSign", "HR", "Payroll", "Manage payroll and compensation"),
    ("LeaveManagement", "Calendar", "HR", "Leave Management", "Manage employee leave requests"),
    ("Reports", "BarChart3", "Reports", "Reports", "View analytics and reports"),
    ("Opportunities", "Target", "Sales", "Opportunities", "Manage sales opportunities"),
    ("BankReconciliation", "CreditCard", "Accounting", "Bank Reconciliation", "Reconcile bank statements"),
    ("ChartOfAccounts", "Layers", "Accounting", "Chart of Accounts", "Manage accounting structure"),
    ("Proposals", "FileText", "Sales", "Proposals", "Create and manage proposals"),
]

base_path = "/home/ubuntu/Kiini: One Hub. Total Control/client/src/pages"

for filename, icon, breadcrumb_section, title, description in modules:
    filepath = os.path.join(base_path, f"{filename}.tsx")
    
    if not os.path.exists(filepath):
        print(f"⚠️  {filename}.tsx not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already uses ModuleLayout
    if "ModuleLayout" in content:
        print(f"✓ {filename}.tsx already uses ModuleLayout")
        continue
    
    # Replace DashboardLayout import
    content = content.replace(
        'import DashboardLayout from "@/components/DashboardLayout";',
        'import { ModuleLayout } from "@/components/ModuleLayout";'
    )
    
    # Create breadcrumb path
    if breadcrumb_section == "Sales":
        breadcrumb = f'[{{"label": "Dashboard", "href": "/"}}, {{"label": "Sales", "href": "/sales"}}, {{"label": "{title}"}}]'
    elif breadcrumb_section == "Accounting":
        breadcrumb = f'[{{"label": "Dashboard", "href": "/"}}, {{"label": "Accounting", "href": "/accounting"}}, {{"label": "{title}"}}]'
    elif breadcrumb_section == "HR":
        breadcrumb = f'[{{"label": "Dashboard", "href": "/"}}, {{"label": "HR", "href": "/hr"}}, {{"label": "{title}"}}]'
    elif breadcrumb_section == "Reports":
        breadcrumb = f'[{{"label": "Dashboard", "href": "/"}}, {{"label": "Reports"}}]'
    else:
        breadcrumb = f'[{{"label": "Dashboard", "href": "/"}}, {{"label": "{title}"}}]'
    
    # Find and replace the return statement
    pattern = r'return \(\s*<DashboardLayout>\s*<div className="space-y-6">\s*<div className="flex items-center justify-between">\s*<div>\s*<h1[^>]*>([^<]*)</h1>\s*<p[^>]*>([^<]*)</p>\s*</div>'
    
    replacement = f'''return (
    <ModuleLayout
      title="{title}"
      description="{description}"
      icon={<{icon} className="w-6 h-6" />}}
      breadcrumbs={{{breadcrumb}}}
      actions={{
        <Button onClick={{() => navigate("/{filename.lower()}/create")}}>
          <Plus className="mr-2 h-4 w-4" />
          Add {title}
        </Button>
      }}
    >
      <div className="space-y-6">'''
    
    # This is a simplified approach - full implementation would need more careful parsing
    print(f"⚠️  {filename}.tsx needs manual update (complex structure)")

print("\n✓ Batch update analysis complete")
