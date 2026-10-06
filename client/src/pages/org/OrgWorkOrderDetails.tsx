import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Loader2,
  ClipboardList,
  User,
  Calendar,
  DollarSign,
  Package,
  Printer,
} from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useCurrency } from "@/lib/currency";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { getDefaultDocumentTemplate, resolveTemplateTypeForDocument } from "@/lib/documentTemplateHelpers";

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  open: "bg-blue-100 text-blue-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function WorkOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { format } = useCurrency();

  const { data: wo, isLoading } = trpc.workOrders.get.useQuery({ id: id || "" });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery({});
  const { data: bankPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: mpesaPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" });
  const templateType = resolveTemplateTypeForDocument("work_order");
  const { data: docTemplatesList = [] } = trpc.documentTemplates.list.useQuery({ type: templateType });

  if (isLoading) {
    return (
      <ModuleLayout
        title="Work Order"
        icon={<ClipboardList className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Work Orders", href: "/work-orders" },
          { label: "Loading..." },
        ]}
        backLink={{ label: "Work Orders", href: "/work-orders" }}
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ModuleLayout>
    );
  }

  if (!wo) {
    return (
      <ModuleLayout
        title="Work Order Not Found"
        icon={<ClipboardList className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Work Orders", href: "/work-orders" },
          { label: "Not Found" },
        ]}
        backLink={{ label: "Work Orders", href: "/work-orders" }}
      >
        <div className="text-center py-16 text-muted-foreground">
          Work order not found or you don't have permission to view it.
        </div>
      </ModuleLayout>
    );
  }

  const materials: any[] = Array.isArray(wo.materials) ? wo.materials : [];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const defaultDocTemplate = getDefaultDocumentTemplate(docTemplatesList as any[]);

    const html = generateDocumentHTML({
      documentType: "estimate",
      documentNumber: wo.workOrderNumber || "N/A",
      documentDate: wo.issueDate ? new Date(wo.issueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      dueDate: wo.targetEndDate ? new Date(wo.targetEndDate).toISOString().split("T")[0] : "",
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: wo.assignedTo || "Assigned Team",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      items: materials.map((item: any) => ({
        description: item.description || "",
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitCost || 0),
        total: Number(item.total || 0),
      })),
      subtotal: Number(wo.laborCost || 0) + Number(wo.serviceCost || 0),
      tax: 0,
      total: Number(wo.total || 0),
      notes: wo.notes || wo.description || "",
      bankDetailsHtml: bankPayData?.enabled === "true" ? bankPayData?.details : undefined,
      mpesaPaybill: mpesaPayData?.enabled === "true" ? mpesaPayData?.paybillNumber : undefined,
      mpesaAccountNumber: mpesaPayData?.enabled === "true" ? mpesaPayData?.paybillNumber : undefined,
      customTemplateHtml: defaultDocTemplate?.content || undefined,
    });

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <ModuleLayout
      title={wo.workOrderNumber}
      icon={<ClipboardList className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Work Orders", href: "/work-orders" },
        { label: wo.workOrderNumber },
      ]}
      backLink={{ label: "Work Orders", href: "/work-orders" }}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={() => navigate(`/work-orders/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-xl">{wo.workOrderNumber}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={priorityColors[wo.priority] || "bg-gray-100 text-gray-700"}>
                  {wo.priority.charAt(0).toUpperCase() + wo.priority.slice(1)} Priority
                </Badge>
                <Badge className={statusColors[wo.status] || "bg-gray-100 text-gray-700"}>
                  {wo.status.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{wo.description}</p>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assignment & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-medium">{wo.assignedTo || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span>{fmt(wo.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span>{fmt(wo.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target End Date</span>
                <span>{fmt(wo.targetEndDate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Table */}
        {materials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((m: any, i: number) => (
                    <TableRow key={m.id || i}>
                      <TableCell>{m.description}</TableCell>
                      <TableCell className="text-right">{m.quantity}</TableCell>
                      <TableCell className="text-right">{format(m.unitCost)}</TableCell>
                      <TableCell className="text-right">{format(m.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Cost Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labor Cost</span>
              <span>{format(wo.laborCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Cost</span>
              <span>{format(wo.serviceCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{format(wo.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {wo.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wo.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
