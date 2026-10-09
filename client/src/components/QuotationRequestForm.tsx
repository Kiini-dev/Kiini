import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type QuotationLineItemForm = {
  partNumber: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type QuotationFormValues = {
  rfqNo: string;
  supplier: string;
  amount: string;
  dueDate: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  description: string;
  buyerCompanyName: string;
  buyerDepartment: string;
  buyerContactName: string;
  buyerContactTitle: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  issueDate: string;
  targetDeliveryDate: string;
  bidderLegalName: string;
  bidderRegistrationNumber: string;
  bidderContactName: string;
  bidderEmail: string;
  bidderPhone: string;
  quoteValidityDays: string;
  quoteValidUntil: string;
  leadTime: string;
  lineItems: QuotationLineItemForm[];
  currency: string;
  taxRate: string;
  shippingAmount: string;
  submissionFormat: string;
  submissionMethod: string;
  submissionEmail: string;
  emailSubjectProtocol: string;
  mandatoryAttachments: string;
  costWeight: string;
  complianceWeight: string;
  deliveryWeight: string;
  nonBindingTerms: string;
  incoterms: string;
  paymentTerms: string;
  settlementDays: string;
  buyerSignatoryName: string;
  buyerSignatoryTitle: string;
  bidderSignatoryName: string;
  bidderSignatoryTitle: string;
};

function dateInputValue(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toISOString().slice(0, 10);
}

export function createEmptyQuotationForm(): QuotationFormValues {
  const today = new Date();
  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + 14);
  return {
    rfqNo: "",
    supplier: "",
    amount: "",
    dueDate: deadline.toISOString().slice(0, 10),
    status: "draft",
    description: "",
    buyerCompanyName: "",
    buyerDepartment: "Procurement / Supply Chain Management",
    buyerContactName: "",
    buyerContactTitle: "",
    buyerEmail: "",
    buyerPhone: "",
    deliveryAddress: "",
    issueDate: today.toISOString().slice(0, 10),
    targetDeliveryDate: "",
    bidderLegalName: "",
    bidderRegistrationNumber: "",
    bidderContactName: "",
    bidderEmail: "",
    bidderPhone: "",
    quoteValidityDays: "60",
    quoteValidUntil: "",
    leadTime: "",
    lineItems: [{ partNumber: "", description: "", quantity: "1", unitPrice: "" }],
    currency: "KES",
    taxRate: "0",
    shippingAmount: "",
    submissionFormat: "PDF / Excel",
    submissionMethod: "Email",
    submissionEmail: "",
    emailSubjectProtocol: "",
    mandatoryAttachments: "",
    costWeight: "50",
    complianceWeight: "30",
    deliveryWeight: "20",
    nonBindingTerms: "This RFQ is an invitation to treat and does not constitute a binding purchase order or contract. The buyer reserves the right to accept or reject any bid in whole or in part.",
    incoterms: "DDP - Delivered Duty Paid",
    paymentTerms: "Net 30 days following official delivery confirmation and error-free invoice processing.",
    settlementDays: "30",
    buyerSignatoryName: "",
    buyerSignatoryTitle: "",
    bidderSignatoryName: "",
    bidderSignatoryTitle: "",
  };
}

export function quotationToForm(source: object): QuotationFormValues {
  const quotation = source as Record<string, unknown>;
  const initial = createEmptyQuotationForm();
  const storedItems = Array.isArray(quotation.lineItems) ? quotation.lineItems as Array<Record<string, unknown>> : [];
  return {
    ...initial,
    rfqNo: String(quotation.rfqNo || ""),
    supplier: String(quotation.supplier || ""),
    amount: quotation.amount == null ? "" : (Number(quotation.amount) / 100).toString(),
    dueDate: dateInputValue(quotation.submissionDeadline || quotation.dueDate) || initial.dueDate,
    status: (quotation.status as QuotationFormValues["status"]) || "draft",
    description: String(quotation.description || ""),
    buyerCompanyName: String(quotation.buyerCompanyName || ""),
    buyerDepartment: String(quotation.buyerDepartment || initial.buyerDepartment),
    buyerContactName: String(quotation.buyerContactName || ""),
    buyerContactTitle: String(quotation.buyerContactTitle || ""),
    buyerEmail: String(quotation.buyerEmail || ""),
    buyerPhone: String(quotation.buyerPhone || ""),
    deliveryAddress: String(quotation.deliveryAddress || ""),
    issueDate: dateInputValue(quotation.issueDate) || initial.issueDate,
    targetDeliveryDate: dateInputValue(quotation.targetDeliveryDate),
    bidderLegalName: String(quotation.bidderLegalName || ""),
    bidderRegistrationNumber: String(quotation.bidderRegistrationNumber || ""),
    bidderContactName: String(quotation.bidderContactName || ""),
    bidderEmail: String(quotation.bidderEmail || ""),
    bidderPhone: String(quotation.bidderPhone || ""),
    quoteValidityDays: String(quotation.quoteValidityDays ?? initial.quoteValidityDays),
    quoteValidUntil: dateInputValue(quotation.quoteValidUntil),
    leadTime: String(quotation.leadTime || ""),
    lineItems: storedItems.length ? storedItems.map((item) => ({
      partNumber: String(item.partNumber || ""),
      description: String(item.description || ""),
      quantity: String(item.quantity ?? 1),
      unitPrice: item.unitPrice == null ? "" : (Number(item.unitPrice) / 100).toString(),
    })) : initial.lineItems,
    currency: String(quotation.currency || initial.currency),
    taxRate: String(quotation.taxRate ?? initial.taxRate),
    shippingAmount: quotation.shippingAmount == null ? "" : (Number(quotation.shippingAmount) / 100).toString(),
    submissionFormat: String(quotation.submissionFormat || initial.submissionFormat),
    submissionMethod: String(quotation.submissionMethod || initial.submissionMethod),
    submissionEmail: String(quotation.submissionEmail || ""),
    emailSubjectProtocol: String(quotation.emailSubjectProtocol || ""),
    mandatoryAttachments: String(quotation.mandatoryAttachments || ""),
    costWeight: String(quotation.costWeight ?? initial.costWeight),
    complianceWeight: String(quotation.complianceWeight ?? initial.complianceWeight),
    deliveryWeight: String(quotation.deliveryWeight ?? initial.deliveryWeight),
    nonBindingTerms: String(quotation.nonBindingTerms || initial.nonBindingTerms),
    incoterms: String(quotation.incoterms || initial.incoterms),
    paymentTerms: String(quotation.paymentTerms || initial.paymentTerms),
    settlementDays: String(quotation.settlementDays ?? initial.settlementDays),
    buyerSignatoryName: String(quotation.buyerSignatoryName || ""),
    buyerSignatoryTitle: String(quotation.buyerSignatoryTitle || ""),
    bidderSignatoryName: String(quotation.bidderSignatoryName || ""),
    bidderSignatoryTitle: String(quotation.bidderSignatoryTitle || ""),
  };
}

export function quotationFormPayload(form: QuotationFormValues) {
  return {
    rfqNo: form.rfqNo.trim(),
    supplier: form.supplier.trim(),
    amount: Number(form.amount) || 0,
    dueDate: form.dueDate,
    status: form.status,
    description: form.description,
    buyerCompanyName: form.buyerCompanyName.trim(),
    buyerDepartment: form.buyerDepartment,
    buyerContactName: form.buyerContactName,
    buyerContactTitle: form.buyerContactTitle,
    buyerEmail: form.buyerEmail,
    buyerPhone: form.buyerPhone,
    deliveryAddress: form.deliveryAddress,
    issueDate: form.issueDate,
    submissionDeadline: form.dueDate,
    targetDeliveryDate: form.targetDeliveryDate,
    bidderLegalName: form.bidderLegalName,
    bidderRegistrationNumber: form.bidderRegistrationNumber,
    bidderContactName: form.bidderContactName,
    bidderEmail: form.bidderEmail,
    bidderPhone: form.bidderPhone,
    quoteValidityDays: Number(form.quoteValidityDays) || 60,
    quoteValidUntil: form.quoteValidUntil,
    leadTime: form.leadTime,
    lineItems: form.lineItems
      .filter((item) => item.description.trim())
      .map((item) => ({
        partNumber: item.partNumber.trim() || undefined,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 0,
        unitPrice: item.unitPrice === "" ? undefined : Number(item.unitPrice),
      })),
    currency: form.currency.toUpperCase(),
    taxRate: Number(form.taxRate) || 0,
    shippingAmount: Number(form.shippingAmount) || 0,
    submissionFormat: form.submissionFormat,
    submissionMethod: form.submissionMethod,
    submissionEmail: form.submissionEmail,
    emailSubjectProtocol: form.emailSubjectProtocol,
    mandatoryAttachments: form.mandatoryAttachments,
    costWeight: Number(form.costWeight) || 0,
    complianceWeight: Number(form.complianceWeight) || 0,
    deliveryWeight: Number(form.deliveryWeight) || 0,
    nonBindingTerms: form.nonBindingTerms,
    incoterms: form.incoterms,
    paymentTerms: form.paymentTerms,
    settlementDays: Number(form.settlementDays) || undefined,
    buyerSignatoryName: form.buyerSignatoryName,
    buyerSignatoryTitle: form.buyerSignatoryTitle,
    bidderSignatoryName: form.bidderSignatoryName,
    bidderSignatoryTitle: form.bidderSignatoryTitle,
  };
}

type TextField = Exclude<keyof QuotationFormValues, "status" | "lineItems">;

export function QuotationRequestForm({
  form,
  setForm,
}: {
  form: QuotationFormValues;
  setForm: Dispatch<SetStateAction<QuotationFormValues>>;
}) {
  const setValue = (key: TextField, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateItem = (index: number, key: keyof QuotationLineItemForm, value: string) => setForm((current) => ({
    ...current,
    lineItems: current.lineItems.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
  }));
  const subtotal = form.lineItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);
  const tax = subtotal * (Number(form.taxRate) || 0) / 100;
  const grandTotal = subtotal + tax + (Number(form.shippingAmount) || 0);
  const formatMoney = (value: number) => new Intl.NumberFormat("en", {
    style: "currency",
    currency: form.currency || "KES",
    minimumFractionDigits: 2,
  }).format(value);

  return (
    <div className="max-h-[72vh] space-y-5 overflow-y-auto pr-1">
      <Card>
        <CardHeader><CardTitle className="text-base">Buyer and issuing party</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Company name *"><Input value={form.buyerCompanyName} onChange={(event) => setValue("buyerCompanyName", event.target.value)} /></Field>
          <Field label="Department"><Input value={form.buyerDepartment} onChange={(event) => setValue("buyerDepartment", event.target.value)} /></Field>
          <Field label="Primary contact"><Input value={form.buyerContactName} onChange={(event) => setValue("buyerContactName", event.target.value)} /></Field>
          <Field label="Contact title"><Input value={form.buyerContactTitle} onChange={(event) => setValue("buyerContactTitle", event.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={form.buyerEmail} onChange={(event) => setValue("buyerEmail", event.target.value)} /></Field>
          <Field label="Phone"><Input value={form.buyerPhone} onChange={(event) => setValue("buyerPhone", event.target.value)} /></Field>
          <Field label="Physical delivery address" className="md:col-span-2"><Textarea value={form.deliveryAddress} onChange={(event) => setValue("deliveryAddress", event.target.value)} rows={2} /></Field>
          <Field label="RFQ reference"><Input value={form.rfqNo} onChange={(event) => setValue("rfqNo", event.target.value)} placeholder="Generated if left blank" /></Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(status: QuotationFormValues["status"]) => setForm((current) => ({ ...current, status }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Schedule and project scope</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="Issue date"><Input type="date" value={form.issueDate} onChange={(event) => setValue("issueDate", event.target.value)} /></Field>
          <Field label="Submission deadline"><Input type="date" value={form.dueDate} onChange={(event) => setValue("dueDate", event.target.value)} /></Field>
          <Field label="Target delivery date"><Input type="date" value={form.targetDeliveryDate} onChange={(event) => setValue("targetDeliveryDate", event.target.value)} /></Field>
          <Field label="Objective and scope overview" className="md:col-span-3"><Textarea value={form.description} onChange={(event) => setValue("description", event.target.value)} rows={4} placeholder="Summarize project goals, context, and scope." /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Bidder and supplier response</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Target supplier (optional)"><Input value={form.supplier} onChange={(event) => setValue("supplier", event.target.value)} placeholder="Leave blank for an open solicitation" /></Field>
          <Field label="Legal business name"><Input value={form.bidderLegalName} onChange={(event) => setValue("bidderLegalName", event.target.value)} /></Field>
          <Field label="Company registration / tax ID"><Input value={form.bidderRegistrationNumber} onChange={(event) => setValue("bidderRegistrationNumber", event.target.value)} /></Field>
          <Field label="Authorized point of contact"><Input value={form.bidderContactName} onChange={(event) => setValue("bidderContactName", event.target.value)} /></Field>
          <Field label="Bidder email"><Input type="email" value={form.bidderEmail} onChange={(event) => setValue("bidderEmail", event.target.value)} /></Field>
          <Field label="Bidder phone"><Input value={form.bidderPhone} onChange={(event) => setValue("bidderPhone", event.target.value)} /></Field>
          <Field label="Minimum quote validity (days)"><Input type="number" min="1" value={form.quoteValidityDays} onChange={(event) => setValue("quoteValidityDays", event.target.value)} /></Field>
          <Field label="Quote valid until"><Input type="date" value={form.quoteValidUntil} onChange={(event) => setValue("quoteValidUntil", event.target.value)} /></Field>
          <Field label="Guaranteed lead time / delivery window" className="md:col-span-2"><Input value={form.leadTime} onChange={(event) => setValue("leadTime", event.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Specifications and pricing</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {form.lineItems.map((item, index) => (
            <div key={index} className="grid items-end gap-3 border-b pb-4 md:grid-cols-[140px_1fr_90px_150px_auto]">
              <Field label="Part number / SKU"><Input value={item.partNumber} onChange={(event) => updateItem(index, "partNumber", event.target.value)} /></Field>
              <Field label="Item description and technical specifications *"><Input value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} /></Field>
              <Field label="Quantity"><Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} /></Field>
              <Field label={`Unit price excl. tax (${form.currency})`}><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} placeholder="Vendor quote" /></Field>
              <Button type="button" variant="ghost" aria-label={`Remove item ${index + 1}`} disabled={form.lineItems.length === 1} onClick={() => setForm((current) => ({ ...current, lineItems: current.lineItems.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setForm((current) => ({ ...current, lineItems: [...current.lineItems, { partNumber: "", description: "", quantity: "1", unitPrice: "" }] }))}><Plus className="mr-2 h-4 w-4" />Add item</Button>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Currency code"><Input maxLength={3} value={form.currency} onChange={(event) => setValue("currency", event.target.value.toUpperCase())} /></Field>
            <Field label="Tax / VAT rate (%)"><Input type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(event) => setValue("taxRate", event.target.value)} /></Field>
            <Field label={`Shipping & handling (${form.currency})`}><Input type="number" min="0" step="0.01" value={form.shippingAmount} onChange={(event) => setValue("shippingAmount", event.target.value)} /></Field>
            <div className="space-y-2"><Label>Grand total</Label><div className="rounded-md border px-3 py-2 font-semibold">{formatMoney(grandTotal)}</div></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Submission and evaluation</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Submission format"><Input value={form.submissionFormat} onChange={(event) => setValue("submissionFormat", event.target.value)} /></Field>
          <Field label="Submission method"><Input value={form.submissionMethod} onChange={(event) => setValue("submissionMethod", event.target.value)} /></Field>
          <Field label="Submission email"><Input type="email" value={form.submissionEmail} onChange={(event) => setValue("submissionEmail", event.target.value)} /></Field>
          <Field label="Email subject protocol"><Input value={form.emailSubjectProtocol} onChange={(event) => setValue("emailSubjectProtocol", event.target.value)} placeholder="Response to RFQ: [RFQ reference] - [Vendor name]" /></Field>
          <Field label="Mandatory attachments" className="md:col-span-2"><Textarea value={form.mandatoryAttachments} onChange={(event) => setValue("mandatoryAttachments", event.target.value)} rows={3} placeholder="List required compliance and commercial documents." /></Field>
          <Field label="Total cost weight (%)"><Input type="number" min="0" max="100" value={form.costWeight} onChange={(event) => setValue("costWeight", event.target.value)} /></Field>
          <Field label="Technical compliance weight (%)"><Input type="number" min="0" max="100" value={form.complianceWeight} onChange={(event) => setValue("complianceWeight", event.target.value)} /></Field>
          <Field label="Lead time / delivery weight (%)"><Input type="number" min="0" max="100" value={form.deliveryWeight} onChange={(event) => setValue("deliveryWeight", event.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Terms and authorized sign-off</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Non-binding solicitation terms" className="md:col-span-2"><Textarea value={form.nonBindingTerms} onChange={(event) => setValue("nonBindingTerms", event.target.value)} rows={3} /></Field>
          <Field label="Incoterms 2020"><Input value={form.incoterms} onChange={(event) => setValue("incoterms", event.target.value)} /></Field>
          <Field label="Settlement period (days)"><Input type="number" min="0" value={form.settlementDays} onChange={(event) => setValue("settlementDays", event.target.value)} /></Field>
          <Field label="Settlement terms" className="md:col-span-2"><Textarea value={form.paymentTerms} onChange={(event) => setValue("paymentTerms", event.target.value)} rows={3} /></Field>
          <Field label="Buyer authorized name"><Input value={form.buyerSignatoryName} onChange={(event) => setValue("buyerSignatoryName", event.target.value)} /></Field>
          <Field label="Buyer printed title"><Input value={form.buyerSignatoryTitle} onChange={(event) => setValue("buyerSignatoryTitle", event.target.value)} /></Field>
          <Field label="Bidder authorized name"><Input value={form.bidderSignatoryName} onChange={(event) => setValue("bidderSignatoryName", event.target.value)} /></Field>
          <Field label="Bidder printed title"><Input value={form.bidderSignatoryTitle} onChange={(event) => setValue("bidderSignatoryTitle", event.target.value)} /></Field>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <div className={`space-y-2 ${className || ""}`}><Label>{label}</Label>{children}</div>;
}
