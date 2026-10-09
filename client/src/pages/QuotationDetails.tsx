import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { generateDocumentHTML } from "@/lib/documentTemplate";
import type { DocumentTemplateData } from "@/lib/documentTemplate";
import { getDefaultDocumentTemplate, resolveTemplateTypeForDocument } from "@/lib/documentTemplateHelpers";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Coins,
  FileText,
  Loader2,
  Printer,
  StickyNote,
} from "lucide-react";

export default function QuotationDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { code: currencyCode } = useCurrencySettings();

  const { data: quotation, isLoading } = trpc.quotations.getById.useQuery(params.id!, {
    enabled: !!params.id,
  });
  const { data: companyInfo } = trpc.settings.getCompanyInfo.useQuery({});
  const { data: bankPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_bank" });
  const { data: mpesaPayData } = trpc.settings.getByCategory.useQuery({ category: "payment_mpesa" });
  const templateType = resolveTemplateTypeForDocument("rfq");
  const { data: docTemplatesList = [] } = trpc.documentTemplates.list.useQuery({ type: templateType });

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Quotation not found</p>
        <Button variant="outline" onClick={() => setLocation("/quotations")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quotations
        </Button>
      </div>
    );
  }

  const lineItems = Array.isArray(quotation.lineItems)
    ? quotation.lineItems as Array<{ partNumber?: string; description?: string; quantity?: number; unitPrice?: number | null; total?: number | null }>
    : [];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const defaultDocTemplate = getDefaultDocumentTemplate(docTemplatesList as any[]);
    const items: DocumentTemplateData["items"] = lineItems.map((item) => ({
      description: [item.partNumber, item.description].filter(Boolean).join(" — "),
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0) / 100,
      total: Number(item.total || 0) / 100,
    }));
    const additionalFields: Record<string, string> = {
      rfq_buyer_company_name: quotation.buyerCompanyName || "",
      rfq_buyer_department: quotation.buyerDepartment || "",
      rfq_buyer_contact_name: quotation.buyerContactName || "",
      rfq_buyer_contact_title: quotation.buyerContactTitle || "",
      rfq_buyer_email: quotation.buyerEmail || "",
      rfq_buyer_phone: quotation.buyerPhone || "",
      rfq_delivery_address: quotation.deliveryAddress || "",
      rfq_bidder_legal_name: quotation.bidderLegalName || "",
      rfq_bidder_registration_number: quotation.bidderRegistrationNumber || "",
      rfq_bidder_contact_name: quotation.bidderContactName || "",
      rfq_bidder_email: quotation.bidderEmail || "",
      rfq_bidder_phone: quotation.bidderPhone || "",
      rfq_quote_validity_days: String(quotation.quoteValidityDays ?? ""),
      rfq_valid_until: quotation.quoteValidUntil || "",
      rfq_lead_time: quotation.leadTime || "",
      rfq_submission_format: quotation.submissionFormat || "",
      rfq_submission_method: quotation.submissionMethod || "",
      rfq_submission_email: quotation.submissionEmail || "",
      rfq_email_subject_protocol: quotation.emailSubjectProtocol || "",
      rfq_mandatory_attachments: quotation.mandatoryAttachments || "",
      rfq_cost_weight: String(quotation.costWeight ?? ""),
      rfq_compliance_weight: String(quotation.complianceWeight ?? ""),
      rfq_delivery_weight: String(quotation.deliveryWeight ?? ""),
      rfq_non_binding_terms: quotation.nonBindingTerms || "",
      rfq_incoterms: quotation.incoterms || "",
      rfq_payment_terms: quotation.paymentTerms || "",
      rfq_settlement_days: String(quotation.settlementDays ?? ""),
      rfq_buyer_signatory_name: quotation.buyerSignatoryName || "",
      rfq_buyer_signatory_title: quotation.buyerSignatoryTitle || "",
      rfq_bidder_signatory_name: quotation.bidderSignatoryName || "",
      rfq_bidder_signatory_title: quotation.bidderSignatoryTitle || "",
    };
    const notes = [
      quotation.description,
      `Buyer department: ${quotation.buyerDepartment || "—"}`,
      `Buyer contact: ${quotation.buyerContactName || "—"}${quotation.buyerEmail ? ` (${quotation.buyerEmail})` : ""}`,
      `Delivery address: ${quotation.deliveryAddress || "—"}`,
      `Supplier response: ${quotation.submissionMethod || "—"}${quotation.submissionEmail ? ` to ${quotation.submissionEmail}` : ""}`,
      `Submission format: ${quotation.submissionFormat || "—"}`,
      `Mandatory attachments: ${quotation.mandatoryAttachments || "—"}`,
      `Evaluation weights: cost ${quotation.costWeight ?? 50}%, compliance ${quotation.complianceWeight ?? 30}%, delivery ${quotation.deliveryWeight ?? 20}%`,
      `Quote validity: ${quotation.quoteValidityDays ?? 60} days; lead time: ${quotation.leadTime || "—"}`,
      `Incoterms: ${quotation.incoterms || "—"}`,
      `Settlement: ${quotation.paymentTerms || "—"}`,
      `Buyer signatory: ${quotation.buyerSignatoryName || "—"}${quotation.buyerSignatoryTitle ? `, ${quotation.buyerSignatoryTitle}` : ""}`,
      `Bidder signatory: ${quotation.bidderSignatoryName || "—"}${quotation.bidderSignatoryTitle ? `, ${quotation.bidderSignatoryTitle}` : ""}`,
    ].filter(Boolean).join("\n\n");

    const html = generateDocumentHTML({
      documentType: "estimate",
      documentNumber: quotation.rfqNo || "N/A",
      documentDate: quotation.issueDate || (quotation.createdAt
        ? new Date(quotation.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]),
      dueDate: quotation.submissionDeadline || quotation.dueDate || "",
      companyName: quotation.buyerCompanyName || companyInfo?.companyName,
      companyLogo: companyInfo?.companyLogo,
      companyPhone: companyInfo?.companyPhone,
      companyEmail: companyInfo?.companyEmail,
      companyWebsite: companyInfo?.companyWebsite,
      companyAddress: companyInfo?.companyAddress,
      clientName: quotation.bidderLegalName || quotation.supplier || "Prospective supplier",
      clientEmail: quotation.bidderEmail || "",
      clientPhone: quotation.bidderPhone || "",
      clientAddress: quotation.deliveryAddress || "",
      items,
      subtotal: Number(quotation.subtotal ?? quotation.amount ?? 0) / 100,
      tax: Number(quotation.taxAmount || 0) / 100,
      total: Number(quotation.amount || 0) / 100,
      notes,
      termsAndConditions: quotation.nonBindingTerms || "",
      currency: quotation.currency || currencyCode,
      bankDetailsHtml: bankPayData?.enabled === "true" ? bankPayData?.details : undefined,
      mpesaPaybill: mpesaPayData?.enabled === "true" ? mpesaPayData?.paybillNumber : undefined,
      mpesaAccountNumber: mpesaPayData?.enabled === "true" ? mpesaPayData?.paybillNumber : undefined,
      customTemplateHtml: defaultDocTemplate?.content || undefined,
      additionalFields,
    });

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <ModuleLayout
      title={`RFQ ${quotation.rfqNo || ""}`}
      description="Request for Quotation Details"
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Procurement", href: "/procurement" },
        { label: "Quotations", href: "/quotations" },
        { label: quotation.rfqNo || "Details" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/quotations")}>
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
          <Badge className={`text-sm px-3 py-1 ${statusColors[quotation.status] || "bg-gray-100 text-gray-800"}`}>
            {quotation.status?.replace("_", " ").toUpperCase()}
          </Badge>
          {quotation.createdAt && (
            <span className="text-sm text-muted-foreground">
              Created {new Date(quotation.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* RFQ Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              RFQ Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">RFQ Number</p>
                <p className="font-medium">{quotation.rfqNo || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{quotation.supplier || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Buyer and bidder contacts</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Issuing company / department</p><p className="font-medium">{quotation.buyerCompanyName || "—"}{quotation.buyerDepartment ? ` · ${quotation.buyerDepartment}` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">Buyer contact</p><p className="font-medium">{quotation.buyerContactName || "—"}{quotation.buyerContactTitle ? ` · ${quotation.buyerContactTitle}` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">Buyer email / phone</p><p className="font-medium">{[quotation.buyerEmail, quotation.buyerPhone].filter(Boolean).join(" · ") || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Target supplier</p><p className="font-medium">{quotation.bidderLegalName || quotation.supplier || "Open solicitation"}</p></div>
            <div><p className="text-sm text-muted-foreground">Supplier registration / tax ID</p><p className="font-medium">{quotation.bidderRegistrationNumber || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Supplier contact</p><p className="font-medium">{quotation.bidderContactName || "—"}{quotation.bidderEmail ? ` · ${quotation.bidderEmail}` : ""}{quotation.bidderPhone ? ` · ${quotation.bidderPhone}` : ""}</p></div>
            <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Delivery address</p><p className="font-medium whitespace-pre-wrap">{quotation.deliveryAddress || "—"}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Schedule and scope</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">Issue date</p><p className="font-medium">{quotation.issueDate ? new Date(quotation.issueDate).toLocaleDateString() : "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Submission deadline</p><p className="font-medium">{quotation.submissionDeadline || quotation.dueDate ? new Date(quotation.submissionDeadline || quotation.dueDate!).toLocaleDateString() : "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Target delivery</p><p className="font-medium">{quotation.targetDeliveryDate ? new Date(quotation.targetDeliveryDate).toLocaleDateString() : "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Quote validity</p><p className="font-medium">{quotation.quoteValidityDays ?? 60} days{quotation.quoteValidUntil ? ` · until ${new Date(quotation.quoteValidUntil).toLocaleDateString()}` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">Lead time</p><p className="font-medium">{quotation.leadTime || "—"}</p></div>
            {quotation.description && <div className="md:col-span-3"><p className="mb-2 text-sm text-muted-foreground">Objective and scope</p><RichTextDisplay html={quotation.description} /></div>}
          </CardContent>
        </Card>

        {lineItems.length > 0 && <Card>
          <CardHeader><CardTitle className="text-base">Specifications and pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {lineItems.map((item, index) => <div key={`${item.partNumber || "item"}-${index}`} className="grid gap-2 border-b pb-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <div><p className="font-medium">{item.description || "—"}</p>{item.partNumber && <p className="text-sm text-muted-foreground">SKU: {item.partNumber}</p>}</div>
              <p className="text-sm">Qty {item.quantity ?? 0}</p>
              <p className="text-sm">{item.unitPrice == null ? "Price pending" : `${quotation.currency || currencyCode} ${(item.unitPrice / 100).toLocaleString()}`}</p>
              <p className="text-sm font-medium">{item.total == null ? "—" : `${quotation.currency || currencyCode} ${(item.total / 100).toLocaleString()}`}</p>
            </div>)}
          </CardContent>
        </Card>}

        <Card>
          <CardHeader><CardTitle className="text-base">Submission and evaluation</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Submission format / method</p><p className="font-medium">{[quotation.submissionFormat, quotation.submissionMethod].filter(Boolean).join(" · ") || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Submission email</p><p className="font-medium">{quotation.submissionEmail || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Email subject protocol</p><p className="font-medium">{quotation.emailSubjectProtocol || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Evaluation weights</p><p className="font-medium">Cost {quotation.costWeight ?? 50}% · Compliance {quotation.complianceWeight ?? 30}% · Delivery {quotation.deliveryWeight ?? 20}%</p></div>
            <div className="md:col-span-2"><p className="text-sm text-muted-foreground">Mandatory attachments</p><p className="whitespace-pre-wrap font-medium">{quotation.mandatoryAttachments || "—"}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Terms and authorized sign-off</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><p className="text-sm text-muted-foreground">Non-binding terms</p><p className="whitespace-pre-wrap">{quotation.nonBindingTerms || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Incoterms</p><p>{quotation.incoterms || "—"}</p></div>
            <div><p className="text-sm text-muted-foreground">Settlement terms</p><p className="whitespace-pre-wrap">{quotation.paymentTerms || "—"}{quotation.settlementDays != null ? ` (${quotation.settlementDays} days)` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">Buyer authorized sign-off</p><p>{quotation.buyerSignatoryName || "—"}{quotation.buyerSignatoryTitle ? ` · ${quotation.buyerSignatoryTitle}` : ""}</p></div>
            <div><p className="text-sm text-muted-foreground">Bidder authorized sign-off</p><p>{quotation.bidderSignatoryName || "—"}{quotation.bidderSignatoryTitle ? ` · ${quotation.bidderSignatoryTitle}` : ""}</p></div>
          </CardContent>
        </Card>

        {/* Financial & Schedule */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-green-600" />
              Financial & Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">
                  {quotation.currency || currencyCode} {((quotation.amount || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Due Date
                </p>
                <p className="font-medium">
                  {quotation.dueDate ? new Date(quotation.dueDate).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {quotation.description && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-orange-600" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay html={quotation.description} />
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
