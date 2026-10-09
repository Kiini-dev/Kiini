import type { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type OperationalDocumentType = "delivery-note" | "grn" | "work-order" | "imprest";
export type OperationalTemplateData = Record<string, any>;

type TemplateField = {
  key: string;
  label: string;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  allowCustomValue?: boolean;
  computed?: boolean;
};

type TemplateSection = {
  title: string;
  description?: string;
  fields?: TemplateField[];
  repeatKey?: string;
};

const workOrderPhases = [
  "Pre-Work Safety Audit & Isolation",
  "Disassembly & Initial Diagnostics",
  "Component Replacement & Calibration",
  "Testing & Quality Re-commissioning",
  "Site Clearance & Handover",
];

const balanceOptions = [
  { value: "surplus_returned", label: "Surplus balance returned" },
  { value: "deficit_reimbursement", label: "Deficit / reimbursement claimed" },
];

const currencyPlaceholder = "KES 0.00";
const numberPlaceholder = "Enter quantity";

export function createOperationalTemplateDefaults(type: OperationalDocumentType): OperationalTemplateData {
  const defaults: OperationalTemplateData = {
    vatRate: 16,
    lineItems: [],
  };
  if (type === "delivery-note") {
    defaults.inspectionClause = "The recipient agrees to inspect packages for security anomalies, broken seals, or visible damage before signing.";
    defaults.serialValidationClause = "Signature confirms that the serial numbers listed have been verified upon handover.";
    defaults.shortageDamageClause = "Report discrepancies, shortages, and transport damage to the supplier within the stated reporting window.";
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

function asRows(value: unknown): OperationalTemplateData[] {
  return Array.isArray(value)
    ? value.filter((row): row is OperationalTemplateData => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function amount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDeliveryNoteSubtotal(data: OperationalTemplateData): number {
  return asRows(data.lineItems).reduce(
    (sum, item) => sum + amount(item.quantityShipped) * amount(item.unitPrice),
    0,
  );
}

function getGrnLineValue(item: OperationalTemplateData): number {
  const acceptedQuantity = item.quantityAccepted !== undefined && item.quantityAccepted !== ""
    ? amount(item.quantityAccepted)
    : amount(item.quantityReceived);
  return acceptedQuantity * amount(item.unitPrice);
}

function getGrnSubtotal(data: OperationalTemplateData): number {
  return asRows(data.lineItems).reduce((sum, item) => sum + getGrnLineValue(item), 0);
}

function getImprestExpenseAmounts(item: OperationalTemplateData, vatRate: number) {
  const vat = item.vat !== undefined && item.vat !== ""
    ? amount(item.vat)
    : amount(item.baseCost) * vatRate / 100;
  return { vat, totalSpent: amount(item.baseCost) + vat };
}

function getVatRate(data: OperationalTemplateData): number {
  return data.vatRate === undefined || data.vatRate === "" ? 16 : amount(data.vatRate);
}

export function normalizeOperationalTemplateData(type: OperationalDocumentType, value: OperationalTemplateData): OperationalTemplateData {
  const data = { ...createOperationalTemplateDefaults(type), ...value };
  const vatRate = getVatRate(data);

  if (type === "delivery-note") {
    data.lineItems = asRows(data.lineItems).map((item) => ({
      ...item,
      totalPrice: amount(item.quantityShipped) * amount(item.unitPrice),
    }));
    data.subtotal = getDeliveryNoteSubtotal(data);
    data.vatRate = vatRate;
    data.vatAmount = data.subtotal * vatRate / 100;
    data.grandTotal = data.subtotal + data.vatAmount + amount(data.shippingFreight);
  }

  if (type === "grn") {
    data.lineItems = asRows(data.lineItems).map((item) => ({
      ...item,
      lineValue: getGrnLineValue(item),
    }));
    data.subtotal = getGrnSubtotal(data);
    data.vatRate = vatRate;
    data.vatAmount = data.subtotal * vatRate / 100;
    data.netVerifiedStockValue = data.subtotal + data.vatAmount + amount(data.freightLandedCosts);
  }

  if (type === "work-order") {
    data.materials = asRows(data.materials).map((item) => {
      const totalCost = amount(item.quantity) * amount(item.unitCost);
      return { ...item, totalCost, vat: totalCost * vatRate / 100 };
    });
    data.totalMaterialsCost = data.materials.reduce(
      (sum: number, item: OperationalTemplateData) => sum + item.totalCost + item.vat,
      0,
    );
    data.laborEntries = asRows(data.laborEntries);
    data.checklist = Array.isArray(data.checklist) ? data.checklist : createOperationalTemplateDefaults(type).checklist;
  }

  if (type === "imprest") {
    data.expenses = asRows(data.expenses).map((item) => ({
      ...item,
      ...getImprestExpenseAmounts(item, vatRate),
    }));
    data.totalSpent = data.expenses.reduce((sum: number, item: OperationalTemplateData) => sum + item.totalSpent, 0);
    data.initialCashFloat = amount(data.initialCashFloat);
    data.netBalance = data.initialCashFloat - data.totalSpent;
  }

  return data;
}

const sharedShipmentOptions = [
  { value: "internal-fleet", label: "Internal fleet" },
  { value: "dhl", label: "DHL" },
  { value: "wells-fargo", label: "Wells Fargo" },
  { value: "g4s", label: "G4S" },
];

const warrantyOptions = [
  { value: "under-warranty", label: "Under warranty" },
  { value: "expired", label: "Expired" },
  { value: "not-applicable", label: "Not applicable" },
];

const departmentOptions = [
  { value: "administration", label: "Administration" },
  { value: "sales-fleet", label: "Sales fleet" },
  { value: "field-operations", label: "Field operations" },
  { value: "finance", label: "Finance" },
];

const unitOptions = [
  { value: "pc", label: "Piece (pc)" },
  { value: "can", label: "Can" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "litre", label: "Litre" },
  { value: "box", label: "Box" },
  { value: "set", label: "Set" },
];

const templateSections: Record<OperationalDocumentType, TemplateSection[]> = {
  "delivery-note": [
    {
      title: "Company & client details",
      description: "Supplier, customer, and destination information for the dispatch.",
      fields: [
        { key: "purchaseOrderNumber", label: "Associated purchase order number", placeholder: "e.g. PO-XXXXX" },
        { key: "salesInvoiceNumber", label: "Sales invoice number", placeholder: "e.g. INV-XXXXX" },
        { key: "supplierPin", label: "Supplier KRA PIN", placeholder: "Enter the supplier's KRA PIN" },
        { key: "companyName", label: "Supplier company name", placeholder: "Your company name" },
        { key: "dispatchWarehouse", label: "Dispatch warehouse", placeholder: "e.g. Nairobi Main Logistics Hub" },
        { key: "supplierEmail", label: "Supplier contact email", type: "email", placeholder: "logistics@company.com" },
        { key: "supplierPhone", label: "Supplier phone", type: "tel", placeholder: "+254 7XX XXX XXX" },
        { key: "customerName", label: "Customer / ship-to name", placeholder: "Client company or individual name" },
        { key: "deliveryAddress", label: "Delivery address", multiline: true, placeholder: "Building, office, town, and other delivery directions" },
        { key: "customerContact", label: "Customer contact person", placeholder: "Receiver's full name" },
        { key: "customerPhone", label: "Customer phone", type: "tel", placeholder: "+254 7XX XXX XXX" },
      ],
    },
    {
      title: "Shipment & courier",
      description: "Carrier details and shipment tracking information.",
      fields: [
        { key: "shippingMethod", label: "Shipping method / carrier", placeholder: "Select or enter a carrier", options: sharedShipmentOptions, allowCustomValue: true },
        { key: "trackingNumber", label: "Tracking / waybill number", placeholder: "Enter the carrier tracking ID" },
        { key: "packageCount", label: "Packages / pallets", type: "number", placeholder: numberPlaceholder },
        { key: "grossWeight", label: "Total gross weight", placeholder: "e.g. 45.5 kg" },
      ],
    },
    {
      title: "Priced itemization & asset tracking",
      description: "Record shipped quantities, asset identifiers, warranty details, and expiry dates.",
      repeatKey: "lineItems",
    },
    {
      title: "Financial summary",
      description: "Subtotal and VAT are calculated from shipped quantities and unit prices.",
      fields: [
        { key: "subtotal", label: "Subtotal (KES, excl. VAT)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "vatRate", label: "KRA VAT rate (%)", type: "number", placeholder: "16" },
        { key: "vatAmount", label: "KRA VAT (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "shippingFreight", label: "Shipping & freight (KES)", type: "number", placeholder: currencyPlaceholder },
        { key: "grandTotal", label: "Grand total (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
      ],
    },
    {
      title: "Terms, condition & proof of delivery",
      description: "Capture any dispatch condition notes and both parties' proof of handover.",
      fields: [
        { key: "discrepancyNotes", label: "Discrepancy / condition notes", multiline: true, placeholder: "Describe visible condition, packaging, or any dispatch discrepancies" },
        { key: "shortageDamageReportHours", label: "Shortage / damage reporting window (hours)", type: "number", placeholder: "e.g. 24 or 48" },
        { key: "inspectionClause", label: "Inspection clause", multiline: true, placeholder: "Inspection terms shown on the exported document" },
        { key: "serialValidationClause", label: "Serial validation clause", multiline: true, placeholder: "Serial number verification terms shown on the exported document" },
        { key: "shortageDamageClause", label: "Shortage / damage clause", multiline: true, placeholder: "Discrepancy reporting terms shown on the exported document" },
        { key: "dispatchedByName", label: "Dispatched by — printed name", placeholder: "Driver or courier's full name" },
        { key: "driverSignature", label: "Driver signature", placeholder: "Enter name or signature reference" },
        { key: "dispatchedDate", label: "Dispatch date", type: "date" },
        { key: "dispatchedTime", label: "Dispatch time", type: "time" },
        { key: "receivedByName", label: "Received by — printed name", placeholder: "Authorized receiver's full name" },
        { key: "receivedTitle", label: "Receiver title", placeholder: "e.g. Store Manager" },
        { key: "receiverSignature", label: "Authorized receiver signature", placeholder: "Enter name or signature reference" },
        { key: "receivedDate", label: "Receipt date", type: "date" },
        { key: "receivedTime", label: "Receipt time", type: "time" },
      ],
    },
  ],
  grn: [
    {
      title: "Warehouse & supplier registry",
      description: "Link the supplier paperwork to the receiving entity and inspection team.",
      fields: [
        { key: "receiptDate", label: "Date of receipt", type: "date" },
        { key: "purchaseOrderNumber", label: "Linked purchase order number", placeholder: "e.g. PO-XXXXX" },
        { key: "supplierDeliveryNoteNumber", label: "Supplier delivery note number", placeholder: "e.g. DN-XXXXX" },
        { key: "receivingCompany", label: "Receiving company name", placeholder: "Your company name" },
        { key: "receivingFacility", label: "Receiving facility", placeholder: "e.g. Main Store / Warehouse B" },
        { key: "supplierName", label: "Supplier entity name", placeholder: "Vendor company name" },
        { key: "supplierPin", label: "Supplier KRA PIN", placeholder: "Enter the supplier's KRA PIN" },
        { key: "vehicleRegistration", label: "Delivery vehicle registration", placeholder: "e.g. KXX 000X" },
        { key: "inspectorName", label: "Inspecting officer name", placeholder: "Full name" },
        { key: "inspectorTitle", label: "Inspecting officer job title", placeholder: "e.g. Warehouse Inspector" },
      ],
    },
    {
      title: "Quantity & quality audit",
      description: "Reconcile the supplier's delivery note against the physical count and quality inspection.",
      repeatKey: "lineItems",
    },
    {
      title: "Financial accounting verification",
      description: "Net stock value is calculated from accepted quantities, VAT, and landed costs.",
      fields: [
        { key: "subtotal", label: "Subtotal value (KES, excl. VAT)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "vatRate", label: "KRA VAT rate (%)", type: "number", placeholder: "16" },
        { key: "vatAmount", label: "KRA VAT allocated (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "freightLandedCosts", label: "Freight / landed costs (KES)", type: "number", placeholder: currencyPlaceholder },
        { key: "netVerifiedStockValue", label: "Net verified stock value (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
      ],
    },
    {
      title: "Quality assurance sign-off",
      fields: [
        { key: "inspectorSignature", label: "Warehouse inspector signature", placeholder: "Enter name or signature reference" },
        { key: "inspectorDate", label: "Inspector sign-off date", type: "date" },
        { key: "inspectorTime", label: "Inspector sign-off time", type: "time" },
        { key: "managerName", label: "Authorized store manager name", placeholder: "Full name" },
        { key: "managerSignature", label: "Authorized store manager signature", placeholder: "Enter name or signature reference" },
        { key: "managerDate", label: "Manager sign-off date", type: "date" },
        { key: "financeVerifiedBy", label: "Finance verification — name", placeholder: "Full name" },
        { key: "financeVerificationDate", label: "Finance verification date", type: "date" },
        { key: "financeVerificationNotes", label: "Finance verification notes", multiline: true, placeholder: "Add invoice reconciliation or audit notes" },
      ],
    },
  ],
  "work-order": [
    {
      title: "Task identification & customer context",
      description: "Set priority, key dates, ownership, location, and the technical brief.",
      fields: [
        { key: "priority", label: "Priority level", placeholder: "Select priority", options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ] },
        { key: "allocationDate", label: "Allocation date", type: "date" },
        { key: "targetCompletionDate", label: "Target completion date", type: "date" },
        { key: "projectClientName", label: "Project / client name", placeholder: "Internal department or external customer" },
        { key: "assetEquipmentId", label: "Asset / equipment ID", placeholder: "e.g. Generator Gen-04 or Fleet Vehicle KXX 000X" },
        { key: "locationOfWork", label: "Location of work", placeholder: "Site, floor, room, or branch" },
        { key: "assignedTechnician", label: "Assigned technician / team lead", placeholder: "Technician name" },
        { key: "scopeOfWork", label: "Scope of work / technical brief", multiline: true, placeholder: "Describe the fault, planned work, and completion requirements" },
      ],
    },
    {
      title: "Execution task checklist",
      description: "Tick each phase as the lead technician completes it.",
    },
    {
      title: "Inventory & spare parts materials log",
      description: "Track inventory used to complete the work order. Cost and VAT are calculated.",
      repeatKey: "materials",
    },
    {
      title: "Materials cost summary",
      fields: [
        { key: "totalMaterialsCost", label: "Total materials cost (incl. VAT, KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
      ],
    },
    {
      title: "Labor tracking",
      description: "Record technician attendance and billable hours for the job.",
      repeatKey: "laborEntries",
    },
    {
      title: "Operational completion acceptance",
      fields: [
        { key: "technicianSignature", label: "Technician signature", placeholder: "Enter name or signature reference" },
        { key: "technicianSignoffDate", label: "Technician sign-off date", type: "date" },
        { key: "clientSupervisorSignature", label: "Client / supervisor signature", placeholder: "Enter name or signature reference" },
        { key: "clientSupervisorSignoffDate", label: "Client / supervisor sign-off date", type: "date" },
      ],
    },
  ],
  imprest: [
    {
      title: "Applicant profile & float allocation",
      description: "Identify the requester and document the purpose and approved advance.",
      fields: [
        { key: "requestDate", label: "Date of request", type: "date" },
        { key: "department", label: "Department", placeholder: "Select or enter a department", options: departmentOptions, allowCustomValue: true },
        { key: "employeeName", label: "Employee name", placeholder: "Name of staff requesting funds" },
        { key: "designation", label: "Designation / title", placeholder: "Job title" },
        { key: "purposeOfAdvance", label: "Purpose of advance", multiline: true, placeholder: "Explain the official business purpose of the cash advance" },
        { key: "initialCashFloat", label: "Approved cash advance float (KES)", type: "number", placeholder: currencyPlaceholder },
      ],
    },
    {
      title: "Expense reconciliation ledger",
      description: "Enter each expense and its ETR receipt details. Leave VAT empty to calculate 16%; enter 0 for an exempt expense.",
      repeatKey: "expenses",
    },
    {
      title: "Balance reconciliation summary",
      description: "Total spent and the balance are calculated from the advance and expense ledger.",
      fields: [
        { key: "totalSpent", label: "Total expense spent (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "netBalance", label: "Net reconciliation balance (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
        { key: "balanceType", label: "Balance reconciliation", placeholder: "Select the balance outcome", options: balanceOptions },
      ],
    },
    {
      title: "Authorization & affirmation",
      fields: [
        { key: "employeeAffirmation", label: "Employee affirmation", multiline: true, placeholder: "Enter the employee's certification of business expenses and attached receipts" },
        { key: "employeeSignature", label: "Employee signature", placeholder: "Enter name or signature reference" },
        { key: "employeeSignoffDate", label: "Employee sign-off date", type: "date" },
        { key: "financeAuditedBy", label: "Audited & verified by (Finance)", placeholder: "Full name" },
        { key: "financeAuditDate", label: "Finance audit date", type: "date" },
        { key: "managementAuthorizedBy", label: "Authorized management approval", placeholder: "Full name" },
        { key: "managementApprovalDate", label: "Management approval date", type: "date" },
      ],
    },
  ],
};

const repeatedFields: Partial<Record<OperationalDocumentType, Record<string, TemplateField[]>>> = {
  "delivery-note": {
    lineItems: [
      { key: "itemNumber", label: "Item #", placeholder: "001" },
      { key: "sku", label: "Part number / SKU", placeholder: "e.g. SKU-123" },
      { key: "description", label: "Item description & specifications", placeholder: "Name, model, size, or description" },
      { key: "quantityOrdered", label: "Quantity ordered", type: "number", placeholder: numberPlaceholder },
      { key: "quantityShipped", label: "Quantity shipped", type: "number", placeholder: numberPlaceholder },
      { key: "unitPrice", label: "Unit price (KES)", type: "number", placeholder: currencyPlaceholder },
      { key: "totalPrice", label: "Total price (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
      { key: "serialBatchCode", label: "Serial number / batch lot code", placeholder: "e.g. S/N: 8A72-991A-KE" },
      { key: "warrantyStatus", label: "Warranty status", placeholder: "Select or enter warranty status", options: warrantyOptions, allowCustomValue: true },
      { key: "expiryDate", label: "Expiry date (if applicable)", type: "date" },
    ],
  },
  grn: {
    lineItems: [
      { key: "itemNumber", label: "Item #", placeholder: "001" },
      { key: "supplierSku", label: "Supplier SKU", placeholder: "e.g. SKU-123" },
      { key: "description", label: "Item description", placeholder: "Item name or description" },
      { key: "quantityPerDeliveryNote", label: "Quantity per delivery note", type: "number", placeholder: numberPlaceholder },
      { key: "quantityReceived", label: "Quantity physically received", type: "number", placeholder: numberPlaceholder },
      { key: "quantityAccepted", label: "Quantity accepted", type: "number", placeholder: numberPlaceholder },
      { key: "quantityRejected", label: "Quantity rejected", type: "number", placeholder: numberPlaceholder },
      { key: "rejectionReason", label: "Rejection reason / remarks", placeholder: "Select or enter inspection remarks", options: [
        { value: "accepted-in-full", label: "Accepted in full" },
        { value: "damaged", label: "Damaged" },
        { value: "shortage", label: "Shortage / missing units" },
        { value: "wrong-item", label: "Incorrect item supplied" },
      ], allowCustomValue: true },
      { key: "unitPrice", label: "Unit price (KES)", type: "number", placeholder: currencyPlaceholder },
      { key: "lineValue", label: "Accepted value (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
    ],
  },
  "work-order": {
    materials: [
      { key: "partNumber", label: "Part number / SKU", placeholder: "e.g. PT-882" },
      { key: "description", label: "Material description", placeholder: "e.g. Synthetic Engine Oil 5L" },
      { key: "unit", label: "Unit measure", placeholder: "Select or enter a unit", options: unitOptions, allowCustomValue: true },
      { key: "quantity", label: "Quantity consumed", type: "number", placeholder: numberPlaceholder },
      { key: "unitCost", label: "Unit cost (KES)", type: "number", placeholder: currencyPlaceholder },
      { key: "totalCost", label: "Total cost (excl. VAT)", type: "number", computed: true, placeholder: currencyPlaceholder },
      { key: "vat", label: "16% VAT (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
    ],
    laborEntries: [
      { key: "technicianName", label: "Technician name", placeholder: "Full name" },
      { key: "clockIn", label: "Clock-in date and time", type: "datetime-local" },
      { key: "clockOut", label: "Clock-out date and time", type: "datetime-local" },
      { key: "billableHours", label: "Total billable hours", type: "number", placeholder: "e.g. 4.5" },
    ],
  },
  imprest: {
    expenses: [
      { key: "date", label: "Expense date", type: "date" },
      { key: "description", label: "Expense description", placeholder: "e.g. Fuel at Rubis Station Kitengela" },
      { key: "vendorName", label: "Vendor name", placeholder: "Vendor or service provider" },
      { key: "receiptNumber", label: "Invoice / ETR receipt number", placeholder: "e.g. ETR-XXXX or N/A" },
      { key: "baseCost", label: "Base cost (excl. VAT)", type: "number", placeholder: currencyPlaceholder },
      { key: "vat", label: "KRA VAT", type: "number", placeholder: "Auto-calculated at 16%; enter 0 if exempt" },
      { key: "totalSpent", label: "Total spent (KES)", type: "number", computed: true, placeholder: currencyPlaceholder },
    ],
  },
};

interface OperationalTemplateFieldsProps {
  documentType: OperationalDocumentType;
  value?: OperationalTemplateData | null;
  onChange: Dispatch<SetStateAction<OperationalTemplateData>>;
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function getComputedValue(documentType: OperationalDocumentType, key: string, data: OperationalTemplateData): number {
  const vatRate = getVatRate(data);
  if (documentType === "delivery-note") {
    const subtotal = getDeliveryNoteSubtotal(data);
    if (key === "subtotal") return subtotal;
    if (key === "vatAmount") return subtotal * vatRate / 100;
    if (key === "grandTotal") return subtotal + subtotal * vatRate / 100 + amount(data.shippingFreight);
    if (key === "totalPrice") return amount(data.quantityShipped) * amount(data.unitPrice);
  }
  if (documentType === "grn") {
    const subtotal = getGrnSubtotal(data);
    if (key === "subtotal") return subtotal;
    if (key === "vatAmount") return subtotal * vatRate / 100;
    if (key === "netVerifiedStockValue") return subtotal + subtotal * vatRate / 100 + amount(data.freightLandedCosts);
    if (key === "lineValue") return getGrnLineValue(data);
  }
  if (documentType === "work-order") {
    const totalCost = amount(data.quantity) * amount(data.unitCost);
    if (key === "totalCost") return totalCost;
    if (key === "vat") return totalCost * vatRate / 100;
    if (key === "totalMaterialsCost") {
      return asRows(data.materials).reduce((sum, item) => {
        const itemTotal = amount(item.quantity) * amount(item.unitCost);
        return sum + itemTotal + itemTotal * vatRate / 100;
      }, 0);
    }
  }
  if (documentType === "imprest") {
    const { vat, totalSpent } = getImprestExpenseAmounts(data, vatRate);
    if (key === "vat") return data.vat !== undefined && data.vat !== "" ? vat : totalSpent - amount(data.baseCost);
    if (key === "totalSpent") {
      if (!Array.isArray(data.expenses)) return totalSpent;
      return asRows(data.expenses).reduce((sum, item) => sum + getImprestExpenseAmounts(item, vatRate).totalSpent, 0);
    }
    if (key === "netBalance") {
      const total = asRows(data.expenses).reduce((sum, item) => sum + getImprestExpenseAmounts(item, vatRate).totalSpent, 0);
      return amount(data.initialCashFloat) - total;
    }
  }
  return amount(data[key]);
}

function getGroupTitle(key: string): string {
  switch (key) {
    case "lineItems": return "Itemization";
    case "materials": return "Materials";
    case "laborEntries": return "Labor entries";
    default: return "Expense entries";
  }
}

function renderField(
  documentType: OperationalDocumentType,
  field: TemplateField,
  data: OperationalTemplateData,
  onValueChange: (value: unknown) => void,
  id: string,
) {
  const fieldValue = field.computed
    ? formatAmount(getComputedValue(documentType, field.key, data))
    : data[field.key] ?? "";

  if (field.options) {
    return (
      <SearchableSelect
        id={id}
        value={String(fieldValue)}
        options={field.options}
        onValueChange={onValueChange}
        placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
        searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
        emptyMessage="No matching options."
        allowCustomValue={field.allowCustomValue}
        customValueLabel={(customValue) => `Use "${customValue}"`}
      />
    );
  }

  if (field.multiline) {
    return (
      <Textarea
        id={id}
        rows={3}
        value={String(fieldValue)}
        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
        readOnly={field.computed}
        onChange={(event) => onValueChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      id={id}
      type={field.type || "text"}
      min={field.type === "number" && !field.computed ? 0 : undefined}
      step={field.type === "number" ? "any" : undefined}
      value={fieldValue}
      placeholder={field.placeholder || (field.type === "number" ? numberPlaceholder : `Enter ${field.label.toLowerCase()}`)}
      readOnly={field.computed}
      className={field.computed ? "bg-muted/50 text-muted-foreground" : undefined}
      onChange={(event) => onValueChange(field.type === "number" && event.target.value !== "" ? Number(event.target.value) : event.target.value)}
    />
  );
}

export function OperationalTemplateFields({ documentType, value, onChange }: OperationalTemplateFieldsProps) {
  const data = value || createOperationalTemplateDefaults(documentType);
  const updateField = (key: string, nextValue: unknown) => onChange((current) => ({ ...current, [key]: nextValue }));
  const sections = templateSections[documentType];

  return (
    <section className="space-y-4 border-t pt-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Operational document details</h3>
        <p className="mt-1 text-sm text-muted-foreground">Complete the sections below. Fields and totals are included in the document export.</p>
      </div>

      {sections.map((section) => {
        if (section.repeatKey) {
          const key = section.repeatKey;
          const rowFields = repeatedFields[documentType]?.[key] || [];
          const rows = asRows(data[key]);
          return (
            <section key={section.title} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="font-semibold">{section.title}</h4>
                  {section.description && <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>}
                </div>
                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => updateField(key, [...rows, {}])}>
                  <Plus className="mr-2 size-4" />
                  Add {key === "lineItems" ? "item" : key === "materials" ? "material" : key === "laborEntries" ? "technician" : "expense"}
                </Button>
              </div>
              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div key={`${key}-${index}`} className="space-y-4 rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium">{getGroupTitle(key)} {index + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${getGroupTitle(key).toLowerCase()} ${index + 1}`}
                        onClick={() => updateField(key, rows.filter((_, rowIndex) => rowIndex !== index))}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {rowFields.map((field) => {
                        const id = `${documentType}-${key}-${index}-${field.key}`;
                        return (
                          <div key={field.key} className={field.multiline ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}>
                            <Label htmlFor={id} className="text-sm">{field.label}</Label>
                            {renderField(documentType, field, row, (nextValue) => {
                              const nextRows = rows.map((existing, rowIndex) => rowIndex === index
                                ? { ...existing, [field.key]: nextValue }
                                : existing);
                              updateField(key, nextRows);
                            }, id)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {rows.length === 0 && (
                  <div className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    No {key === "lineItems" ? "items" : key === "materials" ? "materials" : key === "laborEntries" ? "labor entries" : "expenses"} added yet. Add one to capture the details.
                  </div>
                )}
              </div>
            </section>
          );
        }

        const isChecklist = documentType === "work-order" && section.title === "Execution task checklist";
        return (
          <section key={section.title} className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
            <div>
              <h4 className="font-semibold">{section.title}</h4>
              {section.description && <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>}
            </div>
            {isChecklist && (
              <div className="grid gap-3 sm:grid-cols-2">
                {asRows(data.checklist).map((item, index) => (
                  <label key={`${item.phase}-${index}`} className="flex items-start gap-3 rounded-lg border bg-background p-3 text-sm">
                    <Checkbox
                      checked={Boolean(item.completed)}
                      onCheckedChange={(checked) => updateField(
                        "checklist",
                        asRows(data.checklist).map((entry, entryIndex) => entryIndex === index
                          ? { ...entry, completed: Boolean(checked) }
                          : entry),
                      )}
                    />
                    <span className="leading-5">{item.phase}</span>
                  </label>
                ))}
              </div>
            )}
            {section.fields && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.fields.map((field) => {
                  const id = `${documentType}-${field.key}`;
                  return (
                    <div key={field.key} className={field.multiline ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}>
                      <Label htmlFor={id} className="text-sm">{field.label}</Label>
                      {renderField(documentType, field, data, (nextValue) => updateField(field.key, nextValue), id)}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </section>
  );
}
