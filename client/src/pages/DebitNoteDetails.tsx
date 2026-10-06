import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Download, Trash2, FileMinus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import { getDefaultDocumentTemplate, resolveTemplateTypeForDocument } from "@/lib/documentTemplateHelpers";

export default function DebitNoteDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: debitNote, isLoading } = trpc.debitNotes.get.useQuery({ id: id || "" }, { enabled: !!id });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery({});
  const { data: bankPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: mpesaPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" });
  const templateType = resolveTemplateTypeForDocument("debit_note");
  const { data: docTemplatesList = [] } = trpc.documentTemplates.list.useQuery({ type: templateType });

  const deleteMutation = trpc.debitNotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Debit note deleted");
      navigate("/debit-notes");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  }

  if (!debitNote) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Debit note not found</p>
        <Button variant="outline" onClick={() => navigate("/debit-notes")}>Back to Debit Notes</Button>
      </div>
    );
  }

  const dn = debitNote as any;

  const statusColor = (status: string) =>
    status === "draft" ? "secondary" : status === "approved" ? "default" : "outline";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const defaultDocTemplate = getDefaultDocumentTemplate(docTemplatesList as any[]);

    const html = generateDocumentHTML({
      documentType: "invoice",
      documentNumber: dn.debitNoteNumber || "N/A",
      documentDate: dn.issueDate ? new Date(dn.issueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      companyName: companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: dn.supplierName || "Supplier",
      clientEmail: dn.supplierEmail || "",
      clientPhone: dn.supplierPhone || "",
      clientAddress: dn.supplierAddress || "",
      items: Array.isArray(dn.items)
        ? dn.items.map((item: any) => ({
            description: item.description || "",
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || item.rate || 0),
            total: Number(item.total || item.amount || 0),
          }))
        : [],
      subtotal: Number(dn.subtotal || dn.total || 0),
      tax: Number(dn.taxAmount || 0),
      total: Number(dn.total || 0),
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
      title={dn.debitNoteNumber || "Debit Note"}
      icon={<FileMinus className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
        { label: "Debit Notes", href: "/debit-notes" },
        { label: dn.debitNoteNumber || "Details" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/debit-notes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/debit-notes/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Delete this debit note?")) deleteMutation.mutate({ id: id! });
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Debit Note Details</CardTitle>
              <Badge variant={statusColor(dn.status)}>{dn.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Debit Note Number</p>
                <p className="font-semibold">{dn.debitNoteNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-semibold">{dn.issueDate ? new Date(dn.issueDate).toLocaleDateString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier</p>
                <p className="font-semibold">{dn.supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="font-semibold capitalize">{(dn.reason || "").replace(/-/g, " ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {dn.items && dn.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
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
                  {dn.items.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell><RichTextDisplay html={item.description} className="text-sm" /></TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">KES {Number(item.unitPrice).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">KES {Number(item.total).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="text-right text-lg font-bold">
                Total: KES {Number(dn.total).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}

        {dn.notes && (
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <RichTextDisplay html={dn.notes} className="text-sm text-muted-foreground" />
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
