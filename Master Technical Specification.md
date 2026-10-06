**Master Technical Specification: Multi-Tenant Departmental Payroll Allocation, Budgeting, \& Audit Log Architecture**



**1. Objective \& Scope**

This document provides the complete, end-to-end technical specification for implementing a robust Departmental Payroll Deduction and Audit Tracking Stack.



This architecture supports two distinct target environments:

**1. SaaS Multi-Tenant Feature:** Built for end-users spanning Tech Startups (investor metrics/R\&D tax splits), Non-Profits (grant funding distribution), and General SMBs (departmental cost centers).



**2. Internal Company Financials (Audit-Ready Stack):** Restructuring internal payroll engines to pass rigorous financial audits by enforcing a hard separation between COGS and OpEx and tracking R\&D capitalization fields natively.

2\. Complete Relational Database Schema (PostgreSQL)

This schema handles multi-tenancy, historical split allocations, an immutable ledger, and comprehensive forensic logging for SOC 2 Type II or tax compliance.



**sql**

**-- 1. Tenant/Organization Isolation Layer**

CREATE TABLE tenants (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   name VARCHAR(255) NOT NULL,

&#x20;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

);



**-- 2. Cost Centers / Department / Grant Tables**

CREATE TABLE cost\_centers (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   tenant\_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

&#x20;   name VARCHAR(100) NOT NULL,            -- e.g., "Engineering", "Grant A", "Sales"

&#x20;   code VARCHAR(50) NOT NULL,             -- e.g., "DEPT\_ENG", "GRANT\_2026\_X"

&#x20;   type VARCHAR(50) NOT NULL,             -- 'COGS', 'R\&D', 'S\&M', 'G\&A', 'PROGRAMMATIC'

&#x20;   is\_active BOOLEAN DEFAULT TRUE,

&#x20;   UNIQUE (tenant\_id, code)

);



**-- 3. Employee Registry**

CREATE TABLE employees (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   tenant\_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

&#x20;   first\_name VARCHAR(100) NOT NULL,

&#x20;   last\_name VARCHAR(100) NOT NULL,

&#x20;   email VARCHAR(255) NOT NULL,

&#x20;   status VARCHAR(50) DEFAULT 'ACTIVE',   -- 'ACTIVE', 'TERMINATED'

&#x20;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

);



**-- 4. Junction Table for Dynamic Split Allocations (Critical for Non-Profits \& Audits)**

CREATE TABLE employee\_cost\_allocations (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   employee\_id UUID REFERENCES employees(id) ON DELETE CASCADE,

&#x20;   cost\_center\_id UUID REFERENCES cost\_centers(id) ON DELETE CASCADE,

&#x20;   allocation\_percentage NUMERIC(5, 2) NOT NULL, -- e.g., 70.00 for 70%

&#x20;   effective\_date DATE NOT NULL,                 -- Tracks historical movement for audits

&#x20;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,

&#x20;   CONSTRAINT check\_percentage CHECK (allocation\_percentage > 0 AND allocation\_percentage <= 100)

);



**-- 5. Immutable Payroll Run Ledger (The Core Audit Log)**

CREATE TABLE payroll\_ledger\_entries (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   tenant\_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

&#x20;   employee\_id UUID REFERENCES employees(id),

&#x20;   cost\_center\_id UUID REFERENCES cost\_centers(id),

&#x20;   payroll\_period\_start DATE NOT NULL,

&#x20;   payroll\_period\_end DATE NOT NULL,

&#x20;   gross\_pay\_deductions NUMERIC(12, 2) NOT NULL, -- Amount drawn from this cost center

&#x20;   tax\_deductions NUMERIC(12, 2) NOT NULL,

&#x20;   net\_payout NUMERIC(12, 2) NOT NULL,

&#x20;   processed\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

);



**-- 6. Immutable Audit Log for Report Exports (SOC 2 / Forensic Trail)**

CREATE TABLE report\_export\_audit\_logs (

&#x20;   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&#x20;   tenant\_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

&#x20;   manager\_user\_id UUID NOT NULL,               

&#x20;   manager\_email VARCHAR(255) NOT NULL,          

&#x20;   report\_type VARCHAR(100) NOT NULL,           -- e.g., 'PAYROLL\_COST\_ALLOCATION\_DETAIL'

&#x20;   export\_format VARCHAR(10) NOT NULL,          -- 'CSV', 'PDF', 'XLSX'

&#x20;   date\_range\_start DATE NOT NULL,               

&#x20;   date\_range\_end DATE NOT NULL,                 

&#x20;   ip\_address VARCHAR(45) NOT NULL,             -- Supports IPv4 and IPv6 lengths

&#x20;   user\_agent TEXT NOT NULL,                    -- Browser fingerprint

&#x20;   generated\_file\_sha256 CHAR(64) NOT NULL,     -- Cryptographic file validation signature

&#x20;   created\_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

);



\-- Indexes for performance and quick retrieval during an audit

CREATE INDEX idx\_audit\_logs\_tenant\_date ON report\_export\_audit\_logs(tenant\_id, created\_at DESC);

CREATE INDEX idx\_audit\_logs\_manager ON report\_export\_audit\_logs(manager\_user\_id);



**3. Backend System Logic (Node.js \& TypeScript)**

Payroll Service Layer (payroll.service.ts)

This service validates allocation metrics, applies an epsilon check to prevent floating-point math issues, and updates the data layer within an isolated database transaction block.

typescript

import { Pool } from 'pg';



export interface AllocationRequest {

&#x20; employeeId: string;

&#x20; grossSalary: number;

&#x20; payrollPeriodStart: string;

&#x20; payrollPeriodEnd: string;

}



export interface CostAllocation {

&#x20; costCenterId: string;

&#x20; costCenterCode: string;

&#x20; type: 'COGS' | 'R\&D' | 'S\&M' | 'G\&A' | 'PROGRAMMATIC';

&#x20; allocationPercentage: number;

}



export class PayrollService {

&#x20; private db: Pool;

&#x20; private integrationFramework: any; // Dynamic outbound sync connector



&#x20; constructor(dbPool: Pool, integrationFramework: any) {

&#x20;   this.db = dbPool;

&#x20;   this.integrationFramework = integrationFramework;

&#x20; }



&#x20; async calculateAndLogPayroll(request: AllocationRequest, tenantId: string): Promise<void> {

&#x20;   const { employeeId, grossSalary, payrollPeriodStart, payrollPeriodEnd } = request;



&#x20;   **// 1. Fetch active allocations based on effective execution date**

&#x20;   const allocationQuery = `

&#x20;     SELECT cost\_center\_id, code, type, allocation\_percentage

&#x20;     FROM employee\_cost\_allocations eca

&#x20;     JOIN cost\_centers cc ON eca.cost\_center\_id = cc.id

&#x20;     WHERE eca.employee\_id = $1 

&#x20;       AND eca.effective\_date <= $2

&#x20;     ORDER BY eca.effective\_date DESC;

&#x20;   `;

&#x20;   

&#x20;   const res = await this.db.query(allocationQuery, \[employeeId, payrollPeriodEnd]);

&#x20;   const allocations: CostAllocation\[] = res.rows;



&#x20;   if (allocations.length === 0) {

&#x20;     throw new Error(`IncompleteAllocationError: No cost allocations defined for employee ${employeeId}`);

&#x20;   }



&#x20;   **// 2. Validate total equals exactly 100%**

&#x20;   const totalPercentage = allocations.reduce((sum, item) => sum + Number(item.allocationPercentage), 0);

&#x20;   if (Math.abs(totalPercentage - 100.00) > 0.001) {

&#x20;     throw new Error(`IncompleteAllocationError: Total allocation must equal 100%. Currently equals ${totalPercentage}%`);

&#x20;   }



&#x20;   **// 3. Open transaction to write ledger entries**

&#x20;   const client = await this.db.connect();

&#x20;   try {

&#x20;     await client.query('BEGIN');



&#x20;     for (const alloc of allocations) {

&#x20;       const allocatedGross = parseFloat(((grossSalary \* alloc.allocationPercentage) / 100).toFixed(2));

&#x20;       const mockTax = parseFloat((allocatedGross \* 0.20).toFixed(2)); 

&#x20;       const mockNet = parseFloat((allocatedGross - mockTax).toFixed(2));



&#x20;       const insertLedgerQuery = `

&#x20;         INSERT INTO payroll\_ledger\_entries 

&#x20;         (tenant\_id, employee\_id, cost\_center\_id, payroll\_period\_start, payroll\_period\_end, gross\_pay\_deductions, tax\_deductions, net\_payout)

&#x20;         VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

&#x20;       `;

&#x20;       

&#x20;       await client.query(insertLedgerQuery, \[

&#x20;         tenantId, employeeId, alloc.costCenterId, payrollPeriodStart, payrollPeriodEnd, allocatedGross, mockTax, mockNet

&#x20;       ]);

&#x20;     }



&#x20;     await client.query('COMMIT');



&#x20;     **// 4. Optional Third-Party Sync Hook execution**

&#x20;     if (this.integrationFramework) {

&#x20;       await this.integrationFramework.emit('payroll.posted', {

&#x20;         tenantId, payrollPeriodEnd, summary: allocations

&#x20;       });

&#x20;     }

&#x20;   } catch (error) {

&#x20;     await client.query('ROLLBACK');

&#x20;     throw error;

&#x20;   } finally {

&#x20;     client.release();

&#x20;   }

&#x20; }

}





Export \& Forensic Logging Service (export.service.ts)

Generates flat CSV strings, builds secure PDFs, and writes the forensic file signature hashes directly into the compliance table ledger.

typescript

import { Parser } from 'json2csv';

import \* as PDFDocument from 'pdfkit';

import \* as crypto from 'crypto';

import { Writable } from 'stream';

import { Pool } from 'pg';



export interface AuditLogPayload {

&#x20; tenantId: string;

&#x20; managerUserId: string;

&#x20; managerEmail: string;

&#x20; reportType: string;

&#x20; exportFormat: 'CSV' | 'PDF';

&#x20; dateRangeStart: string;

&#x20; dateRangeEnd: string;

&#x20; ipAddress: string;

&#x20; userAgent: string;

&#x20; fileBuffer: Buffer;

}



export class PayrollExportService {

&#x20; private db: Pool;



&#x20; constructor(dbPool: Pool) {

&#x20;   this.db = dbPool;

&#x20; }



&#x20; public generateAllocationCSV(data: any\[]): string {

&#x20;   const fields = \[

&#x20;     { label: 'Employee Name', value: 'employee\_name' },

&#x20;     { label: 'Period End', value: 'payroll\_period\_end' },

&#x20;     { label: 'Cost Center Code', value: 'cost\_center\_code' },

&#x20;     { label: 'Allocation Type', value: 'allocation\_type' },

&#x20;     { label: 'Allocation %', value: 'allocation\_percentage' },

&#x20;     { label: 'Allocated Gross', value: 'allocated\_gross' },

&#x20;     { label: 'Allocated Employer Tax', value: 'allocated\_employer\_taxes' },

&#x20;     { label: 'Total Cost', value: 'total\_allocated\_cost' }

&#x20;   ];

&#x20;   return new Parser({ fields }).parse(data);

&#x20; }



&#x20; public generateAllocationPDF(payload: any, outputStream: Writable): void {

&#x20;   const doc = new PDFDocument({ margin: 50, size: 'A4' });

&#x20;   doc.pipe(outputStream);



&#x20;   doc.fontSize(20).text('Payroll Allocation Audit Report', { underline: true });

&#x20;   doc.fontSize(10).text(`Organization: ${payload.report\_metadata.tenant\_name}`);

&#x20;   doc.text(`Scope Period: ${payload.report\_metadata.fiscal\_period}`);

&#x20;   doc.text(`Generated On: ${payload.report\_metadata.generated\_at}`);

&#x20;   doc.moveDown(2);



&#x20;   doc.fontSize(14).text('Functional Accounting Breakdown', { bold: true });

&#x20;   doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

&#x20;   doc.moveDown(1);



&#x20;   doc.fontSize(10);

&#x20;   payload.records.forEach((record: any) => {

&#x20;     doc.text(`${record.employee\_name} | ${record.cost\_center\_code} (${record.allocation\_type}) | Split: ${record.allocation\_percentage}% | Cost Baseline: $${record.total\_allocated\_cost.toFixed(2)}`);

&#x20;     doc.moveDown(0.5);

&#x20;   });



&#x20;   doc.moveDown(3);

&#x20;   doc.fontSize(8).fillColor('gray').text('This transaction log is structurally unalterable. Signed off via internal general ledger guidelines.', { italic: true });

&#x20;   doc.end();

&#x20; }



&#x20; async logReportExport(payload: AuditLogPayload): Promise<string> {

&#x20;   const fileHash = crypto.createHash('sha256').update(payload.fileBuffer).digest('hex');

&#x20;   const insertQuery = `

&#x20;     INSERT INTO report\_export\_audit\_logs (

&#x20;       tenant\_id, manager\_user\_id, manager\_email, report\_type, export\_format, 

&#x20;       date\_range\_start, date\_range\_end, ip\_address, user\_agent, generated\_file\_sha256

&#x20;     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;

&#x20;   `;

&#x20;   const res = await this.db.query(insertQuery, \[

&#x20;     payload.tenantId, payload.managerUserId, payload.managerEmail, payload.reportType,

&#x20;     payload.exportFormat, payload.dateRangeStart, payload.dateRangeEnd, payload.ipAddress, payload.userAgent, fileHash

&#x20;   ]);

&#x20;   return res.rows\[0].id;

&#x20; }

}



**4. Frontend UI/UX Flow \& Reporting Guide**

Split Allocation Interface Strategy

To ensure system flexibility, the client dashboard utilizes a dynamically bound dual-input card components workflow:

**• Bidirectional Value Binding:** The percentage parameter (%) and target baseline text inputs ($) are calculated concurrently using the client runtime framework. Adjusting either configuration shifts the partner node value instantly based on the baseline employee compensation metrics.



**• Safety Guards:** The execution control UI component (Save Changes) remains explicitly locked via client framework logic whenever tracking rules evaluate to values other than exactly 100%.

Analytics \& Operational Dashboard Aggregations

SaaS Gross Margin KPI Calculation



To track gross performance trends cleanly without table scan performance overhead, use aggregated queries targeting functional categories (COGS, R\&D):

typescript

const grossMarginQuery = `

&#x20; SELECT 

&#x20;   TO\_CHAR(payroll\_period\_end, 'YYYY-MM') as reporting\_month,

&#x20;   SUM(CASE WHEN type = 'COGS' THEN gross\_pay\_deductions ELSE 0 END) as total\_cogs\_payroll,

&#x20;   SUM(CASE WHEN type = 'R\&D' THEN gross\_pay\_deductions ELSE 0 END) as total\_rd\_payroll,

&#x20;   SUM(CASE WHEN type IN ('S\&M', 'G\&A') THEN gross\_pay\_deductions ELSE 0 END) as total\_opex\_payroll

&#x20; FROM payroll\_ledger\_entries ple

&#x20; JOIN cost\_centers cc ON ple.cost\_center\_id = cc.id

&#x20; WHERE ple.tenant\_id = $1 AND ple.payroll\_period\_end BETWEEN $2 AND $3

&#x20; GROUP BY TO\_CHAR(payroll\_period\_end, 'YYYY-MM')

&#x20; ORDER BY reporting\_month ASC;

`;



**Non-Profit Grant Capital Burn Tracking Engine**

For monitoring operational constraints on dynamic funding allocations, run clear balance-to-burn mapping:

typescript

const budgetBurnQuery = `

&#x20; SELECT 

&#x20;   cc.code as cost\_center\_code,

&#x20;   cc.name as cost\_center\_name,

&#x20;   SUM(ple.gross\_pay\_deductions + ple.tax\_deductions) as cumulative\_spent,

&#x20;   MAX(cc.type) as funding\_type 

&#x20; FROM payroll\_ledger\_entries ple

&#x20; JOIN cost\_centers cc ON ple.cost\_center\_id = cc.id

&#x20; WHERE ple.tenant\_id = $1

&#x20; GROUP BY cc.code, cc.name;

`;



5\. System Execution Constraints

1\. Write-Once, Read-Many (WORM): Database operational permissions for payroll\_ledger\_entries and report\_export\_audit\_logs tables must explicitly restrict UPDATE, PATCH, or DELETE executions to preserve historical records for audits.

2\. Audit Changes: Any adjustments to past payroll computations must be added as a separate balancing line-item entry rather than overriding data directly inside the existing rows.

