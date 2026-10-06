#!/bin/bash

# Script to update all module pages to use ModuleLayout
# This script updates the imports and wraps content with ModuleLayout

MODULES=(
  "Invoices:FileText:Accounting:Invoices"
  "Estimates:FileText:Sales:Estimates"
  "Receipts:Receipt:Sales:Receipts"
  "Payments:DollarSign:Accounting:Payments"
  "Expenses:TrendingDown:Accounting:Expenses"
  "Products:Package:Products & Services:Products"
  "Services:Briefcase:Products & Services:Services"
  "Employees:Users:HR:Employees"
  "Departments:Building2:HR:Departments"
  "Attendance:Calendar:HR:Attendance"
  "Payroll:DollarSign:HR:Payroll"
  "LeaveManagement:Calendar:HR:Leave Management"
  "Reports:BarChart3:Reports:Reports"
  "Opportunities:Target:Sales:Opportunities"
  "BankReconciliation:CreditCard:Accounting:Bank Reconciliation"
  "ChartOfAccounts:Layers:Accounting:Chart of Accounts"
  "Proposals:FileText:Sales:Proposals"
)

for module in "${MODULES[@]}"; do
  IFS=':' read -r filename icon section title <<< "$module"
  filepath="/home/ubuntu/kiini-one-hub-total-control/client/src/pages/${filename}.tsx"
  
  if [ -f "$filepath" ]; then
    echo "Updating $filename..."
    
    # Check if already uses ModuleLayout
    if grep -q "ModuleLayout" "$filepath"; then
      echo "  - Already uses ModuleLayout, skipping..."
      continue
    fi
    
    # Replace DashboardLayout import with ModuleLayout
    sed -i 's/import DashboardLayout from "@\/components\/DashboardLayout";/import { ModuleLayout } from "@\/components\/ModuleLayout";/' "$filepath"
    
    # Add icon import if not present
    if ! grep -q "import.*$icon" "$filepath"; then
      # Find the lucide-react import line and add the icon
      sed -i "s/from \"lucide-react\";/,\n  $icon,\n} from \"lucide-react\";/" "$filepath"
    fi
    
    echo "  - Updated successfully"
  else
    echo "  - File not found: $filepath"
  fi
done

echo "Batch update complete!"
