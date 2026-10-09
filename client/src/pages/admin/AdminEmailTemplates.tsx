import React, { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import EmailBlockEditor from "@/components/EmailBlockEditor";
import HTMLEditor from "@/components/HTMLEditor";
import { Mail, Plus, Edit2, Trash2, Copy, Eye, EyeOff, ArrowLeft, Search, Variable, Paperclip, X, Code } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { designEmailTemplateBody } from "@/lib/emailTemplateDesign";
import { Spinner } from "@/components/ui/spinner";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  htmlBody?: string;
  category?: string;
  variables?: string[];
  attachments?: { type: string; label: string }[];
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean;
  isSystem?: boolean;
}

function PageShell({
  embedded,
  title,
  description,
  breadcrumbs,
  children,
}: {
  embedded: boolean;
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}) {
  return embedded ? <>{children}</> : (
    <ModuleLayout title={title} description={description} icon={<Mail className="h-5 w-5" />} breadcrumbs={breadcrumbs}>
      {children}
    </ModuleLayout>
  );
}

const TEMPLATE_CATEGORIES = [
  "alert", "estimate", "estimate_created", "estimate_expired", "estimate_expiring", "general", "hr",
  "invoice", "invoice_created", "invoice_overdue", "invoice_reminder_1d", "invoice_reminder_3d",
  "invoice_reminder_5d", "invoice_reminder_7d", "invoice_suspension", "invoice-receipt-email", "notification",
  "password-reset", "payment", "payment_failed", "payment_received", "payment_refunded", "payroll",
  "project_update", "proposal", "proposal_expired", "proposal_expiring", "proposal_sent", "receipt", "reminder",
  "ticket", "ticket_created", "ticket_reminder", "ticket_resolved", "ticket_updated", "welcome", "payslip",
];

const CATEGORY_COLORS: Record<string, string> = {
  invoice: "bg-blue-50 text-blue-700",
  proposal: "bg-purple-50 text-purple-700",
  contract: "bg-green-50 text-green-700",
  receipt: "bg-amber-50 text-amber-700",
  payment: "bg-emerald-50 text-emerald-700",
  estimate: "bg-cyan-50 text-cyan-700",
  notification: "bg-orange-50 text-orange-700",
  general: "bg-gray-50 text-gray-700",
};

// Template and general variables (modeled after Kiini: One Hub. Total Control)
const TEMPLATE_VARIABLES = [
  { label: "Client Name", value: "{{client_name}}" },
  { label: "Client Email", value: "{{client_email}}" },
  { label: "Client Phone", value: "{{client_phone}}" },
  { label: "Client Address", value: "{{client_address}}" },
  { label: "Invoice Number", value: "{{invoice_number}}" },
  { label: "Invoice Amount", value: "{{invoice_amount}}" },
  { label: "Invoice Due Date", value: "{{invoice_due_date}}" },
  { label: "Proposal Number", value: "{{proposal_number}}" },
  { label: "Contract ID", value: "{{contract_id}}" },
  { label: "Receipt Number", value: "{{receipt_number}}" },
  { label: "Payment Amount", value: "{{payment_amount}}" },
  { label: "Payment Date", value: "{{payment_date}}" },
  { label: "Payment Method", value: "{{payment_method}}" },
  { label: "Project Name", value: "{{project_name}}" },
  { label: "Valid Until", value: "{{valid_until}}" },
  { label: "Reference Number", value: "{{reference_number}}" },
  { label: "Pay Period", value: "{{pay_period}}" },
  { label: "Pay Date", value: "{{pay_date}}" },
  { label: "Employee Name", value: "{{employee_name}}" },
  { label: "Basic Salary", value: "{{basic_salary}}" },
  { label: "Allowances", value: "{{allowances}}" },
  { label: "Gross Salary", value: "{{gross_salary}}" },
  { label: "Total Deductions", value: "{{total_deductions}}" },
  { label: "Net Salary", value: "{{net_salary}}" },
];

const GENERAL_VARIABLES = [
  { label: "Company Name", value: "{{company_name}}" },
  { label: "Company Email", value: "{{company_email}}" },
  { label: "Company Phone", value: "{{company_phone}}" },
  { label: "Company Address", value: "{{company_address}}" },
  { label: "Today's Date", value: "{{todays_date}}" },
  { label: "Email Signature", value: "{{email_signature}}" },
  { label: "Email Footer", value: "{{email_footer}}" },
  { label: "Dashboard URL", value: "{{dashboard_url}}" },
  { label: "Logo URL", value: "{{logo_url}}" },
  { label: "App Logo", value: "{{app_logo}}" },
];

const DOCUMENT_TOKEN_NAMES = [
  "company_tagline", "company_website", "company_logo", "app_logo", "company_pin", "company_kra_pin", "company_tax_number",
  "client_company", "client_kra_pin", "client_tax_number", "supplier_name", "supplier_company", "supplier_email", "supplier_phone", "supplier_address", "supplier_registration",
  "document_number", "document_date", "issue_date", "due_date", "subtotal", "sub_total", "tax", "tax_rate", "tax_amount", "total", "total_amount", "currency", "notes", "terms", "terms_and_conditions",
  "items_table", "line_items_table", "items_rows", "line_items_rows", "items_html", "line_items_html", "payment_reference", "payment_instructions", "payment_details", "reference_invoice", "reference_po", "payment_terms", "kra_pin", "authorized_by",
  "delivery_address", "delivery_location", "pickup_address", "bank_name", "bank_account", "account_name", "amount", "amount_due", "balance_due", "date", "dd_mm_yyyy", "contact_name", "contact_phone", "phone", "phone_number", "location", "priority",
  "receiver_name", "receiver_company", "receiver_phone", "receiving_contact", "consignor_name", "consignor_company", "consignor_phone", "vendor_name", "vendor_company", "vendor_address", "vendor_phone", "vendor_email",
  "employee_email", "employee_id", "manager_name", "department_name", "job_title", "approved_by", "approver_name_signature", "hr_email", "hr_phone", "hr_extension",
  "description", "work_description", "work_type", "business_purpose_description", "total_expenses", "travel_activity_location", "advance_deduction", "category", "remarks", "response_deadline", "service_location", "service_start_date", "service_end_date",
  "asset_description", "asset_category", "asset_condition", "asset_cost", "equipment", "materials_cost", "labor_cost", "budget_range", "purchase_date", "serial_number", "claim_status", "claim_number", "claim_date", "credit_reason", "debit_reason",
  "payment_method", "reference_number", "claim_terms", "status", "item_count", "total_items",
  ...Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;
    return ["description", "quantity", "qty", "rate", "unit_price", "amount", "total", "tax_rate", "tax_amount", "line_number"].map(field => `item_${number}_${field}`);
  }).flat(),
];

const DOCUMENT_VARIABLES = [...new Set(DOCUMENT_TOKEN_NAMES)].map(name => ({
  label: name.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase()),
  value: `{{${name}}}`,
}));

const ALL_VARIABLES = [
  ...TEMPLATE_VARIABLES.map(v => ({ ...v, group: "Template Variables" })),
  ...GENERAL_VARIABLES.map(v => ({ ...v, group: "General Variables" })),
  ...DOCUMENT_VARIABLES.map(v => ({ ...v, group: "Document Variables" })),
];

// Attachment types that can be auto-attached to emails
const ATTACHMENT_TYPES = [
  { type: "invoice_pdf", label: "Invoice PDF", category: "invoice" },
  { type: "estimate_pdf", label: "Estimate PDF", category: "estimate" },
  { type: "proposal_pdf", label: "Proposal PDF", category: "proposal" },
  { type: "receipt_pdf", label: "Receipt PDF", category: "receipt" },
  { type: "contract_pdf", label: "Contract PDF", category: "contract" },
  { type: "quotation_pdf", label: "Quotation PDF", category: "general" },
  { type: "purchase_order_pdf", label: "Purchase Order PDF", category: "general" },
  { type: "credit_note_pdf", label: "Credit Note PDF", category: "general" },
  { type: "debit_note_pdf", label: "Debit Note PDF", category: "general" },
  { type: "payment_receipt_pdf", label: "Payment Receipt PDF", category: "payment" },
  { type: "statement_pdf", label: "Statement PDF", category: "general" },
  { type: "custom_file", label: "Custom File Upload", category: "general" },
];

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "invoice-default",
    name: "Invoice - Default",
    subject: "Invoice {{invoice_number}} from {{company_name}}",
    body: "<p>Dear {{client_name}},</p><p>Please find attached your invoice <strong>{{invoice_number}}</strong>.</p><p>Amount Due: <strong>{{invoice_amount}}</strong><br>Due Date: {{invoice_due_date}}</p><p>Thank you for your business!</p><p>{{email_signature}}</p>",
    category: "invoice",
    variables: ["{{client_name}}", "{{invoice_number}}", "{{invoice_amount}}", "{{invoice_due_date}}", "{{company_name}}"],
    createdAt: "2025-01-15",
    isDefault: true,
  },
  {
    id: "proposal-default",
    name: "Proposal - Default",
    subject: "Proposal {{proposal_number}} - {{project_name}}",
    body: "<p>Dear {{client_name}},</p><p>We are pleased to submit our proposal for <strong>{{project_name}}</strong>.</p><p>Proposal Value: <strong>{{payment_amount}}</strong><br>Valid Until: {{valid_until}}</p><p>Please review and let us know if you have any questions.</p><p>{{email_signature}}</p>",
    category: "proposal",
    variables: ["{{client_name}}", "{{proposal_number}}", "{{project_name}}", "{{payment_amount}}", "{{valid_until}}"],
    createdAt: "2025-01-20",
    isDefault: true,
  },
  {
    id: "payment-confirmation",
    name: "Payment - Confirmation",
    subject: "Payment Received - {{reference_number}}",
    body: "<p>Dear {{client_name}},</p><p>We have received your payment of <strong>{{payment_amount}}</strong> on {{payment_date}}.</p><p>Reference: {{reference_number}}<br>Payment Method: {{payment_method}}</p><p>Thank you!</p><p>{{email_signature}}</p>",
    category: "payment",
    variables: ["{{client_name}}", "{{payment_amount}}", "{{payment_date}}", "{{reference_number}}", "{{payment_method}}"],
    createdAt: "2025-02-01",
  },
  {
    id: "contract-default",
    name: "Contract - New Contract",
    subject: "Contract {{contract_id}} - {{project_name}}",
    body: "<p>Dear {{client_name}},</p><p>Please find details regarding your contract <strong>{{contract_id}}</strong> for {{project_name}}.</p><p>{{email_signature}}</p>",
    category: "contract",
    variables: ["{{client_name}}", "{{contract_id}}", "{{project_name}}"],
    createdAt: "2025-02-10",
  },
  {
    id: "receipt-default",
    name: "Receipt - Default",
    subject: "Receipt {{receipt_number}}",
    body: "<p>Dear {{client_name}},</p><p>Here is your receipt <strong>{{receipt_number}}</strong> for a payment of {{payment_amount}} received on {{payment_date}}.</p><p>Thank you!</p><p>{{email_signature}}</p>",
    category: "receipt",
    variables: ["{{client_name}}", "{{receipt_number}}", "{{payment_amount}}", "{{payment_date}}"],
    createdAt: "2025-02-15",
  },
];

export default function AdminEmailTemplates({ embedded = false }: { embedded?: boolean }) {
  const utils = trpc.useUtils();
  const templateColumns: ColumnConfig[] = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "subject", label: "Subject" },
    { key: "variables", label: "Variables" },
    { key: "attachments", label: "Attachments" },
    { key: "createdAt", label: "Created" },
  ];
  const { visibleColumns, toggleColumn, isVisible, pageSize: columnPageSize, updatePageSize, reset } = useColumnVisibility(templateColumns, "emailTemplates");
  const { page, pageSize, setPage, setPageSize, paginate, resetPage } = usePagination(25);
  useEffect(() => {
    setPageSize(columnPageSize);
  }, [columnPageSize]);

  const { data: templates = [], isLoading } = trpc.emailTemplates.list.useQuery();
  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: () => { utils.emailTemplates.list.invalidate(); toast.success("Template created"); setView("list"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => { utils.emailTemplates.list.invalidate(); toast.success("Template updated"); setView("list"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => { utils.emailTemplates.list.invalidate(); toast.success("Template deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.emailTemplates.duplicate.useMutation({
    onSuccess: () => { utils.emailTemplates.list.invalidate(); toast.success("Template duplicated"); },
    onError: (e) => toast.error(e.message),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [view, setView] = useState<"list" | "builder">("list");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState<EmailTemplate>({
    id: "", name: "", subject: "", body: "", htmlBody: "", category: "general", variables: [], attachments: [],
  });
  const [editorMode, setEditorMode] = useState<"block" | "html" | "richtext">("richtext");

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const pagedTemplates = paginate(filteredTemplates);

  const openBuilder = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setForm(template);
    } else {
      setEditingTemplate(null);
      setForm({ id: `template-${Date.now()}`, name: "", subject: "", body: "", htmlBody: "", category: "general", variables: [], attachments: [] });
    }
    setView("builder");
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim()) {
      toast.error("Please fill in template name and subject");
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, name: form.name, subject: form.subject, body: form.body, htmlBody: form.htmlBody, category: form.category, variables: form.variables, attachments: form.attachments });
    } else {
      createMutation.mutate({ name: form.name, subject: form.subject, body: form.body, htmlBody: form.htmlBody, category: form.category, variables: form.variables, attachments: form.attachments });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (template: EmailTemplate) => {
    duplicateMutation.mutate(template.id);
  };

  // Auto-detect variables from body
  const detectVariables = (body: string) => {
    const matches = body.match(/\{\{[a-z_]+\}\}/g) || [];
    return [...new Set(matches)];
  };

  // Replace variables with sample data for preview
  const getPreviewHtml = (template: EmailTemplate) => {
    const sampleData: Record<string, string> = {
      "{{client_name}}": "John Doe",
      "{{client_email}}": "john@example.com",
      "{{client_phone}}": "+254 700 123 456",
      "{{client_address}}": "123 Main St, Nairobi",
      "{{invoice_number}}": "INV-2025-001",
      "{{invoice_amount}}": "KES 150,000",
      "{{invoice_due_date}}": "2025-04-30",
      "{{proposal_number}}": "PROP-2025-001",
      "{{contract_id}}": "CON-2025-001",
      "{{receipt_number}}": "RCT-2025-001",
      "{{payment_amount}}": "KES 150,000",
      "{{payment_date}}": "2025-04-12",
      "{{payment_method}}": "Bank Transfer",
      "{{project_name}}": "Website Redesign",
      "{{valid_until}}": "2025-05-15",
      "{{reference_number}}": "REF-2025-001",
      "{{company_name}}": "Kiini",
      "{{company_email}}": "info@kiini.africa",
      "{{company_phone}}": "+254 700 000 000",
      "{{company_address}}": "456 Tech Plaza, Nairobi",
      "{{todays_date}}": new Date().toLocaleDateString(),
      "{{email_signature}}": "<strong>Best Regards,</strong><br>Kiini Team",
      "{{email_footer}}": "© 2025 Kiini. All rights reserved.",
      "{{dashboard_url}}": "https://crm.kiini.africa",
      "{{logo_url}}": "",
      "{{app_logo}}": "",
    };
    let html = template.htmlBody || template.body;
    Object.entries(sampleData).forEach(([k, v]) => { html = html.replace(new RegExp(k.replace(/[{}]/g, "\\$&"), "g"), v); });
    return html;
  };

  // Visual Builder view
  if (view === "builder") {
    return (
      <PageShell
        embedded={embedded}
        title={editingTemplate ? "Edit Email Template" : "Create Email Template"}
        description="Design your HTML email template with the visual builder"
        breadcrumbs={[
          { label: "Dashboard", href: "/crm/super-admin" },
          { label: "Administration", href: "/admin/management" },
          { label: "Email Templates", href: "/admin/email-templates" },
          { label: editingTemplate ? "Edit" : "New Template" },
        ]}
      >
        <div className="space-y-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Templates
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewTemplate(form)}>
                <Eye className="h-4 w-4 mr-2" />Preview
              </Button>
              <Button onClick={handleSave}>
                {editingTemplate ? "Update" : "Create"} Template
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            {/* Left: Builder */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name *</Label>
                      <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Invoice - Standard" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select value={form.category || "general"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm bg-background">
                        {TEMPLATE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Invoice {{invoice_number}} from {{company_name}}" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Email Body</CardTitle>
                  <CardDescription>Choose your preferred editor: Email blocks for visual design, HTML for raw code, or Rich Text for formatting.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={editorMode} onValueChange={(val) => setEditorMode(val as "block" | "html" | "richtext")} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="richtext" className="flex gap-2">
                        <Mail className="h-4 w-4" />
                        Rich Text
                      </TabsTrigger>
                      <TabsTrigger value="block" className="flex gap-2">
                        <Code className="h-4 w-4" />
                        Blocks
                      </TabsTrigger>
                      <TabsTrigger value="html" className="flex gap-2">
                        <Code className="h-4 w-4" />
                        HTML
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="richtext" className="mt-4">
                      <RichTextEditor
                        value={form.htmlBody || form.body}
                        onChange={val => {
                          const vars = detectVariables(val);
                          setForm(p => ({ ...p, body: val, htmlBody: val, variables: vars }));
                        }}
                        placeholder="Design your email template here..."
                        minHeight="400px"
                        enhanced
                        variables={ALL_VARIABLES}
                      />
                    </TabsContent>

                    <TabsContent value="block" className="mt-4">
                      <EmailBlockEditor
                        value={form.htmlBody || form.body}
                        onChange={val => {
                          const vars = detectVariables(val);
                          setForm(p => ({ ...p, body: val, htmlBody: val, variables: vars }));
                        }}
                        placeholder="Design your email template using blocks..."
                        minHeight="400px"
                        variables={ALL_VARIABLES}
                      />
                    </TabsContent>

                    <TabsContent value="html" className="mt-4">
                      <HTMLEditor
                        value={form.htmlBody || form.body}
                        onChange={val => {
                          const vars = detectVariables(val);
                          setForm(p => ({ ...p, body: val, htmlBody: val, variables: vars }));
                        }}
                        placeholder="Enter HTML email template..."
                        minHeight="400px"
                        height="500px"
                        variables={ALL_VARIABLES}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Paperclip className="h-4 w-4" /> Email Attachments
                  </CardTitle>
                  <CardDescription>Select documents to auto-attach when this email is sent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Current attachments */}
                  {form.attachments && form.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.attachments.map((att, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs flex items-center gap-1 py-1 px-2">
                          <Paperclip className="h-3 w-3" />
                          {att.label}
                          <button type="button" onClick={() => setForm(p => ({ ...p, attachments: p.attachments?.filter((_, i) => i !== idx) || [] }))} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {/* Attachment type selector */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Add attachment</Label>
                    <select
                      value=""
                      onChange={e => {
                        const selected = ATTACHMENT_TYPES.find(a => a.type === e.target.value);
                        if (selected && !form.attachments?.some(a => a.type === selected.type)) {
                          setForm(p => ({ ...p, attachments: [...(p.attachments || []), { type: selected.type, label: selected.label }] }));
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="">Select document to attach...</option>
                      {ATTACHMENT_TYPES
                        .filter(a => a.category === "general" || a.category === form.category)
                        .filter(a => !form.attachments?.some(att => att.type === a.type))
                        .map(a => <option key={a.type} value={a.type}>{a.label}</option>)}
                    </select>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Attached documents (e.g. Invoice PDF) will be auto-generated and included when sending emails with this template.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Variable Sidebar (Kiini: One Hub. Total Control style) */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Variable className="h-4 w-4" /> Template Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {TEMPLATE_VARIABLES.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between group"
                      onClick={() => {
                        const body = (form.htmlBody || form.body) + v.value;
                        const vars = detectVariables(body);
                        setForm(p => ({ ...p, body, htmlBody: body, variables: vars }));
                      }}
                      title={`Click to copy: ${v.value}`}
                    >
                      <span className="text-foreground">{v.label}</span>
                      <code className="text-[10px] text-muted-foreground group-hover:text-foreground">{v.value}</code>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Variable className="h-4 w-4" /> General Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {GENERAL_VARIABLES.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between group"
                      onClick={() => {
                        const body = (form.htmlBody || form.body) + v.value;
                        const vars = detectVariables(body);
                        setForm(p => ({ ...p, body, htmlBody: body, variables: vars }));
                      }}
                      title={`Click to copy: ${v.value}`}
                    >
                      <span className="text-foreground">{v.label}</span>
                      <code className="text-[10px] text-muted-foreground group-hover:text-foreground">{v.value}</code>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Variable className="h-4 w-4" /> Document Variables
                  </CardTitle>
                  <CardDescription>Use the same company, document, employee, and line-item tokens as Document Templates.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[28rem] space-y-1 overflow-y-auto">
                  {DOCUMENT_VARIABLES.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      className="group flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                      onClick={() => {
                        const body = (form.htmlBody || form.body) + v.value;
                        const vars = detectVariables(body);
                        setForm(p => ({ ...p, body, htmlBody: body, variables: vars }));
                      }}
                      title={`Click to insert: ${v.value}`}
                    >
                      <span className="text-foreground">{v.label}</span>
                      <code className="text-[10px] text-muted-foreground group-hover:text-foreground">{v.value}</code>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Used variables */}
              {form.variables && form.variables.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Used Variables ({form.variables.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {form.variables.map(v => (
                        <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <DialogDescription>Preview with sample data substituted for variables</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Subject</div>
                  <div className="font-medium">{getPreviewHtml({ ...previewTemplate, body: previewTemplate.subject, htmlBody: previewTemplate.subject }).replace(/<[^>]+>/g, "")}</div>
                </div>
                <div className="border rounded-md overflow-hidden bg-muted/20">
                  <iframe
                    title="Email template preview"
                    srcDoc={designEmailTemplateBody(previewTemplate.subject, getPreviewHtml(previewTemplate))}
                    className="w-full min-h-[560px] bg-white"
                    sandbox=""
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  // List view
  return (
    <PageShell
      embedded={embedded}
      title="Email Templates"
      description="Manage HTML email templates for system-wide use"
      breadcrumbs={[
        { label: "Dashboard", href: "/crm/super-admin" },
        { label: "Administration", href: "/admin/management" },
        { label: "Email Templates" },
      ]}
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          >
            <option value="all">All Categories</option>
            {TEMPLATE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
          </select>
          <Button onClick={() => openBuilder()}>
            <Plus className="h-4 w-4 mr-2" />New Template
          </Button>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>{filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found</CardDescription>
            </div>
            <TableColumnSettings
              columns={templateColumns}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumn}
              onReset={reset}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                updatePageSize(size);
                resetPage();
              }}
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    {isVisible("name") && <TableHead className="w-[220px]">Name</TableHead>}
                    {isVisible("category") && <TableHead>Category</TableHead>}
                    {isVisible("subject") && <TableHead>Subject</TableHead>}
                    {isVisible("variables") && <TableHead>Variables</TableHead>}
                    {isVisible("attachments") && <TableHead>Attachments</TableHead>}
                    {isVisible("createdAt") && <TableHead>Created</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No templates found</TableCell>
                    </TableRow>
                  ) : (
                    pagedTemplates.map(template => (
                      <TableRow key={template.id} className="group">
                        {isVisible("name") && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium">{template.name}</div>
                                {template.isDefault && <Badge variant="outline" className="text-[10px] mt-0.5">Default</Badge>}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {isVisible("category") && (
                          <TableCell>
                            <Badge variant="secondary" className={cn("text-xs", CATEGORY_COLORS[template.category || "general"])}>
                              {template.category || "general"}
                            </Badge>
                          </TableCell>
                        )}
                        {isVisible("subject") && (
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{template.subject}</TableCell>
                        )}
                        {isVisible("variables") && (
                          <TableCell>
                            {template.variables?.length ? (
                              <Badge variant="outline" className="text-xs">{template.variables.length} vars</Badge>
                            ) : <span className="text-xs text-muted-foreground">-</span>}
                          </TableCell>
                        )}
                        {isVisible("attachments") && (
                          <TableCell>
                            {template.attachments?.length ? (
                              <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit"><Paperclip className="h-3 w-3" />{template.attachments.length}</Badge>
                            ) : <span className="text-xs text-muted-foreground">-</span>}
                          </TableCell>
                        )}
                        {isVisible("createdAt") && (
                          <TableCell className="text-xs text-muted-foreground">{template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "-"}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)} title="Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openBuilder(template)} title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDuplicate(template)} title="Duplicate">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} className="text-destructive" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              total={filteredTemplates.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                resetPage();
              }}
              className="px-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>Preview with sample data substituted for variables</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Subject</div>
                <div className="font-medium">{getPreviewHtml({ ...previewTemplate, body: previewTemplate.subject, htmlBody: previewTemplate.subject }).replace(/<[^>]+>/g, "")}</div>
              </div>
              <div className="border rounded-md overflow-hidden bg-muted/20">
                <iframe
                  title="Email template preview"
                  srcDoc={designEmailTemplateBody(previewTemplate.subject, getPreviewHtml(previewTemplate))}
                  className="w-full min-h-[560px] bg-white"
                  sandbox=""
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button onClick={() => { openBuilder(previewTemplate!); setPreviewTemplate(null); }}>Edit Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
