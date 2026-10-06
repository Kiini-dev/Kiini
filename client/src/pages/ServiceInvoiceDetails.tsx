import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Loader2,
  FileText,
  User,
  Calendar,
  DollarSign,
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

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  paid: "bg-emerald-100 text-emerald-700",
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

export default function ServiceInvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { format } = useCurrency();

  const { data: si, isLoading } = trpc.serviceInvoices.get.useQuery({ id: id || "" });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery({});
  const { data: bankPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: mpesaPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" });
  const templateType = resolveTemplateTypeForDocument("service_invoice");
  const { data: docTemplatesList = [] } = trpc.documentTemplates.list.useQuery({ type: templateType });

  if (isLoading) {
    return (
      <ModuleLayout
        title="Service Invoice"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Service Invoices", href: "/service-invoices" },
          { label: "Loading..." },
        ]}
        backLink="/service-invoices"
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ModuleLayout>
    );
  }

  if (!si) {
    return (
      <ModuleLayout
        title="Service Invoice Not Found"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Service Invoices", href: "/service-invoices" },
          { label: "Not Found" },
        ]}
        backLink="/service-invoices"
      >
        <div className="text-center py-16 text-muted-foreground">
          Service invoice not found or you don't have permission to view it.
        </div>
      </ModuleLayout>
    );
  }

  const items: any[] = Array.isArray((si as any).serviceItems) ? (si as any).serviceItems : [];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const defaultDocTemplate = getDefaultDocumentTemplate(docTemplatesList as any[]);

    const html = generateDocumentHTML({
      documentType: "invoice",
      documentNumber: (si as any).serviceInvoiceNumber || "N/A",
      documentDate: (si as any).issueDate
        ? new Date((si as any).issueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      dueDate: (si as any).dueDate ? new Date((si as any).dueDate).toISOString().split("T")[0] : "",
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: (si as any).clientName || "Client",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      items: items.map((item: any) => ({
        description: item.description || "",
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.total || 0),
      })),
      subtotal: Number((si as any).subtotal || 0),
      tax: Number((si as any).taxAmount || 0),
      total: Number((si as any).total || 0),
      notes: (si as any).notes || (si as any).serviceDescription || "",
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
      title={(si as any).serviceInvoiceNumber || "Service Invoice"}
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Service Invoices", href: "/service-invoices" },
        { label: (si as any).serviceInvoiceNumber || "Service Invoice" },
      ]}
      backLink="/service-invoices"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={() => navigate(`/service-invoices/${id}/edit`)}
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
              <CardTitle className="text-xl">{(si as any).serviceInvoiceNumber}</CardTitle>
              <Badge className={statusColors[(si as any).status] || "bg-gray-100 text-gray-700"}>
                {((si as any).status || "draft").charAt(0).toUpperCase() +
                  ((si as any).status || "draft").slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{(si as any).serviceDescription}</p>
          </CardContent>
        </Card>

        {/* Client & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Name</span>
                <span className="font-medium">{(si as any).clientName || "—"}</span>
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
                <span>{fmt((si as any).issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>{fmt((si as any).dueDate)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any, i: number) => (
                    <TableRow key={item.id || i}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{format(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{format(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(si as any).taxAmount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{format((si as any).taxAmount)}</span>
                </div>
                <Separator />
              </>
            )}
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{format((si as any).total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {(si as any).notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(si as any).notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
