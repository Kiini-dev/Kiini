import { useParams } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useOrgPermission } from "@/hooks/useOrgPermission";

const modulePages = [
  { name: 'OrgSubscriptions', title: 'Subscriptions', href: 'subscriptions', permission: 'subscriptions' },
  { name: 'OrgChartOfAccounts', title: 'Chart of Accounts', href: 'chart-of-accounts', permission: 'accounting' },
  { name: 'OrgBankReconciliation', title: 'Bank Reconciliation', href: 'bank-reconciliation', permission: 'accounting' },
  { name: 'OrgFinancialDashboard', title: 'Financial Dashboard', href: 'financial-dashboard', permission: 'accounting' },
  { name: 'OrgForecasting', title: 'Forecasting', href: 'forecasting', permission: 'accounting' },
  { name: 'OrgTaxCompliance', title: 'Tax Compliance', href: 'tax-compliance', permission: 'accounting' },
  { name: 'OrgSuppliers', title: 'Suppliers', href: 'suppliers', permission: 'procurement' },
  { name: 'OrgPurchaseOrders', title: 'Purchase Orders', href: 'lpos', permission: 'procurement' },
  { name: 'OrgOrders', title: 'Orders', href: 'orders', permission: 'procurement' },
  { name: 'OrgImprests', title: 'Imprests', href: 'imprests', permission: 'procurement' },
  { name: 'OrgProducts', title: 'Products', href: 'products', permission: 'procurement' },
  { name: 'OrgInventory', title: 'Stock', href: 'inventory', permission: 'procurement' },
  { name: 'OrgDeliveryNotes', title: 'Delivery Notes', href: 'delivery-notes', permission: 'procurement' },
  { name: 'OrgGRN', title: 'GRNs', href: 'grn', permission: 'procurement' },
  { name: 'OrgServices', title: 'Services', href: 'services', permission: 'invoicing' },
  { name: 'OrgServiceTemplates', title: 'Service Templates', href: 'service-templates', permission: 'invoicing' },
  { name: 'OrgServiceInvoices', title: 'Service Invoices', href: 'service-invoices', permission: 'invoicing' },
  { name: 'OrgProposals', title: 'Proposals', href: 'proposals', permission: 'invoicing' },
  { name: 'OrgQuotations', title: 'Quotations', href: 'quotations', permission: 'invoicing' },
  { name: 'OrgTasks', title: 'Tasks', href: 'tasks', permission: 'projects' },
  { name: 'OrgContractTemplates', title: 'Contract Templates', href: 'contracts/templates', permission: 'contracts' },
  { name: 'OrgAssets', title: 'Assets', href: 'assets', permission: 'contracts' },
  { name: 'OrgWarranty', title: 'Warranty', href: 'warranty', permission: 'contracts' },
  { name: 'OrgEmployees', title: 'Employees', href: 'employees', permission: 'hr' },
  { name: 'OrgDepartments', title: 'Departments', href: 'departments', permission: 'hr' },
  { name: 'OrgPayroll', title: 'Payroll', href: 'payroll', permission: 'hr' },
  { name: 'OrgJobGroups', title: 'Job Groups', href: 'job-groups', permission: 'hr' },
  { name: 'OrgPerformanceReviews', title: 'Performance Reviews', href: 'performance-reviews', permission: 'hr' },
  { name: 'OrgCannedResponses', title: 'Canned Responses', href: 'canned-responses', permission: 'tickets' },
  { name: 'OrgKnowledgebase', title: 'Knowledgebase', href: 'knowledge-base', permission: 'tickets' },
  { name: 'OrgStaffChat', title: 'Staff Chat', href: 'staff-chat', permission: 'communications' },
  { name: 'OrgDocuments', title: 'Documents', href: 'documents', permission: 'documents' },
  { name: 'OrgTimesheets', title: 'Time Sheets', href: 'timesheets', permission: 'timesheets' },
];

// This is a template - replace with actual implementations
export function createModulePage(title: string, href: string) {
  return function ModulePage() {
    const params = useParams();
    const slug = params.slug as string;

    return (
      <OrgLayout>
        <OrgBreadcrumb items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: title, href: `/org/${slug}/${href}` },
        ]} />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground mt-2">Manage your {title.toLowerCase()}</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New {title.slice(0, -1)}
            </Button>
          </div>
          <Card>
            <CardHeader><CardTitle>All {title}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No {title.toLowerCase()} found</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </OrgLayout>
    );
  };
}
