import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { getDefaultDocumentTemplate, resolveTemplateTypeForDocument } from "@/lib/documentTemplateHelpers";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Package,
  Printer,
  StickyNote,
  Truck,
} from "lucide-react";

export default function DeliveryNoteDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: dn, isLoading } = trpc.deliveryNotes.getById.useQuery(params.id!, {
    enabled: !!params.id,
  });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery({});
  const { data: bankPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: mpesaPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" });
  const templateType = resolveTemplateTypeForDocument("dn");
  const { data: docTemplatesList = [] } = trpc.documentTemplates.list.useQuery({ type: templateType });

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    partial: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    in_transit: "bg-blue-100 text-blue-800",
    partially_delivered: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!dn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Delivery note not found</p>
        <Button variant="outline" onClick={() => setLocation("/delivery-notes")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Delivery Notes
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const defaultDocTemplate = getDefaultDocumentTemplate(docTemplatesList as any[]);

    const html = generateDocumentHTML({
      documentType: "estimate",
      documentNumber: dn.dnNo || "N/A",
      documentDate: dn.deliveryDate
        ? new Date(dn.deliveryDate).toISOString().split("T")[0]
        : dn.createdAt
          ? new Date(dn.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      dueDate: dn.deliveryDate ? new Date(dn.deliveryDate).toISOString().split("T")[0] : "",
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: dn.supplier || "Supplier",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: dn.notes || "",
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
      title={`DN ${dn.dnNo || ""}`}
      description="Delivery Note Details"
      icon={<Truck className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "Delivery Notes", href: "/delivery-notes" },
        { label: dn.dnNo || "Details" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/delivery-notes")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className={`text-sm px-3 py-1 ${statusColors[dn.status] || "bg-gray-100 text-gray-800"}`}>
            {dn.status?.replace(/_/g, " ").toUpperCase()}
          </Badge>
          {dn.createdAt && (
            <span className="text-sm text-muted-foreground">
              Created {new Date(dn.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Delivery Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">DN Number</p>
                <p className="font-medium">{dn.dnNo || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{dn.supplier || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{dn.orderId || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-medium">{dn.items ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              Delivery Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery Date</p>
                <p className="font-medium">
                  {dn.deliveryDate ? new Date(dn.deliveryDate).toLocaleDateString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{dn.status?.replace(/_/g, " ") || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {dn.notes && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-purple-600" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay html={dn.notes} />
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
