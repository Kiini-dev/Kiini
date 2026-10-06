import React, { useMemo, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/RichTextEditor";
import DocumentBlockEditor from "@/components/DocumentBlockEditor";
import HTMLEditor from "@/components/HTMLEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Edit2, Trash2, Search, Eye, ArrowLeft, Copy, Code, Star } from "lucide-react";
import { toast } from "sonner";
import { logCreate, logDelete, logUpdate } from "@/lib/activityLog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Spinner } from "@/components/ui/spinner";

interface DocumentTemplate {
  id: string;
  type: string;
  title: string;
  content: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

function normalizeTemplateToken(raw: string): string {
  return raw
    .trim()
    .replace(/^[{\[$\s]+|[}\]$\s]+$/g, "")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/[\s\-.]+/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function extractTemplateTokens(content: string): string[] {
  const tokens = new Set<string>();
  const moustache = /\{\{\s*([^{}]+)\s*\}\}/g;
  const dollar = /\$\{\s*([^{}]+)\s*\}/g;
  const bracket = /\[\s*([A-Za-z0-9_ ]+)\s*\]/g;

  for (const regex of [moustache, dollar, bracket]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const token = normalizeTemplateToken(match[1] || "");
      if (token) tokens.add(token);
    }
  }

  return Array.from(tokens);
}

function tokenToLabel(token: string): string {
  return token
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Common item field tokens for templates (expand to item_1_*, item_2_*, etc. at runtime)
const ITEM_FIELD_TOKENS = [
  { label: "Item Description", value: "{{item_1_description}}" },
  { label: "Item Quantity", value: "{{item_1_quantity}}" },
  { label: "Item Unit Price", value: "{{item_1_unit_price}}" },
  { label: "Item Amount", value: "{{item_1_amount}}" },
  { label: "Item Tax Rate", value: "{{item_1_tax_rate}}" },
  { label: "Item Tax Amount", value: "{{item_1_tax_amount}}" },
  { label: "Item Line Number", value: "{{item_1_line_number}}" },
];

// Document type configurations
const DOC_CONFIG: Record<string, {
  label: string;
  singular: string;
  parentLabel: string;
  parentHref: string;
  dashboardHref: string;
  variables: { label: string; value: string }[];
}> = {
  invoice: {
    label: "Invoice Templates",
    singular: "Invoice",
    parentLabel: "Invoices",
    parentHref: "/invoices",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Client Address", value: "{{client_address}}" },
      { label: "Invoice Number", value: "{{invoice_number}}" },
      { label: "Invoice Date", value: "{{invoice_date}}" },
      { label: "Due Date", value: "{{due_date}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Sub Total", value: "{{sub_total}}" },
      { label: "Tax Amount", value: "{{tax_amount}}" },
      { label: "Discount", value: "{{discount}}" },
      { label: "Payment Terms", value: "{{payment_terms}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Item Tax Rate (1)", value: "{{item_1_tax_rate}}" },
      { label: "Item Tax Amount (1)", value: "{{item_1_tax_amount}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Company Phone", value: "{{company_phone}}" },
      { label: "Company Email", value: "{{company_email}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  estimate: {
    label: "Estimate Templates",
    singular: "Estimate",
    parentLabel: "Estimates",
    parentHref: "/estimates",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Client Address", value: "{{client_address}}" },
      { label: "Estimate Number", value: "{{estimate_number}}" },
      { label: "Estimate Date", value: "{{estimate_date}}" },
      { label: "Expiry Date", value: "{{expiry_date}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Sub Total", value: "{{sub_total}}" },
      { label: "Tax Amount", value: "{{tax_amount}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Terms", value: "{{terms}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  quotation: {
    label: "Quotation Templates",
    singular: "Quotation",
    parentLabel: "Quotations",
    parentHref: "/quotations",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Client Address", value: "{{client_address}}" },
      { label: "Quotation Number", value: "{{quotation_number}}" },
      { label: "Quotation Date", value: "{{quotation_date}}" },
      { label: "Valid Until", value: "{{valid_until}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Sub Total", value: "{{sub_total}}" },
      { label: "Tax Amount", value: "{{tax_amount}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Item Tax Rate (1)", value: "{{item_1_tax_rate}}" },
      { label: "Item Tax Amount (1)", value: "{{item_1_tax_amount}}" },
      { label: "Terms & Conditions", value: "{{terms}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  receipt: {
    label: "Receipt Templates",
    singular: "Receipt",
    parentLabel: "Receipts",
    parentHref: "/receipts",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Receipt Number", value: "{{receipt_number}}" },
      { label: "Receipt Date", value: "{{receipt_date}}" },
      { label: "Payment Amount", value: "{{payment_amount}}" },
      { label: "Payment Method", value: "{{payment_method}}" },
      { label: "Payment Reference", value: "{{payment_reference}}" },
      { label: "Invoice Number", value: "{{invoice_number}}" },
      { label: "Balance Due", value: "{{balance_due}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  purchase_order: {
    label: "Purchase Order Templates",
    singular: "Purchase Order",
    parentLabel: "Purchase Orders",
    parentHref: "/lpos",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Supplier Name", value: "{{supplier_name}}" },
      { label: "Supplier Email", value: "{{supplier_email}}" },
      { label: "Supplier Address", value: "{{supplier_address}}" },
      { label: "PO Number", value: "{{po_number}}" },
      { label: "PO Date", value: "{{po_date}}" },
      { label: "Delivery Date", value: "{{delivery_date}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Sub Total", value: "{{sub_total}}" },
      { label: "Tax Amount", value: "{{tax_amount}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Item Tax Rate (1)", value: "{{item_1_tax_rate}}" },
      { label: "Item Tax Amount (1)", value: "{{item_1_tax_amount}}" },
      { label: "Delivery Address", value: "{{delivery_address}}" },
      { label: "Payment Terms", value: "{{payment_terms}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Authorized By", value: "{{authorized_by}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  credit_note: {
    label: "Credit Note Templates",
    singular: "Credit Note",
    parentLabel: "Credit Notes",
    parentHref: "/credit-notes",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Credit Note Number", value: "{{credit_note_number}}" },
      { label: "Credit Note Date", value: "{{credit_note_date}}" },
      { label: "Invoice Number", value: "{{invoice_number}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Reason", value: "{{reason}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  debit_note: {
    label: "Debit Note Templates",
    singular: "Debit Note",
    parentLabel: "Debit Notes",
    parentHref: "/debit-notes",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Debit Note Number", value: "{{debit_note_number}}" },
      { label: "Debit Note Date", value: "{{debit_note_date}}" },
      { label: "Invoice Number", value: "{{invoice_number}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Reason", value: "{{reason}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Item Description (1)", value: "{{item_1_description}}" },
      { label: "Item Quantity (1)", value: "{{item_1_quantity}}" },
      { label: "Item Unit Price (1)", value: "{{item_1_unit_price}}" },
      { label: "Item Amount (1)", value: "{{item_1_amount}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
      { label: "Today's Date", value: "{{todays_date}}" },
    ],
  },
  asset: {
    label: "Asset Templates",
    singular: "Asset",
    parentLabel: "Assets",
    parentHref: "/assets",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Asset Description", value: "{{asset_description}}" },
      { label: "Asset Category", value: "{{asset_category}}" },
      { label: "Asset Condition", value: "{{asset_condition}}" },
      { label: "Asset Cost", value: "{{asset_cost}}" },
      { label: "Serial Number", value: "{{serial_number}}" },
      { label: "Employee Name", value: "{{employee_name}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  delivery_note: {
    label: "Delivery Note Templates",
    singular: "Delivery Note",
    parentLabel: "Delivery Notes",
    parentHref: "/delivery-notes",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Delivery Note Number", value: "{{dn_number}}" },
      { label: "Delivery Date", value: "{{delivery_date}}" },
      { label: "Supplier Name", value: "{{supplier_name}}" },
      { label: "Purchase Order", value: "{{po_number}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Receiver Name", value: "{{receiver_name}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  grn: {
    label: "GRN Templates",
    singular: "Goods Received Note",
    parentLabel: "GRNs",
    parentHref: "/grn",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "GRN Number", value: "{{grn_number}}" },
      { label: "GRN Date", value: "{{grn_date}}" },
      { label: "Supplier Name", value: "{{supplier_name}}" },
      { label: "Purchase Order", value: "{{po_number}}" },
      { label: "Inspection Status", value: "{{inspection_status}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Remarks", value: "{{remarks}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  imprest: {
    label: "Imprest Templates",
    singular: "Imprest",
    parentLabel: "Imprests",
    parentHref: "/imprests",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Imprest Number", value: "{{imprest_number}}" },
      { label: "Employee Name", value: "{{employee_name}}" },
      { label: "Amount", value: "{{amount}}" },
      { label: "Business Purpose", value: "{{business_purpose_description}}" },
      { label: "Date", value: "{{issue_date}}" },
      { label: "Status", value: "{{status}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  order: {
    label: "Order Templates",
    singular: "Purchase Order",
    parentLabel: "Orders",
    parentHref: "/orders",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Order Number", value: "{{po_number}}" },
      { label: "Order Date", value: "{{po_date}}" },
      { label: "Supplier Name", value: "{{supplier_name}}" },
      { label: "Delivery Date", value: "{{delivery_date}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Payment Terms", value: "{{payment_terms}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  expense_claim: {
    label: "Expense Claim Templates",
    singular: "Expense Claim",
    parentLabel: "Expenses",
    parentHref: "/expenses",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Claim Number", value: "{{claim_number}}" },
      { label: "Claim Date", value: "{{claim_date}}" },
      { label: "Employee Name", value: "{{employee_name}}" },
      { label: "Department", value: "{{department}}" },
      { label: "Total Expenses", value: "{{total_expenses}}" },
      { label: "Items Table", value: "{{items_table}}" },
      { label: "Approved By", value: "{{approved_by}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  service_invoice: {
    label: "Service Invoice Templates",
    singular: "Service Invoice",
    parentLabel: "Service Invoices",
    parentHref: "/service-invoices",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Service Invoice Number", value: "{{service_invoice_number}}" },
      { label: "Service Date", value: "{{service_date}}" },
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Service Description", value: "{{service_description}}" },
      { label: "Service Items", value: "{{service_items}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  work_order: {
    label: "Work Order Templates",
    singular: "Work Order",
    parentLabel: "Work Orders",
    parentHref: "/work-orders",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Work Order Number", value: "{{work_order_number}}" },
      { label: "Work Order Date", value: "{{work_order_date}}" },
      { label: "Assigned To", value: "{{assigned_to}}" },
      { label: "Work Description", value: "{{description}}" },
      { label: "Start Date", value: "{{start_date}}" },
      { label: "End Date", value: "{{end_date}}" },
      { label: "Labor Cost", value: "{{labor_cost}}" },
      { label: "Materials Cost", value: "{{materials_cost}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  contract: {
    label: "Contract Templates",
    singular: "Contract",
    parentLabel: "Contracts",
    parentHref: "/contracts",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Contract Number", value: "{{contract_number}}" },
      { label: "Contract Date", value: "{{contract_date}}" },
      { label: "Contract Value", value: "{{contract_value}}" },
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Start Date", value: "{{start_date}}" },
      { label: "End Date", value: "{{end_date}}" },
      { label: "Scope of Work", value: "{{scope_of_work}}" },
      { label: "Payment Terms", value: "{{payment_terms}}" },
      { label: "Terms", value: "{{terms}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  proposal: {
    label: "Proposal Templates",
    singular: "Proposal",
    parentLabel: "Proposals",
    parentHref: "/proposals",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Proposal Number", value: "{{proposal_number}}" },
      { label: "Proposal Date", value: "{{proposal_date}}" },
      { label: "Valid Until", value: "{{valid_until}}" },
      { label: "Project Name", value: "{{project_name}}" },
      { label: "Client Name", value: "{{client_name}}" },
      { label: "Client Email", value: "{{client_email}}" },
      { label: "Subtotal", value: "{{subtotal}}" },
      { label: "Tax Amount", value: "{{tax_amount}}" },
      { label: "Total Amount", value: "{{total_amount}}" },
      { label: "Prepared By", value: "{{prepared_by}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  payslip: {
    label: "Payslip Templates",
    singular: "Payslip",
    parentLabel: "Payslips",
    parentHref: "/payslips",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Payslip Number", value: "{{payslip_number}}" },
      { label: "Pay Period", value: "{{pay_period}}" },
      { label: "Pay Date", value: "{{pay_date}}" },
      { label: "Employee Name", value: "{{employee_name}}" },
      { label: "Employee Number", value: "{{employee_number}}" },
      { label: "Department", value: "{{department}}" },
      { label: "Position", value: "{{position}}" },
      { label: "Gross Salary", value: "{{gross_salary}}" },
      { label: "Total Deductions", value: "{{total_deductions}}" },
      { label: "Allowance 1 Name", value: "{{allowance_1_name}}" },
      { label: "Allowance 1 Amount", value: "{{allowance_1_amount}}" },
      { label: "Allowance 2 Name", value: "{{allowance_2_name}}" },
      { label: "Allowance 2 Amount", value: "{{allowance_2_amount}}" },
      { label: "Allowance 3 Name", value: "{{allowance_3_name}}" },
      { label: "Allowance 3 Amount", value: "{{allowance_3_amount}}" },
      { label: "Allowance 4 Name", value: "{{allowance_4_name}}" },
      { label: "Allowance 4 Amount", value: "{{allowance_4_amount}}" },
      { label: "Bonuses", value: "{{bonuses}}" },
      { label: "PAYE", value: "{{paye}}" },
      { label: "NSSF", value: "{{nssf}}" },
      { label: "NHIF / SHIF", value: "{{nhif}}" },
      { label: "Loan Deduction", value: "{{loan_deduction}}" },
      { label: "Other Deductions", value: "{{other_deductions}}" },
      { label: "Employer NSSF", value: "{{employer_nssf}}" },
      { label: "Employer Benefits", value: "{{employer_benefits}}" },
      { label: "Total Company Contribution", value: "{{total_company_contribution}}" },
      { label: "Net Salary", value: "{{net_salary}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
  warranty: {
    label: "Warranty Templates",
    singular: "Warranty",
    parentLabel: "Warranties",
    parentHref: "/warranty",
    dashboardHref: "/crm/super-admin",
    variables: [
      { label: "Warranty Number", value: "{{warranty_number}}" },
      { label: "Purchase Date", value: "{{purchase_date}}" },
      { label: "Expiry Date", value: "{{expiry_date}}" },
      { label: "Product", value: "{{product}}" },
      { label: "Vendor", value: "{{vendor}}" },
      { label: "Serial Number", value: "{{serial_number}}" },
      { label: "Coverage", value: "{{coverage}}" },
      { label: "Claim Terms", value: "{{claim_terms}}" },
      { label: "Status", value: "{{status}}" },
      { label: "Notes", value: "{{notes}}" },
      { label: "Company Name", value: "{{company_name}}" },
      { label: "Company Address", value: "{{company_address}}" },
      { label: "Logo URL", value: "{{logo_url}}" },
    ],
  },
};

interface DocumentTemplatesProps {
  type: string;
}

Object.values(DOC_CONFIG).forEach((config) => {
  if (!config.variables.some((variable) => variable.value === "{{app_logo}}")) {
    config.variables.push({ label: "App Logo", value: "{{app_logo}}" });
  }
});

export default function DocumentTemplates({ type }: DocumentTemplatesProps) {
  const config = DOC_CONFIG[type];
  if (!config) return <div className="p-8 text-center text-muted-foreground">Unknown document type: {type}</div>;

  const utils = trpc.useUtils();
  const { data: templates = [], isLoading } = trpc.documentTemplates.list.useQuery({ type });
  const { data: tokenReference } = trpc.documentTemplates.allowedTokens.useQuery({ type });
  const createMutation = trpc.documentTemplates.create.useMutation({
    onSuccess: (res: any) => { 
      try { 
        console.log("[DocumentTemplates] Template created successfully:", res?.id);
        utils.documentTemplates.list.invalidate(); 
        toast.success("Template created successfully"); 
        setView("list"); 
        logCreate("DocumentTemplates", res?.id || form.title, form.title); 
      } catch(e){ console.warn(e); } 
    },
    onError: (e: any) => {
      console.error("[DocumentTemplates] Create mutation error:", e);
      const errorMsg = e?.message || e?.data?.message || "Failed to create template";
      toast.error(errorMsg);
    },
  });
  const updateMutation = trpc.documentTemplates.update.useMutation({
    onSuccess: (res: any) => { 
      try { 
        console.log("[DocumentTemplates] Template updated successfully:", res?.id);
        utils.documentTemplates.list.invalidate(); 
        toast.success("Template updated successfully"); 
        setView("list"); 
        logUpdate("DocumentTemplates", editingTemplate?.id || res?.id || form.title, form.title); 
      } catch(e){ console.warn(e); } 
    },
    onError: (e: any) => {
      console.error("[DocumentTemplates] Update mutation error:", e);
      const errorMsg = e?.message || e?.data?.message || "Failed to update template";
      toast.error(errorMsg);
    },
  });
  const deleteMutation = trpc.documentTemplates.delete.useMutation({
    onSuccess: (res: any) => { try { utils.documentTemplates.list.invalidate(); toast.success("Template deleted"); logDelete("DocumentTemplates", res?.id || "", res?.title || ""); } catch(e){ console.warn(e); } },
    onError: (e: any) => toast.error(e.message),
  });
  const duplicateMutation = trpc.documentTemplates.duplicate.useMutation({
    onSuccess: () => { utils.documentTemplates.list.invalidate(); toast.success("Template duplicated"); },
    onError: (e: any) => toast.error(e.message),
  });
  const setDefaultMutation = trpc.documentTemplates.setDefault.useMutation({
    onSuccess: () => { utils.documentTemplates.list.invalidate(); toast.success("Template set as default"); },
    onError: (e: any) => toast.error(e.message),
  });
  const unsetDefaultMutation = trpc.documentTemplates.unsetDefault.useMutation({
    onSuccess: () => { utils.documentTemplates.list.invalidate(); toast.success("Template default status removed"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);
  const [form, setForm] = useState<{ title: string; content: string; isDefault: boolean }>({ title: "", content: "", isDefault: false });
  const [editorMode, setEditorMode] = useState<"block" | "html" | "richtext">("block");
  const [showAllCommonTokens, setShowAllCommonTokens] = useState(true);
  const [showAllDocumentTokens, setShowAllDocumentTokens] = useState(true);

  const allowedTokenSet = useMemo(
    () => new Set((tokenReference?.allowedTokens || []).map((token: string) => normalizeTemplateToken(token))),
    [tokenReference?.allowedTokens]
  );

  const templateVariables = useMemo(() => {
    if (allowedTokenSet.size === 0) return config.variables;

    const existing = new Set(config.variables.map((variable) => normalizeTemplateToken(variable.value)));
    const filtered = config.variables.filter((variable) =>
      allowedTokenSet.has(normalizeTemplateToken(variable.value))
    );

    const discovered = Array.from(allowedTokenSet)
      .filter((token) => !existing.has(token))
      .map((token) => ({
        label: tokenToLabel(token),
        value: `{{${token}}}`,
      }));

    return [...filtered, ...discovered];
  }, [allowedTokenSet, config.variables]);

  const commonTokens = useMemo(() => tokenReference?.commonTokens || [], [tokenReference?.commonTokens]);
  const documentTokens = useMemo(() => tokenReference?.documentTokens || [], [tokenReference?.documentTokens]);

  const appendTokenToContent = (token: string) => {
    const nextToken = `{{${token}}}`;
    setForm((prev) => ({
      ...prev,
      content: prev.content ? `${prev.content}${nextToken}` : nextToken,
    }));
  };

  const insertTokenIntoActiveEditor = (token: string) => {
    const nextToken = `{{${token}}}`;
    const active = document.activeElement as HTMLElement | null;

    if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) {
      const start = active.selectionStart ?? active.value.length;
      const end = active.selectionEnd ?? active.value.length;
      active.setRangeText(nextToken, start, end, "end");
      active.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    if (active?.isContentEditable) {
      active.focus();
      const inserted = typeof document.execCommand === "function"
        ? document.execCommand("insertText", false, nextToken)
        : false;
      if (!inserted && typeof document.execCommand === "function") {
        document.execCommand("insertHTML", false, nextToken);
      }
      return;
    }

    appendTokenToContent(token);
  };

  const filtered = (templates as DocumentTemplate[]).filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditor = (template?: DocumentTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setForm({ title: template.title, content: template.content, isDefault: template.isDefault });
    } else {
      setEditingTemplate(null);
      setForm({ title: "", content: "", isDefault: false });
    }
    setView("editor");
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a template title");
      return;
    }

    const contentToSave = form.content?.trim() || "";
    
    if (!contentToSave) {
      toast.error(`Please enter template content`);
      return;
    }

    if (allowedTokenSet.size > 0) {
      const usedTokens = extractTemplateTokens(contentToSave);
      const invalidTokens = usedTokens.filter((token) => !allowedTokenSet.has(token));
      if (invalidTokens.length > 0) {
        toast.error(`Unsupported token(s): ${invalidTokens.join(", ")}`);
        return;
      }
    }

    console.log("[DocumentTemplates] Saving template:", {
      mode: editorMode,
      type,
      title: form.title,
      contentLength: contentToSave.length,
      contentPreview: contentToSave.substring(0, 50) + (contentToSave.length > 50 ? "..." : ""),
      isEditing: !!editingTemplate,
    });

    try {
      if (editingTemplate) {
        updateMutation.mutate({ id: editingTemplate.id, title: form.title, content: contentToSave, isDefault: form.isDefault });
      } else {
        createMutation.mutate({ type, title: form.title, content: contentToSave, isDefault: form.isDefault });
      }
    } catch (error) {
      console.error("[DocumentTemplates] Error in handleSave:", error);
      toast.error(`Error saving template: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    handleSave();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleDelete = (id: string) => {
    if (confirm("Deleting this template is permanent. Are you sure you want to continue?")) {
      deleteMutation.mutate(id);
    }
  };

  // Editor view
  if (view === "editor") {
    return (
      <ModuleLayout
        title={editingTemplate ? `Edit ${config.singular} Template` : `New ${config.singular} Template`}
        description={`Design a reusable ${config.singular.toLowerCase()} template`}
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: config.dashboardHref },
          { label: config.parentLabel, href: config.parentHref },
          { label: "Templates", href: `${config.parentHref}/templates` },
          { label: editingTemplate ? "Edit" : "New Template" },
        ]}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Templates
            </Button>
            <Button onClick={() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); handleSave(); }} disabled={isSaving}>
              {isSaving ? "Saving..." : `${editingTemplate ? "Update" : "Create"} Template`}
            </Button>
          </div>
          <form id="document-template-editor-form" onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Template Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={`e.g., Standard ${config.singular}`} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefault"
                  checked={form.isDefault}
                  onCheckedChange={(checked) => setForm(p => ({ ...p, isDefault: checked as boolean }))}
                />
                <Label htmlFor="isDefault" className="font-normal cursor-pointer">Set as default template</Label>
              </div>
              <div className="space-y-2">
                <Label>Template Content</Label>
                <p className="text-sm text-gray-600">
                  Create rich content using blocks, HTML, or rich text editor. Choose the editor that best suits your workflow.
                </p>

                <Tabs value={editorMode} onValueChange={(val) => setEditorMode(val as "block" | "html" | "richtext")} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="block" className="flex gap-2">
                      <Code className="h-4 w-4" />
                      Blocks
                    </TabsTrigger>
                    <TabsTrigger value="richtext" className="flex gap-2">
                      <Code className="h-4 w-4" />
                      Rich Text
                    </TabsTrigger>
                    <TabsTrigger value="html" className="flex gap-2">
                      <Code className="h-4 w-4" />
                      HTML
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="block" className="mt-4">
                    <DocumentBlockEditor
                      value={form.content}
                      onChange={val => setForm(p => ({ ...p, content: val }))}
                      placeholder={`Design your ${config.singular.toLowerCase()} template...`}
                      minHeight="500px"
                      variables={templateVariables}
                    />
                  </TabsContent>

                  <TabsContent value="richtext" className="mt-4">
                    <RichTextEditor
                      value={form.content}
                      onChange={val => setForm(p => ({ ...p, content: val }))}
                      placeholder={`Design your ${config.singular.toLowerCase()} template...`}
                      minHeight="500px"
                      enhanced
                      variables={templateVariables}
                    />
                  </TabsContent>

                  <TabsContent value="html" className="mt-4">
                    <HTMLEditor
                      value={form.content}
                      onChange={val => setForm(p => ({ ...p, content: val }))}
                      placeholder={`Design your ${config.singular.toLowerCase()} template...`}
                      minHeight="500px"
                      height="600px"
                      variables={templateVariables}
                    />
                  </TabsContent>
                </Tabs>

                <Card className="mt-4 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm">Valid Template Tokens</CardTitle>
                        <CardDescription>Grouped by shared and document-specific placeholders.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Common</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setShowAllCommonTokens((prev) => !prev)}
                        >
                          {showAllCommonTokens ? "Show less" : "Show all"}
                        </Button>
                      </div>
                      <ScrollArea className={`${showAllCommonTokens ? "h-[220px]" : "h-[110px]"} w-full rounded-md border p-2`}>
                        <div className="flex flex-wrap gap-2">
                          {commonTokens.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No common tokens available.</span>
                          ) : (
                            commonTokens.map((token: string) => (
                              <button
                                key={`common-${token}`}
                                type="button"
                                className="rounded-md border bg-muted px-2 py-1 font-mono text-xs hover:bg-accent"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  insertTokenIntoActiveEditor(token);
                                }}
                                title="Click to insert"
                              >
                                {`{{${token}}}`}
                              </button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Document Specific</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setShowAllDocumentTokens((prev) => !prev)}
                        >
                          {showAllDocumentTokens ? "Show less" : "Show all"}
                        </Button>
                      </div>
                      <ScrollArea className={`${showAllDocumentTokens ? "h-[220px]" : "h-[110px]"} w-full rounded-md border p-2`}>
                        <div className="flex flex-wrap gap-2">
                          {documentTokens.length === 0 ? (
                            <span className="text-xs text-muted-foreground">No document-specific tokens available.</span>
                          ) : (
                            documentTokens.map((token: string) => (
                              <button
                                key={`document-${token}`}
                                type="button"
                                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-xs text-blue-900 hover:bg-blue-100"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  insertTokenIntoActiveEditor(token);
                                }}
                                title="Click to insert"
                              >
                                {`{{${token}}}`}
                              </button>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          </form>
        </div>
      </ModuleLayout>
    );
  }

  // List view
  if (isLoading) {
    return (
      <ModuleLayout title={config.label} description={`Manage reusable ${config.singular.toLowerCase()} templates`} icon={<FileText className="h-5 w-5" />}>
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title={config.label}
      description={`Manage reusable ${config.singular.toLowerCase()} templates`}
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: config.dashboardHref },
        { label: config.parentLabel, href: config.parentHref },
        { label: "Templates" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => openEditor()}>
            <Plus className="h-4 w-4 mr-2" />New Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>{filtered.length} template{filtered.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No templates found. Create your first {config.singular.toLowerCase()} template.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(template => (
                    <TableRow key={template.id} className="group">
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell>
                        {template.isDefault ? (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-600">Default</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">{template.createdBy.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{template.createdBy}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(template)} title="Preview">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditor(template)} title="Edit">
                            <Edit2 className="h-4 w-4 text-green-600" />
                          </Button>
                          {template.isDefault ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => unsetDefaultMutation.mutate(template.id)}
                              title="Unset as default"
                              disabled={unsetDefaultMutation.isPending}
                            >
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDefaultMutation.mutate(template.id)}
                              title="Set as default"
                              disabled={setDefaultMutation.isPending}
                            >
                              <Star className="h-4 w-4 text-gray-400" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => duplicateMutation.mutate(template.id)} title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
            <DialogDescription>Template preview</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="border rounded-md p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Close</Button>
            <Button onClick={() => { openEditor(previewTemplate!); setPreviewTemplate(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
