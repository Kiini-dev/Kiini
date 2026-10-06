import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfAnalyticsMetric = {
  label: string;
  value: string | number;
  color?: [number, number, number];
};

export type PdfAnalyticsSeries = {
  label: string;
  values: number[];
  color: [number, number, number];
};

export type ReportAnalyticsPdfOptions = {
  title: string;
  subtitle: string;
  metrics: PdfAnalyticsMetric[];
  chartTitle: string;
  categories: string[];
  series: PdfAnalyticsSeries[];
  tableHeaders?: string[];
  tableRows?: Array<Array<string | number>>;
};

export function createReportAnalyticsPdf(options: ReportAnalyticsPdfOptions): jsPDF {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(15, 118, 110);
  pdf.rect(0, 0, pageWidth, 40, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(255, 255, 255);
  pdf.text(options.title.slice(0, 64), margin, 26);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(90, 102, 102);
  pdf.text(options.subtitle.slice(0, 110), margin, 58);

  let y = addPdfKpiCards(pdf, options.metrics, 74, margin) + 8;
  y = addPdfBarChart(pdf, options.chartTitle, options.categories, options.series, y, margin) + 4;
  if (options.tableHeaders?.length) {
    if (y > pdf.internal.pageSize.getHeight() - 90) {
      pdf.addPage();
      y = margin;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(38, 50, 50);
    pdf.text("Report details", margin, y + 10);
    autoTable(pdf, {
      startY: y + 16,
      margin: { left: margin, right: margin, bottom: 36 },
      head: [options.tableHeaders],
      body: options.tableRows?.length ? options.tableRows : [["No records for this period", ...options.tableHeaders.slice(1).map(() => "")]],
      styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak" },
      headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 249] },
    });
  }

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated ${new Date().toLocaleDateString("en-KE")}`, margin, pdf.internal.pageSize.getHeight() - 20);
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 20, { align: "right" });
  }
  return pdf;
}

export function addPdfKpiCards(
  pdf: jsPDF,
  metrics: PdfAnalyticsMetric[],
  startY: number,
  margin = 40,
): number {
  if (!metrics.length) return startY;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const columns = Math.min(3, metrics.length);
  const gap = 8;
  const cardWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const cardHeight = 50;
  const rowCount = Math.ceil(metrics.length / columns);
  const blockHeight = rowCount * (cardHeight + gap);
  let y = startY;

  if (y + blockHeight > pageHeight - 42) {
    pdf.addPage();
    y = margin;
  }

  metrics.forEach((metric, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + column * (cardWidth + gap);
    const top = y + row * (cardHeight + gap);
    const accent = metric.color || [15, 118, 110];

    pdf.setFillColor(248, 250, 250);
    pdf.setDrawColor(222, 229, 229);
    pdf.roundedRect(x, top, cardWidth, cardHeight, 3, 3, "FD");
    pdf.setFillColor(accent[0], accent[1], accent[2]);
    pdf.rect(x, top, 3, cardHeight, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(91, 105, 105);
    pdf.text(String(metric.label).slice(0, 34), x + 11, top + 15);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 41);
    pdf.text(String(metric.value).slice(0, 28), x + 11, top + 36);
  });

  return y + blockHeight;
}

export function addPdfBarChart(
  pdf: jsPDF,
  title: string,
  categories: string[],
  series: PdfAnalyticsSeries[],
  startY: number,
  margin = 40,
): number {
  if (!categories.length || !series.length) return startY;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const blockHeight = 190;
  let y = startY;
  if (y + blockHeight > pageHeight - 38) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(38, 50, 50);
  pdf.text(title, margin, y + 12);

  const chartX = margin + 24;
  const chartY = y + 26;
  const chartWidth = pageWidth - margin * 2 - 30;
  const chartHeight = 112;
  const chartBottom = chartY + chartHeight;
  const values = series.flatMap((item) => categories.map((_, index) => Number(item.values[index]) || 0));
  const maxValue = Math.max(...values, 1);
  const groupWidth = chartWidth / categories.length;
  const barWidth = Math.max(2, Math.min(16, groupWidth / (series.length + 1.5)));
  const seriesGap = Math.min(3, barWidth / 4);

  pdf.setDrawColor(226, 232, 232);
  for (let tick = 0; tick <= 4; tick += 1) {
    const gridY = chartY + (chartHeight * tick) / 4;
    pdf.line(chartX, gridY, chartX + chartWidth, gridY);
  }
  pdf.setDrawColor(120, 132, 132);
  pdf.line(chartX, chartY, chartX, chartBottom);
  pdf.line(chartX, chartBottom, chartX + chartWidth, chartBottom);

  categories.forEach((category, categoryIndex) => {
    const groupStart = chartX + categoryIndex * groupWidth;
    const totalBarWidth = series.length * barWidth + (series.length - 1) * seriesGap;
    const firstBarX = groupStart + (groupWidth - totalBarWidth) / 2;

    series.forEach((item, seriesIndex) => {
      const value = Math.max(0, Number(item.values[categoryIndex]) || 0);
      const height = Math.max(0.5, (value / maxValue) * chartHeight);
      const barX = firstBarX + seriesIndex * (barWidth + seriesGap);
      pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      pdf.rect(barX, chartBottom - height, barWidth, height, "F");
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(categories.length > 9 ? 6 : 7);
    pdf.setTextColor(72, 84, 84);
    pdf.text(category.slice(0, categories.length > 9 ? 7 : 12), groupStart + groupWidth / 2, chartBottom + 11, { align: "center" });
  });

  const legendY = chartBottom + 29;
  let legendX = margin + 2;
  pdf.setFontSize(7);
  series.forEach((item) => {
    pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
    pdf.rect(legendX, legendY - 6, 7, 7, "F");
    pdf.setTextColor(72, 84, 84);
    pdf.text(item.label, legendX + 11, legendY);
    legendX += 18 + pdf.getTextWidth(item.label);
  });

  return y + blockHeight;
}