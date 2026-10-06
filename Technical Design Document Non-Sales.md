**Technical Design Document: Non-Sales Cash Inflow \& Tax Compliance Workflow**



**1. Objective \& Problem Statement**

Currently, the application only captures incoming funds tied to invoice payments (Operating Revenue). There is no architectural path to log non-sales cash injections such as founder equity, venture capital, donations, or grants.

This update introduces a polymorphic "Other Income \& Capital Inflow" workflow. It allows non-profits, tech startups, and SMBs to manually log or reconcile non-invoice deposits while actively tracking target-audience tax compliance.



**2. System Architecture \& Data Flow**

&#x20;                     ┌──► Operating Revenue (Taxable) ──► P\&L Statement

&#x20;                     │

**Deposit Inflow Engine** ┼──► Non-Operating Revenue ───────► P\&L Statement (Tax Exempt Flags)

&#x20;                     │

&#x20;                     └──► Capital / Owner's Equity ────► Balance Sheet Only



1\. Reconciliation/Creation Entry Point: User creates a manual ledger deposit or categorizes an unlinked bank transaction.

2\. Dynamic UI Form: Selecting the entry type dynamically requests audience-specific compliance metadata.

3\. Database Write: Transaction records to the central ledger with polymorphic fields routing to the correct reporting statements (P\&L vs. Balance Sheet) without treating equity as taxable revenue.



**3. Database Schema Blueprint**

To preserve existing tables, we extend or introduce a polymorphic transaction architecture with an active relational or JSONB compliance layer.



**3.1 chart\_of\_accounts Table (Reference Lookup)**

Ensures deposits route to the correct accounting buckets.

• id (UUID, PK)

• account\_code (VARCHAR, Unique) — e.g., "3000", "4100"

• account\_name (VARCHAR) — e.g., "Paid-in Capital", "Unrestricted Donations"

• account\_type (VARCHAR) — Enums: equity, revenue, liability

• is\_operating (BOOLEAN) — true for standard sales, false for other income/equity



**3.2 transactions / journal\_entries Table**

The unified core table logging the core financial parameters.

Column Name	Data Type	Constraints	Description / Business Logic

id	UUID	PK, Default gen\_random\_uuid()	Unique transaction identifier.

tenant\_id	UUID	FK -> tenants.id, Not Null	Segregates data by organization.

source\_type	VARCHAR	Enum, Not Null	Values: sales\_payment, manual\_deposit, bank\_feed.

account\_id	UUID	FK -> chart\_of\_accounts.id, Not Null	Determines ledger mapping (P\&L vs. Balance Sheet).

gross\_amount	NUMERIC(15,2)	Not Null, > 0.00	Total cash value received.

currency	VARCHAR(3)	Not Null, Default 'USD'	Standard currency code.

tax\_status	VARCHAR	Enum, Not Null	Values: taxable, tax\_exempt, equity\_injection, deferred\_loan.

compliance\_meta	JSONB	Optional	The Patch Component: Dynamic object housing target-audience tax logs.

created\_at	TIMESTAMP	Not Null, Default NOW()	Audit log entry creation timestamp.



**3.3 Structure of the compliance\_meta JSONB Column**

**Case A: For Non-Profit Tenants (tax\_status: "tax\_exempt")**

json

{

&#x20; "non\_profit\_meta": {

&#x20;   "donor\_id": "usr\_983192",

&#x20;   "donor\_tax\_id": "XX-XXXXXXX",

&#x20;   "is\_deductible\_501c3": true,

&#x20;   "quid\_pro\_quo\_value": 0.00,

&#x20;   "has\_issued\_receipt": true,

&#x20;   "restriction\_type": "restricted\_fund",

&#x20;   "allocated\_project\_id": "proj\_science\_grant\_2026"

&#x20; }

}



**Case B: For Tech Startup Tenants (tax\_status: "equity\_injection")**

json

{

&#x20; "startup\_meta": {

&#x20;   "investor\_name": "Acme Ventures",

&#x20;   "equity\_round": "Seed-2026",

&#x20;   "is\_section\_1202\_qsbs": true,

&#x20;   "investor\_type": "accredited\_institutional",

&#x20;   "shares\_issued": 50000,

&#x20;   "form\_83b\_required": false

&#x20; }

}



**Case C: For General SMB Tenants (tax\_status: "deferred\_loan")**

json

{

&#x20; "smb\_meta": {

&#x20;   "lender\_type": "shareholder\_loan",

&#x20;   "is\_repayable": true,

&#x20;   "imputed\_interest\_rate": 4.50,

&#x20;   "maturity\_date": "2029-12-31",

&#x20;   "co\_mingled\_flag": false

&#x20; }

}



**4. Backend Engine Validation \& Rules Matrix**

Implement these conditional triggers inside your business logic controllers (or model level hooks) before saving records to the database.

&#x20;                         Select Inflow Type

&#x20;                                 │

&#x20;        ┌────────────────────────┼────────────────────────┐

&#x20;        ▼                        ▼                        ▼

&#x20;    Donation                   Equity                   Loan

&#x20;        │                        │                        │

&#x20; Amount > $250?          Skip P\&L Engine           Imputed Interest?

&#x20;  ├─► Yes: Require Tax ID  └─► Balance Sheet Direct   └─► Calculate Liab.

&#x20;  └─► No: Standard Log



**• Rule 1: Tax Receipt Trigger (Non-Profits)**

&#x09;• Condition: If tenant.type == 'non\_profit' AND account.account\_type == 'revenue' AND gross\_amount >= 250.00.

&#x09;• Enforcement: Block save unless compliance\_meta.non\_profit\_meta.donor\_tax\_id is present. Enqueue a job to emit a tax-compliant receipt webhook.



**• Rule 2: Fiscal Statement Isolation (Startups)**

&#x09;• Condition: If tax\_status == 'equity\_injection'.

&#x09;• Enforcement: Explicitly exclude the gross\_amount value from Net Income calculations on the Income Statement. Route credit directly to Equity/Capital on the Balance Sheet. Validate is\_section\_1202\_qsbs for asset classification tracking.



**• Rule 3: Shareholder Loan Classification (SMBs)**

&#x09;• Condition: If tax\_status == 'deferred\_loan'.

&#x09;• Enforcement: Map the account ID to a Current/Long-Term Liability ledger item. If imputed\_interest\_rate > 0, create an amortization schedule hook to track tax-deductible interest accruals.



**5. UI/UX Workflow Requirements**

1\. The Inflow Toggle: Provide a "Record Deposit" view separate from "Invoice Payment Received".

2\. The Category Selector: A dropdown sourcing entries from chart\_of\_accounts where is\_operating = false.

3\. Dynamic Form Injection:

&#x09;• Selecting Donation reveals fields for: Donor Info, Project Restriction, Tax Deduction Eligibility.

&#x09;• Selecting Owner Investment/Equity reveals fields for: Shareholder Name, Funding Round, QSBS Designation.

&#x09;• Selecting Owner Loan reveals fields for: Interest Rate, Repayment Maturity Terms.

