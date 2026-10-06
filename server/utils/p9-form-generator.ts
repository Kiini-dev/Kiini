import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for KRA P9 Form data
 * Based on Kenya Revenue Authority P9 Income Tax Certificate standard format
 */
export interface P9FormData {
  employeeId: string;
  employeeName: string;
  nationalId: string;
  knRegNo: string;
  grossSalary: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  totalDeductions: number;
  netIncome: number;
  taxYear: number;
  monthFrom: number;
  monthTo: number;
  companyName: string;
  companyKRAPin: string;
  companyAddress: string;
  certificationDate: Date;
  certifiedBy: string;
  certifiedByTitle: string;
}

/**
 * Generate KRA P9 Form in the correct format
 * Returns HTML formatted document suitable for printing/PDF conversion
 */
export function generateP9Form(data: P9FormData): string {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthFromName = monthNames[data.monthFrom] || '';
  const monthToName = monthNames[data.monthTo] || '';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KRA P9 Income Tax Certificate</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          color: #000;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .container {
          max-width: 8.5in;
          height: 11in;
          margin: 0 auto;
          border: 1px solid #ccc;
          padding: 40px;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0;
          font-size: 11px;
        }
        .section-title {
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 8px;
          font-size: 12px;
          background: #f5f5f5;
          padding: 5px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .form-row.full {
          grid-template-columns: 1fr;
        }
        .form-group {
          margin-bottom: 8px;
        }
        .form-label {
          font-weight: bold;
          font-size: 10px;
          color: #333;
        }
        .form-value {
          border-bottom: 1px solid #000;
          padding: 3px 5px;
          font-size: 11px;
          min-height: 18px;
        }
        .amount {
          text-align: right;
          font-family: 'Courier New', monospace;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 11px;
        }
        .table th {
          background: #f0f0f0;
          border: 1px solid #000;
          padding: 5px;
          text-align: left;
          font-weight: bold;
        }
        .table td {
          border: 1px solid #000;
          padding: 5px;
        }
        .table td.amount {
          text-align: right;
        }
        .signature-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .signature-line {
          border-top: 1px solid #000;
          padding-top: 5px;
          text-align: center;
          font-size: 10px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 9px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .kra-warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 8px;
          margin-bottom: 15px;
          font-size: 10px;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>REPUBLIC OF KENYA</h1>
          <p>INCOME TAX CERTIFICATE (P9)</p>
          <p style="font-size: 10px; margin-top: 10px;">TAX YEAR: ${data.taxYear}</p>
        </div>

        <div class="kra-warning">
          <strong>KRA Reference:</strong> This P9 Form certifies income earned by the employee during the specified tax year.
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="form-label">EMPLOYEE FULL NAME:</div>
            <div class="form-value">${data.employeeName}</div>
          </div>
          <div class="form-group">
            <div class="form-label">NATIONAL ID NUMBER:</div>
            <div class="form-value">${data.nationalId}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="form-label">KRA PIN (If Available):</div>
            <div class="form-value">${data.knRegNo}</div>
          </div>
          <div class="form-group">
            <div class="form-label">EMPLOYEE ID:</div>
            <div class="form-value">${data.employeeId}</div>
          </div>
        </div>

        <div class="section-title">EMPLOYER INFORMATION</div>
        
        <div class="form-row full">
          <div class="form-group">
            <div class="form-label">EMPLOYER NAME:</div>
            <div class="form-value">${data.companyName}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <div class="form-label">KRA PIN:</div>
            <div class="form-value">${data.companyKRAPin}</div>
          </div>
          <div class="form-group">
            <div class="form-label">PERIOD COVERED:</div>
            <div class="form-value">${monthFromName} - ${monthToName} ${data.taxYear}</div>
          </div>
        </div>

        <div class="form-row full">
          <div class="form-group">
            <div class="form-label">EMPLOYER ADDRESS:</div>
            <div class="form-value">${data.companyAddress}</div>
          </div>
        </div>

        <div class="section-title">INCOME AND DEDUCTIONS SUMMARY</div>

        <table class="table">
          <tr>
            <th>Description</th>
            <th class="amount">Amount (KES)</th>
          </tr>
          <tr>
            <td>Gross Salary</td>
            <td class="amount">${(data.grossSalary / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td colspan="2" style="font-weight: bold;">Statutory Deductions:</td>
          </tr>
          <tr>
            <td>PAYE (Income Tax)</td>
            <td class="amount">${(data.paye / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>NSSF Contribution</td>
            <td class="amount">${(data.nssf / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>SHIF/NHIF Contribution</td>
            <td class="amount">${(data.shif / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr>
            <td>Housing Levy</td>
            <td class="amount">${(data.housingLevy / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td>Total Deductions</td>
            <td class="amount">${(data.totalDeductions / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
          <tr style="background: #e8f5e9; font-weight: bold;">
            <td>NET INCOME TO EMPLOYEE</td>
            <td class="amount">${(data.netIncome / 100).toLocaleString('en-KE', {minimumFractionDigits: 2})}</td>
          </tr>
        </table>

        <div class="section-title">CERTIFICATION</div>

        <div class="form-row full">
          <div class="form-group" style="font-size: 10px; line-height: 1.6;">
            <p>I certify that this P9 Income Tax Certificate is accurate and complete based on the records maintained by ${data.companyName}. This certificate is issued in accordance with the requirements of the Income Tax Act and the Kenya Revenue Authority regulations.</p>
          </div>
        </div>

        <div class="signature-section">
          <div>
            <div style="height: 40px;"></div>
            <div class="signature-line">
              Employer/Company Stamp<br/>
              Date: ${new Date(data.certificationDate).toLocaleDateString('en-KE')}
            </div>
          </div>
          <div>
            <div style="height: 40px;"></div>
            <div class="signature-line">
              ${data.certifiedByTitle}<br/>
              ${data.certifiedBy}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This is an official income tax certificate issued by the employer. For verification, contact Kenya Revenue Authority (KRA).</p>
          <p>Tax Year: ${data.taxYear} | Generated: ${new Date().toLocaleDateString('en-KE')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate P9 data from payroll records
 */
export function generateP9DataFromPayroll(payrollData: any, employee: any, company: any, certifiedBy: any): P9FormData {
  const totalGross = payrollData.basicSalary + (payrollData.allowances || 0);
  const totalDeductions = (payrollData.tax || 0) + (payrollData.nssf || 0) + (payrollData.shif || 0) + (payrollData.housingLevy || 0);
  
  return {
    employeeId: employee.employeeNumber,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    nationalId: employee.nationalId || '',
    knRegNo: employee.taxId || '',
    grossSalary: totalGross,
    paye: payrollData.tax || 0,
    nssf: payrollData.nssf || 0,
    shif: payrollData.shif || 0,
    housingLevy: payrollData.housingLevy || 0,
    totalDeductions,
    netIncome: (payrollData.netSalary || totalGross - totalDeductions),
    taxYear: new Date().getFullYear(),
    monthFrom: 1,
    monthTo: 12,
    companyName: company.name || 'Your Company',
    companyKRAPin: company.kraPin || '',
    companyAddress: company.address || '',
    certificationDate: new Date(),
    certifiedBy: certifiedBy.name || 'HR Manager',
    certifiedByTitle: certifiedBy.title || 'Human Resources Manager',
  };
}
