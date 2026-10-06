import os

base_dir = os.path.join(os.getcwd(), 'client', 'src', 'pages', 'org')
modules = [
    ('OrgFinancialDashboard.tsx', 'Financial Dashboard', 'financial-dashboard'),
    ('OrgForecasting.tsx', 'Forecasting', 'forecasting'),
    ('OrgTaxCompliance.tsx', 'Tax Compliance', 'tax-compliance'),
    ('OrgSuppliers.tsx', 'Suppliers', 'suppliers'),
    ('OrgPurchaseOrders.tsx', 'Purchase Orders', 'lpos'),
    ('OrgOrders.tsx', 'Orders', 'orders'),
    ('OrgImprests.tsx', 'Imprests', 'imprests'),
    ('OrgProducts.tsx', 'Products', 'products'),
    ('OrgInventory.tsx', 'Stock', 'inventory'),
    ('OrgDeliveryNotes.tsx', 'Delivery Notes', 'delivery-notes'),
    ('OrgGRN.tsx', 'GRNs', 'grn'),
    ('OrgServices.tsx', 'Services', 'services'),
    ('OrgServiceTemplates.tsx', 'Service Templates', 'service-templates'),
    ('OrgServiceInvoices.tsx', 'Service Invoices', 'service-invoices'),
    ('OrgProposals.tsx', 'Proposals', 'proposals'),
    ('OrgQuotations.tsx', 'Quotations', 'quotations'),
    ('OrgTasks.tsx', 'Tasks', 'tasks'),
    ('OrgContractTemplates.tsx', 'Contract Templates', 'contracts/templates'),
    ('OrgAssets.tsx', 'Assets', 'assets'),
    ('OrgWarranty.tsx', 'Warranty', 'warranty'),
    ('OrgEmployees.tsx', 'Employees', 'employees'),
    ('OrgDepartments.tsx', 'Departments', 'departments'),
    ('OrgPayroll.tsx', 'Payroll', 'payroll'),
    ('OrgJobGroups.tsx', 'Job Groups', 'job-groups'),
    ('OrgPerformanceReviews.tsx', 'Performance Reviews', 'performance-reviews'),
    ('OrgCannedResponses.tsx', 'Canned Responses', 'canned-responses'),
    ('OrgKnowledgebase.tsx', 'Knowledgebase', 'knowledge-base'),
    ('OrgStaffChat.tsx', 'Staff Chat', 'staff-chat'),
    ('OrgDocuments.tsx', 'Documents', 'documents'),
    ('OrgTimesheets.tsx', 'Time Sheets', 'timesheets'),
]

template = '''import { useParams } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";

export default function __COMPONENT_NAME__() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <OrgLayout>
      <OrgBreadcrumb
        items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: "__TITLE__", href: `/org/${slug}/__SLUG__` },
        ]}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">__TITLE__</h1>
            <p className="text-muted-foreground mt-2">Manage your __TITLE_LOWER__</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All __TITLE__</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No items found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
'''

for filename, title, slug in modules:
    path = os.path.join(base_dir, filename)
    if os.path.exists(path):
        print(f"Skipping existing {filename}")
        continue
    content = template.replace("__COMPONENT_NAME__", filename.replace('.tsx', ''))
    content = content.replace("__TITLE__", title)
    content = content.replace("__SLUG__", slug)
    content = content.replace("__TITLE_LOWER__", title.lower())
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filename}")
''