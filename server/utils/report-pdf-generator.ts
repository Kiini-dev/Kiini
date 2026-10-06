import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getDb } from '../db';
import { invoices, expenses } from '../../drizzle/schema';
import { gte, lte } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { addCompanyLetterhead, getCompanyInfo } from './company-info';

interface ReportConfig {
  title: string;
  startDate?: Date;
  endDate?: Date;
  includeDetails?: boolean;
}

export type PdfBarSeries = { label: string; values: number[]; color: [number, number, number] };

export function addPdfKpiCards(doc: jsPDF, metrics: Array<{ label: string; value: string }>, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const gap = 4;
  const columns = Math.min(3, metrics.length);
  const cardWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const cardHeight = 22;
  const rows = Math.ceil(metrics.length / columns);
  let y = startY;
  if (y + rows * (cardHeight + gap) > doc.internal.pageSize.getHeight() - 18) {
    doc.addPage();
    y = 18;
  }

  metrics.forEach((metric, index) => {
    const x = margin + (index % columns) * (cardWidth + gap);
    const top = y + Math.floor(index / columns) * (cardHeight + gap);
    doc.setFillColor(248, 250, 250);
    doc.setDrawColor(220, 228, 228);
    doc.roundedRect(x, top, cardWidth, cardHeight, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90, 102, 102);
    doc.text(metric.label.slice(0, 28), x + 3, top + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 41);
    doc.text(metric.value.slice(0, 30), x + 3, top + 17);
  });

  return y + rows * (cardHeight + gap);
}

export function addPdfBarChart(doc: jsPDF, title: string, categories: string[], series: PdfBarSeries[], startY: number): number {
  if (!categories.length || !series.length) return startY;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const blockHeight = 74;
  let y = startY;
  if (y + blockHeight > pageHeight - 14) {
    doc.addPage();
    y = 18;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(40, 50, 50);
  doc.text(title, margin, y + 5);

  const chartX = margin + 8;
  const chartY = y + 11;
  const chartWidth = pageWidth - margin * 2 - 10;
  const chartHeight = 43;
  const chartBottom = chartY + chartHeight;
  const groupWidth = chartWidth / categories.length;
  const barWidth = Math.max(1, Math.min(5, groupWidth / (series.length + 1.5)));
  const seriesGap = Math.min(1.2, barWidth / 4);
  const maxValue = Math.max(...series.flatMap((item) => categories.map((_, index) => Number(item.values[index]) || 0)), 1);

  doc.setDrawColor(225, 231, 231);
  for (let tick = 0; tick <= 3; tick += 1) {
    const gridY = chartY + (chartHeight * tick) / 3;
    doc.line(chartX, gridY, chartX + chartWidth, gridY);
  }
  doc.setDrawColor(120, 132, 132);
  doc.line(chartX, chartY, chartX, chartBottom);
  doc.line(chartX, chartBottom, chartX + chartWidth, chartBottom);

  categories.forEach((category, categoryIndex) => {
    const groupStart = chartX + categoryIndex * groupWidth;
    const totalBarWidth = series.length * barWidth + (series.length - 1) * seriesGap;
    const firstBarX = groupStart + (groupWidth - totalBarWidth) / 2;
    series.forEach((item, seriesIndex) => {
      const value = Math.max(0, Number(item.values[categoryIndex]) || 0);
      const height = Math.max(0.3, (value / maxValue) * chartHeight);
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(firstBarX + seriesIndex * (barWidth + seriesGap), chartBottom - height, barWidth, height, 'F');
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(categories.length > 9 ? 5 : 6);
    doc.setTextColor(72, 84, 84);
    doc.text(category.slice(0, categories.length > 9 ? 5 : 10), groupStart + groupWidth / 2, chartBottom + 5, { align: 'center' });
  });

  let legendX = margin + 2;
  const legendY = chartBottom + 13;
  doc.setFontSize(6);
  series.forEach((item) => {
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(legendX, legendY - 3.5, 3, 3, 'F');
    doc.setTextColor(72, 84, 84);
    doc.text(item.label, legendX + 4.5, legendY);
    legendX += 8 + doc.getTextWidth(item.label);
  });

  return y + blockHeight;
}

/**
 * Generate a financial report PDF buffer
 * @param config - Report configuration options
 * @returns Buffer containing the PDF data
 */
export async function generateFinancialReportPDF(config: ReportConfig): Promise<Buffer> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection not available');
  }

  try {
    let invoicesQuery = db.select().from(invoices);
    let expensesQuery = db.select().from(expenses);

    if (config.startDate) {
      const startDateStr = config.startDate instanceof Date ? config.startDate.toISOString().split('T')[0] : config.startDate;
      invoicesQuery = invoicesQuery.where(gte(invoices.issueDate, startDateStr)) as any;
      expensesQuery = expensesQuery.where(gte(expenses.expenseDate, startDateStr)) as any;
    }

    if (config.endDate) {
      const endDateStr = config.endDate instanceof Date ? config.endDate.toISOString().split('T')[0] : config.endDate;
      invoicesQuery = invoicesQuery.where(lte(invoices.issueDate, endDateStr)) as any;
      expensesQuery = expensesQuery.where(lte(expenses.expenseDate, endDateStr)) as any;
    }

    const invoiceData = await invoicesQuery;
    const expenseData = await expensesQuery;

    // Calculate metrics - use paid status instead to reflect approved payments
    const totalInvoiced = invoiceData.reduce((sum, inv: any) => sum + (inv.total || 0), 0);
    const paidInvoices = invoiceData
      .filter((inv: any) => inv.status === 'paid')
      .reduce((sum, inv: any) => sum + (inv.total || 0), 0);
    // Outstanding = Total - Paid (better represents actual outstanding)
    const outstandingAmount = invoiceData.reduce((sum, inv: any) => sum + ((inv.total || 0) - (inv.paidAmount || 0)), 0);
    const totalExpenses = expenseData.reduce((sum, exp: any) => sum + (exp.amount || 0), 0);
    const netProfit = totalInvoiced - totalExpenses;

    // Create PDF document
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    const companyInfo = await getCompanyInfo();
    const contentStartY = addCompanyLetterhead(doc, companyInfo, 'Financial Report');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(config.title, 20, contentStartY);

  // Add report period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const periodText = config.startDate && config.endDate 
    ? `Period: ${config.startDate.toLocaleDateString()} - ${config.endDate.toLocaleDateString()}`
    : 'Period: All Time';
  doc.text(periodText, 20, contentStartY + 8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, contentStartY + 14);

  // Add summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Financial Summary', 20, contentStartY + 29);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount / 100);
  };

  const summaryData = [
    ['Total Revenue', formatCurrency(totalInvoiced)],
    ['Paid Invoices', formatCurrency(paidInvoices)],
    ['Outstanding Receivables', formatCurrency(outstandingAmount)],
    ['Total Expenses', formatCurrency(totalExpenses)],
    ['Net Profit', formatCurrency(netProfit)],
  ];

  autoTable(doc, {
    startY: contentStartY + 35,
    head: [['Metric', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 70, halign: 'right' },
    },
  });

  let detailY = addPdfKpiCards(doc, [
    { label: 'Revenue', value: formatCurrency(totalInvoiced) },
    { label: 'Paid', value: formatCurrency(paidInvoices) },
    { label: 'Outstanding', value: formatCurrency(outstandingAmount) },
    { label: 'Expenses', value: formatCurrency(totalExpenses) },
    { label: 'Net profit', value: formatCurrency(netProfit) },
    { label: 'Invoices', value: String(invoiceData.length) },
  ], (doc as any).lastAutoTable.finalY + 8);
  detailY = addPdfBarChart(doc, 'Financial overview', ['Revenue', 'Paid', 'Outstanding', 'Expenses', 'Net'], [{
    label: 'Amount',
    values: [totalInvoiced, paidInvoices, outstandingAmount, totalExpenses, netProfit],
    color: [15, 118, 110],
  }], detailY + 5) + 5;

  // Add invoice details if requested
  if (config.includeDetails && invoiceData.length > 0) {
    const currentY = detailY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Invoice Details', 20, currentY);

    const invoiceTableData = invoiceData.map((inv: any) => [
      inv.invoiceNumber || 'N/A',
      inv.clientId || 'N/A',
      new Date(inv.issueDate).toLocaleDateString(),
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A',
      formatCurrency(inv.total || 0),
      formatCurrency(inv.paidAmount || 0),
      inv.status || 'pending',
    ]);

    autoTable(doc, {
      startY: currentY + 6,
      head: [['Invoice #', 'Client ID', 'Issue Date', 'Due Date', 'Amount', 'Paid', 'Status']],
      body: invoiceTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 32 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 25 },
      },
    });
    detailY = (doc as any).lastAutoTable.finalY + 10;
  }

  if (config.includeDetails && expenseData.length > 0) {
    const currentY = detailY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Expense Details', 20, currentY);
    autoTable(doc, {
      startY: currentY + 6,
      head: [['Expense #', 'Category', 'Vendor', 'Date', 'Amount', 'Method', 'Status']],
      body: expenseData.map((exp: any) => [
        exp.expenseNumber || 'N/A', exp.category || 'N/A', exp.vendor || 'N/A',
        exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : 'N/A',
        formatCurrency(exp.amount || 0), exp.paymentMethod || 'N/A', exp.status || 'pending',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 25 }, 1: { cellWidth: 35 }, 2: { cellWidth: 32 },
        3: { cellWidth: 25 }, 4: { cellWidth: 28, halign: 'right' },
        5: { cellWidth: 25 }, 6: { cellWidth: 25 },
      },
    });
  }

  // Add footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
    doc.text('Confidential - For Authorized Use Only', 20, doc.internal.pageSize.getHeight() - 10);
  }

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error("Error generating financial report PDF:", error);
    throw new Error(`Failed to generate financial report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate an expense report PDF buffer
 * @param config - Report configuration options
 * @returns Buffer containing the PDF data
 */
export async function generateExpenseReportPDF(config: ReportConfig): Promise<Buffer> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database connection not available');
  }

  // Fetch expense data
  let expensesQuery = db.select().from(expenses);

  if (config.startDate) {
    const startDateStr = config.startDate instanceof Date ? config.startDate.toISOString().split('T')[0] : config.startDate;
    expensesQuery = expensesQuery.where(gte(expenses.expenseDate, startDateStr)) as any;
  }

  if (config.endDate) {
    const endDateStr = config.endDate instanceof Date ? config.endDate.toISOString().split('T')[0] : config.endDate;
    expensesQuery = expensesQuery.where(lte(expenses.expenseDate, endDateStr)) as any;
  }

  const expenseData = await expensesQuery;

  // Calculate metrics
  const totalExpenses = expenseData.reduce((sum, exp: any) => sum + (exp.amount || 0), 0);
  const expensesByCategory: Record<string, number> = {};
  
  expenseData.forEach((exp: any) => {
    const category = exp.category || 'Uncategorized';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + (exp.amount || 0);
  });

  // Create PDF document
  const doc = new jsPDF();

  // Set font
  doc.setFont('helvetica');

  const companyInfo = await getCompanyInfo();
  const contentStartY = addCompanyLetterhead(doc, companyInfo, 'Expense Report');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text(config.title, 20, contentStartY);

  // Add report period
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const periodText = config.startDate && config.endDate 
    ? `Period: ${config.startDate.toLocaleDateString()} - ${config.endDate.toLocaleDateString()}`
    : 'Period: All Time';
  doc.text(periodText, 20, contentStartY + 8);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, contentStartY + 14);

  // Add summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Expense Summary', 20, contentStartY + 29);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount / 100);
  };

  const summaryData = [
    ['Total Expenses', formatCurrency(totalExpenses)],
    ['Number of Expenses', String(expenseData.length)],
    ['Average Expense', expenseData.length > 0 ? formatCurrency(totalExpenses / expenseData.length) : 'Ksh 0'],
  ];

  autoTable(doc, {
    startY: contentStartY + 35,
    head: [['Metric', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 70, halign: 'right' },
    },
  });

  let detailY = addPdfKpiCards(doc, [
    { label: 'Total expenses', value: formatCurrency(totalExpenses) },
    { label: 'Expense records', value: String(expenseData.length) },
    { label: 'Average expense', value: expenseData.length > 0 ? formatCurrency(totalExpenses / expenseData.length) : 'Ksh 0' },
  ], (doc as any).lastAutoTable.finalY + 8);
  detailY = addPdfBarChart(doc, 'Expenses by category', Object.keys(expensesByCategory), [{
    label: 'Amount',
    values: Object.values(expensesByCategory),
    color: [234, 88, 12],
  }], detailY + 5) + 5;

  // Add category breakdown if requested
  if (config.includeDetails && Object.keys(expensesByCategory).length > 0) {
    const currentY = detailY;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Expenses by Category', 20, currentY);

    const categoryTableData = Object.entries(expensesByCategory).map(([category, amount]) => [
      category,
      formatCurrency(amount),
      totalExpenses > 0 ? `${((amount / totalExpenses) * 100).toFixed(1)}%` : '0%',
    ]);

    autoTable(doc, {
      startY: currentY + 6,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
      },
    });
    detailY = (doc as any).lastAutoTable.finalY + 10;
  }

  if (config.includeDetails && expenseData.length > 0) {
    const currentY = detailY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Expense Register', 20, currentY);
    autoTable(doc, {
      startY: currentY + 6,
      head: [['Expense #', 'Description', 'Category', 'Vendor', 'Date', 'Amount', 'Status']],
      body: expenseData.map((exp: any) => [
        exp.expenseNumber || 'N/A', exp.description || 'N/A', exp.category || 'N/A', exp.vendor || 'N/A',
        exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString() : 'N/A',
        formatCurrency(exp.amount || 0), exp.status || 'pending',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 24 }, 1: { cellWidth: 42 }, 2: { cellWidth: 32 },
        3: { cellWidth: 28 }, 4: { cellWidth: 25 }, 5: { cellWidth: 28, halign: 'right' }, 6: { cellWidth: 24 },
      },
    });
  }

  // Add footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
    doc.text('Confidential - For Authorized Use Only', 20, doc.internal.pageSize.getHeight() - 10);
  }

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}
