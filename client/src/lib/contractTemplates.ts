export const CONTRACT_TYPES = [
  { value: "service", label: "Service Agreement" },
  { value: "lease", label: "Lease Agreement" },
  { value: "supply", label: "Supply Contract" },
  { value: "maintenance", label: "Maintenance Contract" },
  { value: "consulting", label: "Consulting Agreement" },
  { value: "employment", label: "Employment Contract" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "partnership", label: "Partnership Agreement" },
  { value: "licensing", label: "Licensing Agreement" },
  { value: "other", label: "Other" },
] as const;

export interface ContractTemplateFields {
  name: string;
  description: string;
  paymentTerms: string;
  terminationTerms: string;
  confidentialityTerms: string;
  disputeResolution: string;
}

export interface ContractDraftForm extends ContractTemplateFields {
  contractType: string;
}

const REVIEW_NOTICE = "Draft template: complete all bracketed or project-specific details and have the agreement reviewed by a qualified legal professional in the governing jurisdiction before signature.";
const DEFAULT_PAYMENT = "The parties will confirm the fees, currency, applicable taxes, invoicing milestones, payment due date, and any approved expenses in writing before work or delivery begins. No additional charge is due unless approved in writing by both parties.";
const DEFAULT_TERMINATION = "Either party may terminate for a material breach that remains uncured 30 days after written notice. Either party may terminate for convenience on 30 days' written notice. On termination, the parties will settle approved amounts for work completed and return the other party's property.";
const DEFAULT_CONFIDENTIALITY = "Each party will protect the other party's non-public business, technical, financial, personal, and operational information; use it only to perform this agreement; and disclose it only to personnel who need it and are bound by confidentiality duties. These duties do not apply to information that is public without breach, independently developed, or lawfully received without restriction. On request or termination, confidential information will be returned or securely deleted, subject to lawful retention.";
const DEFAULT_DISPUTES = "The parties will first try in good faith to resolve a dispute through authorized representatives. If unresolved within 30 days, either party may refer it to mediation in the governing-law jurisdiction before commencing court proceedings, unless urgent interim relief is needed.";

const TEMPLATES: Record<string, Omit<ContractTemplateFields, "name">> = {
  service: {
    description: [
      "SERVICES AND DELIVERABLES",
      "The service provider will provide the services and deliverables agreed in this contract and any written statement of work approved by both parties. For digital marketing or social-media work, the parties will list the mutually selected platforms, campaign strategy, content and creative responsibilities, publishing schedule, approval process, and any excluded or separately charged activities. Changes require written approval.",
      "ACCESS, INSTALLATION AND CLIENT SUPPORT",
      "Where work takes place at the client's premises, the client will arrange reasonable, supervised access at agreed times. Equipment locations and any installation work must be agreed before installation. For CCTV work, the statement of work should specify the agreed camera count and equipment (which may include cabling, a DVR, monitor, and UPS), camera positions, and any property access arrangements. Cameras must follow applicable CCTV policies and must not be positioned to intrude into private spaces. Where remote access is required, the client will provide an operational router and agreed internet capacity (the supplied CCTV guide specifies a minimum 4 Mbps), power, and permissions. The parties will state who bears the ongoing utility and connectivity costs; these remain the client's responsibility unless agreed otherwise.",
      "PRIVACY, DATA AND DIGITAL SERVICES",
      "Each party will comply with applicable privacy and data-protection laws. Any monitoring, recording, account access, or collection of personal data must be limited to the agreed purpose, supported by appropriate notices and permissions, and configured to avoid private areas where applicable. Client data remains the client's property and will be used only to perform the services; on termination, the provider will return or securely delete it as instructed, subject to legal retention duties. For digital or social-media services, the provider will use client-approved accounts and content, follow the agreed publishing and approval process, coordinate consistent communications across agreed platforms, and report agreed reach, engagement, influence, and feedback monthly.",
      "EQUIPMENT AND THIRD-PARTY PLATFORMS",
      "The applicable statement of work will identify supplied equipment and state when title transfers, any warranty, and who is responsible for maintenance. Third-party platform availability, connectivity, and changes outside a party's control are not guaranteed by the provider.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The parties will select and record the applicable retainer, milestone, campaign, or other pricing model and rates in writing before services begin. The client will pay retainers at the start of the agreed billing period and other invoices within the number of days stated on the invoice or payment schedule. The client will bear out-of-pocket expenses, travel, media buying, licensed content, video creation, application development, and other out-of-scope costs only where specifically approved in writing in advance. Taxes and any approved advertising or third-party platform spend will be identified separately.",
    terminationTerms: "The parties will specify any initial evaluation period, renewal process, and notice period in the contract particulars. After any agreed minimum period, either party may terminate for convenience on the stated written notice; either party may terminate for a material breach not remedied within 30 days after written notice. The client will pay for services completed and approved non-cancellable commitments through the effective termination date. The provider will complete agreed pending work through that date, return client property and data, and cooperate in transferring client-owned account access. Any continuing monitoring, hosting, or support after termination must be expressly agreed.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: "The parties will first try in good faith to resolve a dispute through authorized representatives. Any dispute not resolved within 30 days will be referred to arbitration by a sole arbitrator jointly appointed by the parties, in the seat and under the arbitration law specified for this contract. If the parties cannot agree on an arbitrator, appointment will be made under that law. The proceedings will be conducted in English unless agreed otherwise, and the award will bind both parties subject to applicable law. The arbitrator may allocate costs in the award. Either party may seek urgent interim relief from a court with jurisdiction.",
  },
  lease: {
    description: [
      "PROPERTY AND PERMITTED USE",
      "The lessor grants the lessee use of the premises or asset described here: [identify premises/asset, location, boundaries, and included items]. The permitted use is [state use]. The lessee will not assign, sublet, alter, or use the property unlawfully without the lessor's prior written consent.",
      "POSSESSION, CARE AND ACCESS",
      "Possession begins on the start date. The lessee will keep the property reasonably clean, promptly report damage, and allow reasonable inspection or repairs on prior notice, except in an emergency. Responsibility for routine maintenance, structural repairs, utilities, insurance, and any deposit must be completed in the specific terms before signing.",
      "The parties should attach an inventory and condition report and record any required permits, service charges, renewal options, and return condition.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The lessee will pay rent or the agreed lease consideration in the amount and at the frequency stated in the contract value and any attached schedule. The parties must specify the due date, deposit, permitted deductions, utilities, service charges, taxes, late-payment treatment, and payment instructions before signing.",
    terminationTerms: "Expiry, renewal, early termination rights, notice method, and any break fee must be stated in the executed lease and remain subject to mandatory local law. On expiry or termination, the lessee will vacate and return the property, keys, and included items in the agreed condition, fair wear and tear excepted. The parties will document any deposit reconciliation.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  supply: {
    description: [
      "GOODS AND SPECIFICATIONS",
      "The supplier will provide the goods, quantities, quality standards, packaging, and any required certificates described in an order or schedule approved by both parties. No substitution is permitted without the buyer's written approval.",
      "DELIVERY AND ACCEPTANCE",
      "The parties will confirm delivery locations, dates, shipping responsibility, inspection period, and acceptance criteria in writing. The buyer may notify the supplier of shortages, visible damage, or non-conforming goods within a reasonable inspection period, and the supplier will replace, repair, or refund the affected goods as agreed.",
      "The order or schedule should identify warranties, installation or training services, title and risk transfer, and any applicable product-safety requirements.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The buyer will pay the agreed contract value for conforming goods against a valid invoice and delivery evidence. The order must state any deposit, milestones, taxes, shipping charges, currency, and due date. Disputed amounts may be withheld while the parties resolve the documented issue; undisputed amounts remain payable.",
    terminationTerms: "Either party may terminate for material breach not cured within 30 days after written notice. The buyer may cancel undelivered orders where cancellation is permitted by the applicable order. On termination, the supplier will refund prepaid amounts for goods not delivered, and the buyer will pay for conforming goods already accepted.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  maintenance: {
    description: [
      "MAINTENANCE SERVICES",
      "The provider will maintain the assets identified in an agreed asset schedule. The schedule should state asset identifiers and locations, covered preventive tasks, inspection frequency, service hours, response targets, reporting requirements, and any service-level credits.",
      "ACCESS, FAULTS AND PARTS",
      "The customer will provide safe access and report faults with available diagnostic information. The provider will record work performed and obtain approval before undertaking out-of-scope repairs or purchasing chargeable parts. Emergency response, replacement equipment, consumables, and third-party warranties must be expressly identified.",
      "The agreement does not guarantee uninterrupted operation where faults arise from misuse, unauthorized modification, utility or network failure, or circumstances beyond the provider's reasonable control, subject to applicable law.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The customer will pay the agreed maintenance fee on the stated billing cycle. The contract or asset schedule must identify included labor and parts, call-out charges, out-of-hours rates, taxes, approved expenses, and payment due dates. Out-of-scope work requires prior written approval and a quotation.",
    terminationTerms: "Either party may terminate for material breach not cured within 30 days after written notice, or for convenience on 30 days' written notice. On termination, the provider will hand over maintenance records and return customer equipment or access credentials. Fees for completed service and approved parts remain payable.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  consulting: {
    description: [
      "CONSULTING SCOPE AND DELIVERABLES",
      "The consultant will perform the advisory services and provide the deliverables, milestones, and acceptance criteria described in an approved statement of work. The client will provide timely access to relevant personnel, records, and decisions. The consultant will not make commitments on the client's behalf.",
      "Deliverables are prepared for the client's internal use for the stated purpose. Neither party guarantees a particular business outcome. Any implementation, regulated professional advice, or additional services outside the written scope require a separate written agreement.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: DEFAULT_PAYMENT,
    terminationTerms: DEFAULT_TERMINATION,
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  employment: {
    description: [
      "ROLE AND EMPLOYMENT DETAILS",
      "The employer appoints the employee to the position of [job title], reporting to [manager], at [work location or remote arrangement], beginning on the start date. The employee's duties, working hours, probation (if any), leave, benefits, equipment, and applicable workplace policies must be completed in the contract or an attached schedule.",
      "The employee will perform duties with reasonable care, comply with lawful instructions and workplace policies, protect confidential information, and disclose any material conflict of interest. The employer will provide the agreed tools, a safe working environment, and required employment information.",
      "This draft is not a substitute for mandatory terms under applicable employment, wage, tax, social-security, health and safety, or collective-bargaining law. Complete compensation and statutory particulars before signature.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The employer will pay the employee the gross salary and any allowances or benefits specified in the written compensation schedule, less lawful deductions and withholdings. The schedule must state the pay frequency, currency, benefits, expense policy, and any bonus or commission conditions. Statutory contributions and payroll taxes will be handled as required by applicable law.",
    terminationTerms: "Probation, notice, grounds for termination, disciplinary procedure, final pay, accrued leave, and return of employer property must comply with applicable employment law and be stated in the executed terms. Nothing in this draft limits a non-waivable statutory right. On separation, the employee will return employer property and confidential information.",
    confidentialityTerms: "During and after employment, the employee will protect the employer's non-public business, customer, personnel, technical, and financial information; use it only for work; and disclose it only when authorized or legally required. This does not restrict lawful protected disclosures, reporting to regulators, or rights that cannot be waived by law. Employer records and work product created within the role remain subject to applicable law and the employer's documented IP policy.",
    disputeResolution: "Employment disputes will be handled through the employer's documented grievance process where appropriate, without limiting either party's right to use any mandatory statutory procedure, labor office, tribunal, or court with jurisdiction.",
  },
  nda: {
    description: [
      "PURPOSE",
      "The parties may exchange confidential information solely to evaluate or perform [describe the permitted business purpose]. Each party will use the information only for that purpose and will protect it using at least reasonable care.",
      "CONFIDENTIAL INFORMATION AND EXCLUSIONS",
      "Confidential information includes non-public commercial, customer, financial, technical, security, and personal information disclosed in any form and identified as confidential or reasonably understood to be confidential. It excludes information demonstrably public without breach, already lawfully known, independently developed, or received lawfully from a third party without restriction.",
      "A receiving party may disclose information to personnel and professional advisers who need it for the purpose and are bound by confidentiality duties. If disclosure is legally compelled, it will give prior notice where lawful and disclose only what is required. On request or completion of the purpose, it will return or securely delete the information, subject to lawful archival copies.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "This agreement creates no payment obligation by itself. Any paid evaluation, services, or transaction must be set out in a separate written agreement signed by both parties.",
    terminationTerms: "Either party may end information exchanges by written notice. Confidentiality obligations continue for five years from disclosure; trade secrets remain protected for as long as they qualify as trade secrets under applicable law. Ending the agreement does not affect accrued rights or obligations.",
    confidentialityTerms: "The confidentiality obligations and permitted disclosures are set out in the scope section above. The receiving party will promptly notify the disclosing party of any known unauthorized access or disclosure and reasonably cooperate to limit further disclosure.",
    disputeResolution: DEFAULT_DISPUTES,
  },
  partnership: {
    description: [
      "PURPOSE AND CONTRIBUTIONS",
      "The parties will collaborate on [describe the venture, project, or opportunity]. Each party's contribution, responsibilities, decision rights, personnel, resources, and delivery milestones must be specified in a signed schedule.",
      "GOVERNANCE, FINANCES AND INTELLECTUAL PROPERTY",
      "The parties will appoint authorized representatives and document decisions in writing. Any revenue share, costs, losses, tax reporting, bank authority, and audit rights must be agreed in a financial schedule before commitments are made. Each party retains its pre-existing intellectual property; ownership or licensing of jointly developed work must be specified in writing.",
      "This agreement does not create an employment, agency, fiduciary, or general partnership relationship unless the parties expressly establish one in a signed instrument and satisfy applicable law. Neither party may bind the other without written authority.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "No contribution, revenue share, expense reimbursement, or distribution is due except as expressly set out in a written financial schedule approved by both parties. The schedule must state calculation method, records, invoicing, payment dates, taxes, and any audit process.",
    terminationTerms: "A party may terminate for material breach not cured within 30 days after written notice, or as otherwise stated in a project schedule. The parties will stop new commitments, settle approved accrued amounts, return property, and follow the agreed transition and allocation of jointly developed work. Any wind-down or buyout terms must be stated in writing.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  licensing: {
    description: [
      "LICENSED MATERIAL AND GRANT",
      "The licensor grants the licensee a [non-exclusive/exclusive], [non-transferable/transferable] license to use [identify software, content, trademark, or other intellectual property] for [purpose], in [territory], during the contract term. Any user, copy, platform, sublicensing, modification, and usage limits must be completed in a signed schedule.",
      "OWNERSHIP, RESTRICTIONS AND SUPPORT",
      "The licensor retains ownership of the licensed material and related intellectual property. The licensee will not remove notices, reverse engineer where prohibited by law, or exceed the granted rights. Updates, support, service levels, third-party components, security responsibilities, and usage reporting must be stated in the applicable schedule.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: "The licensee will pay the license fees, recurring charges, usage fees, taxes, and any approved support fees specified in the pricing schedule. The schedule must identify the billing period, metrics, renewal pricing, invoice due date, and consequences of undisputed late payment.",
    terminationTerms: "Either party may terminate for material breach not cured within 30 days after written notice. On expiry or termination, the licensee will stop using the licensed material and delete or return copies, except for archival copies retained as required by law. Any transition support or perpetual rights must be expressly stated.",
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
  other: {
    description: [
      "PURPOSE AND OBLIGATIONS",
      "The parties agree to [describe the transaction and purpose]. Each party will perform the responsibilities, deliverables, milestones, and acceptance criteria assigned to it in this agreement or an attached schedule approved in writing.",
      "Complete any transaction-specific requirements, approvals, dependencies, insurance, warranties, ownership, and compliance obligations before signature. A change is effective only when recorded in writing and approved by both parties.",
      REVIEW_NOTICE,
    ].join("\n\n"),
    paymentTerms: DEFAULT_PAYMENT,
    terminationTerms: DEFAULT_TERMINATION,
    confidentialityTerms: DEFAULT_CONFIDENTIALITY,
    disputeResolution: DEFAULT_DISPUTES,
  },
};

function resolveTemplateKey(contractType: string): string {
  const normalized = contractType.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized.includes("maint")) return "maintenance";
  if (normalized.includes("service") || normalized.includes("market")) return "service";
  if (normalized.includes("lease") || normalized.includes("rent")) return "lease";
  if (normalized.includes("supply") || normalized.includes("supplier")) return "supply";
  if (normalized.includes("consult")) return "consulting";
  if (normalized.includes("employ") || normalized.includes("staff")) return "employment";
  if (normalized === "nda" || normalized.includes("nondisclosure")) return "nda";
  if (normalized.includes("partner") || normalized.includes("jointventure")) return "partnership";
  if (normalized.includes("licen") || normalized.includes("software")) return "licensing";
  return "other";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "\"": return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

function renderDraftDescription(description: string): string {
  return description.split(/\n{2,}/).map((section) => {
    if (section === REVIEW_NOTICE) {
      return `<p><em>${escapeHtml(section)}</em></p>`;
    }
    const [firstLine, ...remainingLines] = section.split("\n");
    const isHeading = /^[A-Z][A-Z0-9 &/()-]*$/.test(firstLine) && /[A-Z]/.test(firstLine);
    if (isHeading && remainingLines.length > 0) {
      return `<p><strong>${escapeHtml(firstLine)}</strong><br>${escapeHtml(remainingLines.join("\n"))}</p>`;
    }
    return `<p>${escapeHtml(section).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

export function getContractTemplateFields(contractType: string, label?: string): ContractTemplateFields {
  const key = resolveTemplateKey(contractType);
  const configuredLabel = label?.trim();
  const typeLabel = configuredLabel || CONTRACT_TYPES.find((type) => type.value === key)?.label || contractType || "General";
  return {
    name: typeLabel,
    ...TEMPLATES[key],
    description: renderDraftDescription(TEMPLATES[key].description),
    paymentTerms: renderDraftDescription(TEMPLATES[key].paymentTerms),
    terminationTerms: renderDraftDescription(TEMPLATES[key].terminationTerms),
    confidentialityTerms: renderDraftDescription(TEMPLATES[key].confidentialityTerms),
    disputeResolution: renderDraftDescription(TEMPLATES[key].disputeResolution),
  };
}

export function applyContractTypeTemplate<T extends ContractDraftForm>(
  form: T,
  contractType: string,
  label?: string,
): T {
  const previous = getContractTemplateFields(form.contractType);
  const next = getContractTemplateFields(contractType, label);
  const fields: Array<keyof ContractTemplateFields> = [
    "name",
    "description",
    "paymentTerms",
    "terminationTerms",
    "confidentialityTerms",
    "disputeResolution",
  ];
  const updates: Partial<ContractTemplateFields> = {};

  for (const field of fields) {
    const currentValue = form[field] || "";
    if (!currentValue.trim() || currentValue === previous[field]) {
      updates[field] = next[field];
    }
  }

  return { ...form, ...updates, contractType };
}
