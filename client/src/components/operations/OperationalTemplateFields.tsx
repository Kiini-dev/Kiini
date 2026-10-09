import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OperationalDocumentType = "delivery-note" | "grn" | "work-order" | "imprest";
export type OperationalTemplateData = Record<string, any>;

const workOrderPhases = [
  "Pre-Work Safety Audit & Isolation",
  "Disassembly & Initial Diagnostics",
  "Component Replacement & Calibration",
  "Testing & Quality Re-commissioning",
  "Site Clearance & Handover",
];

export function createOperationalTemplateDefaults(type: OperationalDocumentType): OperationalTemplateData {
  const defaults: OperationalTemplateData = {
    vatRate: 16,
    lineItems: [],
  };
  if (type === "delivery-note") {
    defaults.inspectionClause = "Inspect packages for security anomalies, broken seals, or visible damage before signing.";
    defaults.serialValidationClause = "Signature confirms that the serial numbers listed have been verified upon handover.";
    defaults.shortageDamageClause = "Report discrepancies, shortages, and transport damage within the selected reporting window.";
  }
  if (type === "work-order") {
    defaults.checklist = workOrderPhases.map((phase) => ({ phase, completed: false }));
    defaults.materials = [];
    defaults.laborEntries = [];
  }
  if (type === "imprest") {
    defaults.expenses = [];
    defaults.employeeAffirmation = "I certify these expenses were incurred strictly for official company business and that matching local ETR tax receipts are attached.";
  }
  return defaults;
}

export function normalizeOperationalTemplateData(type: OperationalDocumentType, value: OperationalTemplateData): OperationalTemplateData {
  const data = { ...createOperationalTemplateDefaults(type), ...value };
  const amount = (input: unknown) => Number(input) || 0;
  const vatRate = amount(data.vatRate) || 16;

  if (type === "delivery-note") {
    data.lineItems = (data.lineItems || []).map((item: OperationalTemplateData) => ({
      ...item,
      totalPrice: amount(item.totalPrice) || amount(item.quantityShipped) * amount(item.unitPrice),
    }));
    data.subtotal = amount(data.subtotal) || data.lineItems.reduce((sum: number, item: OperationalTemplateData) => sum + amount(item.totalPrice), 0);
    data.vatRate = vatRate;
    data.vatAmount = amount(data.vatAmount) || data.subtotal * vatRate / 100;
    data.grandTotal = amount(data.grandTotal) || data.subtotal + data.vatAmount + amount(data.shippingFreight);
  }

  if (type === "grn") {
    data.lineItems = (data.lineItems || []).map((item: OperationalTemplateData) => ({
      ...item,
      lineValue: amount(item.unitPrice) * amount(item.quantityAccepted !== undefined && item.quantityAccepted !== "" ? item.quantityAccepted : item.quantityReceived),
    }));
    data.subtotal = amount(data.subtotal) || data.lineItems.reduce((sum: number, item: OperationalTemplateData) => sum + amount(item.lineValue), 0);
    data.vatRate = vatRate;
    data.vatAmount = amount(data.vatAmount) || data.subtotal * vatRate / 100;
    data.netVerifiedStockValue = amount(data.netVerifiedStockValue) || data.subtotal + data.vatAmount + amount(data.freightLandedCosts);
  }

  if (type === "work-order") {
    data.materials = (data.materials || []).map((item: OperationalTemplateData) => {
      const totalCost = amount(item.totalCost) || amount(item.quantity) * amount(item.unitCost);
      return { ...item, totalCost, vat: amount(item.vat) || totalCost * vatRate / 100 };
    });
  }

  if (type === "imprest") {
    data.expenses = (data.expenses || []).map((item: OperationalTemplateData) => {
      const vat = item.vat !== undefined && item.vat !== "" ? amount(item.vat) : amount(item.baseCost) * vatRate / 100;
      return { ...item, vat, totalSpent: amount(item.totalSpent) || amount(item.baseCost) + vat };
    });
    data.totalSpent = amount(data.totalSpent) || data.expenses.reduce((sum: number, item: OperationalTemplateData) => sum + amount(item.totalSpent), 0);
    data.initialCashFloat = amount(data.initialCashFloat);
    data.netBalance = data.initialCashFloat - data.totalSpent;
  }

  return data;
}

const fields: Record<OperationalDocumentType, Array<{ key: string; label: string; type?: string; multiline?: boolean; options?: Array<{ value: string; label: string }> }>> = {
  "delivery-note": [
    { key: "purchaseOrderNumber", label: "Associated Purchase Order #" },
    { key: "salesInvoiceNumber", label: "Sales Invoice #" },
    { key: "supplierPin", label: "Supplier KRA PIN" },
    { key: "companyName", label: "Supplier Company Name" },
    { key: "dispatchWarehouse", label: "Dispatch Warehouse" },
    { key: "supplierEmail", label: "Supplier Contact Email", type: "email" },
    { key: "supplierPhone", label: "Supplier Phone", type: "tel" },
    { key: "customerName", label: "Customer / Ship-To Name" },
    { key: "deliveryAddress", label: "Delivery Address", multiline: true },
    { key: "customerContact", label: "Customer Contact POC" },
    { key: "customerPhone", label: "Customer Phone", type: "tel" },
    { key: "shippingMethod", label: "Shipping Method / Carrier" },
    { key: "trackingNumber", label: "Tracking / Waybill Number" },
    { key: "packageCount", label: "Packages / Pallets", type: "number" },
    { key: "grossWeight", label: "Total Gross Weight" },
    { key: "subtotal", label: "Subtotal (KES, excl. VAT)", type: "number" },
    { key: "vatRate", label: "KRA VAT Rate (%)", type: "number" },
    { key: "vatAmount", label: "KRA VAT (KES)", type: "number" },
    { key: "shippingFreight", label: "Shipping & Freight (KES)", type: "number" },
    { key: "grandTotal", label: "Grand Total (KES)", type: "number" },
    { key: "discrepancyNotes", label: "Discrepancy / Condition Notes", multiline: true },
    { key: "shortageDamageReportHours", label: "Shortage / Damage Reporting Window (hours)", type: "number" },
    { key: "inspectionClause", label: "Inspection Clause", multiline: true },
    { key: "serialValidationClause", label: "Serial Validation Clause", multiline: true },
    { key: "shortageDamageClause", label: "Shortage / Damage Clause", multiline: true },
    { key: "dispatchedByName", label: "Dispatched By — Printed Name" },
    { key: "driverSignature", label: "Driver Signature" },
    { key: "dispatchedDate", label: "Dispatch Date", type: "date" },
    { key: "dispatchedTime", label: "Dispatch Time", type: "time" },
    { key: "receivedByName", label: "Received By — Printed Name" },
    { key: "receivedTitle", label: "Receiver Title" },
    { key: "receiverSignature", label: "Authorized Receiver Signature" },
    { key: "receivedDate", label: "Receipt Date", type: "date" },
    { key: "receivedTime", label: "Receipt Time", type: "time" },
  ],
  grn: [
    { key: "purchaseOrderNumber", label: "Linked Purchase Order #" },
    { key: "supplierDeliveryNoteNumber", label: "Supplier Delivery Note #" },
    { key: "receivingCompany", label: "Receiving Company Name" },
    { key: "receivingFacility", label: "Receiving Facility" },
    { key: "inspectorName", label: "Inspecting Officer Name" },
    { key: "inspectorTitle", label: "Inspecting Officer Job Title" },
    { key: "supplierPin", label: "Supplier KRA PIN" },
    { key: "vehicleRegistration", label: "Delivery Vehicle Registration" },
    { key: "subtotal", label: "Subtotal (KES, excl. VAT)", type: "number" },
    { key: "vatRate", label: "KRA VAT Rate (%)", type: "number" },
    { key: "vatAmount", label: "Allocated KRA VAT (KES)", type: "number" },
    { key: "freightLandedCosts", label: "Freight / Landed Costs (KES)", type: "number" },
    { key: "netVerifiedStockValue", label: "Net Verified Stock Value (KES)", type: "number" },
    { key: "inspectorSignature", label: "Warehouse Inspector Signature" },
    { key: "inspectorDate", label: "Inspector Sign-off Date", type: "date" },
    { key: "inspectorTime", label: "Inspector Sign-off Time", type: "time" },
    { key: "managerName", label: "Authorized Store Manager Name" },
    { key: "managerSignature", label: "Authorized Store Manager Signature" },
    { key: "managerDate", label: "Manager Sign-off Date", type: "date" },
    { key: "financeVerifiedBy", label: "Finance Verification — Name" },
    { key: "financeVerificationDate", label: "Finance Verification Date", type: "date" },
    { key: "financeVerificationNotes", label: "Finance Verification Notes", multiline: true },
  ],
  "work-order": [
    { key: "projectClientName", label: "Project / Client Name" },
    { key: "assetEquipmentId", label: "Asset / Equipment ID" },
    { key: "locationOfWork", label: "Location of Work" },
    { key: "scopeOfWork", label: "Scope of Work / Technical Brief", multiline: true },
    { key: "technicianSignature", label: "Technician Signature" },
    { key: "technicianSignoffDate", label: "Technician Sign-off Date", type: "date" },
    { key: "clientSupervisorSignature", label: "Client / Supervisor Signature" },
    { key: "clientSupervisorSignoffDate", label: "Client / Supervisor Sign-off Date", type: "date" },
  ],
  imprest: [
    { key: "requestDate", label: "Date of Request", type: "date" },
    { key: "department", label: "Department" },
    { key: "employeeName", label: "Employee Name" },
    { key: "designation", label: "Designation / Title" },
    { key: "totalSpent", label: "Total Expense Spent (KES)", type: "number" },
    { key: "netBalance", label: "Net Reconciliation Balance (KES)", type: "number" },
    { key: "balanceType", label: "Balance Reconciliation", options: [
      { value: "surplus_returned", label: "Surplus Balance Returned" },
      { value: "deficit_reimbursement", label: "Deficit / Reimbursement Claimed" },
    ] },
    { key: "employeeSignature", label: "Employee Signature" },
    { key: "employeeSignoffDate", label: "Employee Sign-off Date", type: "date" },
    { key: "employeeAffirmation", label: "Employee Affirmation", multiline: true },
    { key: "financeAuditedBy", label: "Audited & Verified By (Finance)" },
    { key: "financeAuditDate", label: "Finance Audit Date", type: "date" },
    { key: "managementAuthorizedBy", label: "Authorized Management Approval" },
    { key: "managementApprovalDate", label: "Management Approval Date", type: "date" },
  ],
};

const repeatedFields: Partial<Record<OperationalDocumentType, Record<string, Array<{ key: string; label: string; type?: string }>>>> = {
  "delivery-note": {
    lineItems: [
      { key: "itemNumber", label: "Item #" },
      { key: "sku", label: "Part Number / SKU" },
      { key: "description", label: "Item Description & Specifications" },
      { key: "quantityOrdered", label: "Qty Ordered", type: "number" },
      { key: "quantityShipped", label: "Qty Shipped", type: "number" },
      { key: "unitPrice", label: "Unit Price (KES)", type: "number" },
      { key: "totalPrice", label: "Total Price (KES)", type: "number" },
      { key: "serialBatchCode", label: "Serial Number / Batch Lot Code" },
      { key: "warrantyStatus", label: "Warranty Status" },
      { key: "expiryDate", label: "Expiry Date", type: "date" },
    ],
  },
  grn: {
    lineItems: [
      { key: "itemNumber", label: "Item #" },
      { key: "supplierSku", label: "Supplier SKU" },
      { key: "description", label: "Item Description" },
      { key: "quantityPerDeliveryNote", label: "Qty per Delivery Note", type: "number" },
      { key: "quantityReceived", label: "Qty Physically Received", type: "number" },
      { key: "quantityAccepted", label: "Qty Accepted", type: "number" },
      { key: "quantityRejected", label: "Qty Rejected", type: "number" },
      { key: "rejectionReason", label: "Rejection Reason / Remarks" },
      { key: "unitPrice", label: "Unit Price (KES)", type: "number" },
    ],
  },
  "work-order": {
    materials: [
      { key: "partNumber", label: "Part Number / SKU" },
      { key: "description", label: "Material Description" },
      { key: "unit", label: "Unit Measure" },
      { key: "quantity", label: "Qty Consumed", type: "number" },
      { key: "unitCost", label: "Unit Cost (KES)", type: "number" },
      { key: "totalCost", label: "Total Cost (excl. VAT)", type: "number" },
      { key: "vat", label: "16% VAT (KES)", type: "number" },
    ],
    laborEntries: [
      { key: "technicianName", label: "Technician Name" },
      { key: "clockIn", label: "Clock-In", type: "datetime-local" },
      { key: "clockOut", label: "Clock-Out", type: "datetime-local" },
      { key: "billableHours", label: "Total Billable Hours", type: "number" },
    ],
  },
  imprest: {
    expenses: [
      { key: "date", label: "Expense Date", type: "date" },
      { key: "description", label: "Expense Description" },
      { key: "vendorName", label: "Vendor Name" },
      { key: "receiptNumber", label: "Invoice / ETR Receipt #" },
      { key: "baseCost", label: "Base Cost (excl. VAT)", type: "number" },
      { key: "vat", label: "KRA VAT (16%)", type: "number" },
      { key: "totalSpent", label: "Total Spent (KES)", type: "number" },
    ],
  },
};

interface OperationalTemplateFieldsProps {
  documentType: OperationalDocumentType;
  value?: OperationalTemplateData | null;
  onChange: Dispatch<SetStateAction<OperationalTemplateData>>;
}

export function OperationalTemplateFields({ documentType, value, onChange }: OperationalTemplateFieldsProps) {
  const data = value || createOperationalTemplateDefaults(documentType);
  const updateField = (key: string, nextValue: any) => onChange((current) => ({ ...current, [key]: nextValue }));

  return (
    <section className="space-y-5 border-t pt-5">
      <h3 className="font-semibold">Operational Template Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields[documentType].map((field) => (
          <div key={field.key} className={field.multiline ? "md:col-span-2 space-y-1" : "space-y-1"}>
            <Label htmlFor={`${documentType}-${field.key}`}>{field.label}</Label>
            {field.options ? (
              <select
                id={`${documentType}-${field.key}`}
                value={data[field.key] ?? ""}
                onChange={(event) => updateField(field.key, event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a balance outcome</option>
                {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : field.multiline ? (
              <Textarea id={`${documentType}-${field.key}`} rows={3} value={data[field.key] ?? ""} onChange={(event) => updateField(field.key, event.target.value)} />
            ) : (
              <Input
                id={`${documentType}-${field.key}`}
                type={field.type || "text"}
                min={field.type === "number" ? 0 : undefined}
                step={field.type === "number" ? "any" : undefined}
                value={data[field.key] ?? ""}
                onChange={(event) => updateField(field.key, field.type === "number" && event.target.value !== "" ? Number(event.target.value) : event.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      {documentType === "work-order" && (
        <div className="space-y-3">
          <h4 className="font-medium">Safety & Execution Checklist</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {(data.checklist || []).map((item: OperationalTemplateData, index: number) => (
              <label key={`${item.phase}-${index}`} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={Boolean(item.completed)}
                  onCheckedChange={(checked) => onChange((current) => ({
                    ...current,
                    checklist: (current.checklist || []).map((entry: OperationalTemplateData, entryIndex: number) =>
                      entryIndex === index ? { ...entry, completed: Boolean(checked) } : entry
                    ),
                  }))}
                />
                <span>{item.phase}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {Object.entries(repeatedFields[documentType] || {}).map(([key, rowFields]) => {
        const rows: OperationalTemplateData[] = Array.isArray(data[key]) ? data[key] : [];
        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{key === "lineItems" ? "Itemization" : key === "laborEntries" ? "Labor Tracking" : key === "materials" ? "Inventory & Spare Parts" : "Expense Reconciliation Ledger"}</h4>
              <Button type="button" variant="outline" size="sm" onClick={() => updateField(key, [...rows, {}])}>Add row</Button>
            </div>
            {rows.map((row, index) => (
              <div key={`${key}-${index}`} className="rounded-md border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Row {index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => updateField(key, rows.filter((_, rowIndex) => rowIndex !== index))}>Remove</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rowFields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label htmlFor={`${documentType}-${key}-${index}-${field.key}`}>{field.label}</Label>
                      <Input
                        id={`${documentType}-${key}-${index}-${field.key}`}
                        type={field.type || "text"}
                        min={field.type === "number" ? 0 : undefined}
                        step={field.type === "number" ? "any" : undefined}
                        value={row[field.key] ?? ""}
                        onChange={(event) => {
                          const nextRows = rows.map((existing, rowIndex) => rowIndex === index
                            ? { ...existing, [field.key]: field.type === "number" && event.target.value !== "" ? Number(event.target.value) : event.target.value }
                            : existing);
                          updateField(key, nextRows);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">No rows added yet.</p>}
          </div>
        );
      })}
      {documentType === "work-order" && (
        <div className="space-y-2">
          <h4 className="font-medium">Execution Task Checklist</h4>
          {(Array.isArray(data.checklist) ? data.checklist : createOperationalTemplateDefaults("work-order").checklist).map((item: OperationalTemplateData, index: number) => (
            <label key={item.phase} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(item.completed)}
                onChange={(event) => {
                  const checklist = Array.isArray(data.checklist) ? data.checklist : createOperationalTemplateDefaults("work-order").checklist;
                  updateField("checklist", checklist.map((entry: OperationalTemplateData, entryIndex: number) => entryIndex === index ? { ...entry, completed: event.target.checked } : entry));
                }}
              />
              <span>{item.phase}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
