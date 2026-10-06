import { useState } from "react";
import { WebsiteNav } from "@/pages/website/WebsiteNav";
import { WebsiteFooter } from "@/pages/website/WebsiteFooter";
import { appDocumentation, type AppDocSection } from "@/lib/appDocumentation";
import { BookOpen, Download, ExternalLink, FileText, LockKeyhole, Route, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const visualColors: Record<AppDocSection["visual"], [number, number, number]> = {
  dashboard: [15, 118, 110], finance: [37, 99, 235], people: [124, 58, 237], pipeline: [234, 88, 12], operations: [14, 116, 144],
};

function initials(title: string) { return title.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase(); }

function drawVisual(pdf: jsPDF, section: AppDocSection, x: number, y: number, width: number) {
  const [r, g, b] = visualColors[section.visual];
  pdf.setFillColor(245, 247, 249); pdf.roundedRect(x, y, width, 105, 8, 8, "F");
  pdf.setFillColor(r, g, b); pdf.roundedRect(x + 14, y + 14, 50, 50, 8, 8, "F");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text(initials(section.title), x + 39, y + 44, { align: "center" });
  pdf.setTextColor(31, 41, 55); pdf.setFontSize(11); pdf.text(section.title, x + 78, y + 32);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.text("Kiini module view", x + 78, y + 48);
  for (let index = 0; index < 4; index += 1) { pdf.setFillColor(index === 0 ? r : 203, index === 0 ? g : 213, index === 0 ? b : 219); pdf.roundedRect(x + 14 + index * ((width - 42) / 4), y + 78, (width - 54) / 4, 12, 3, 3, "F"); }
}

async function loadLogoDataUrl() {
  const response = await fetch("/logo.png");
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Unable to load logo"));
    reader.readAsDataURL(blob);
  });
}

async function downloadDocumentationPdf() {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth(); const pageHeight = pdf.internal.pageSize.getHeight(); const margin = 42;
  const addFooter = () => { const pages = pdf.getNumberOfPages(); for (let page = 1; page <= pages; page += 1) { pdf.setPage(page); pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(100, 116, 139); pdf.text("Kiini application documentation", margin, pageHeight - 24); pdf.text(`Page ${page} of ${pages}`, pageWidth - margin, pageHeight - 24, { align: "right" }); } };
  pdf.setFillColor(15, 118, 110); pdf.rect(0, 0, pageWidth, pageHeight, "F"); pdf.setFillColor(255, 255, 255); pdf.roundedRect(42, 80, pageWidth - 84, pageHeight - 160, 18, 18, "F");
  try { pdf.addImage(await loadLogoDataUrl(), "PNG", 70, 120, 76, 76); } catch { /* keep the branded cover usable without the optional logo asset */ }
  pdf.setTextColor(15, 23, 42); pdf.setFont("helvetica", "bold"); pdf.setFontSize(34); pdf.text("Kiini", 70, 250); pdf.setFontSize(21); pdf.setTextColor(15, 118, 110); pdf.text("Application Documentation", 70, 282); pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.setTextColor(71, 85, 105); pdf.text(pdf.splitTextToSize("Current platform state, modules, workflows, routes, permissions, reporting, and operational guidance.", pageWidth - 140), 70, 320); pdf.setFontSize(9); pdf.text(`Generated ${new Date().toLocaleDateString("en-KE")}`, 70, pageHeight - 145); pdf.text("Confidential - internal operational reference", 70, pageHeight - 128);
  appDocumentation.forEach((section, index) => { pdf.addPage(); const [r, g, b] = visualColors[section.visual]; pdf.setFillColor(r, g, b); pdf.rect(0, 0, pageWidth, 54, "F"); pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(18); pdf.text(`${String(index + 1).padStart(2, "0")}  ${section.title}`, margin, 34); pdf.setTextColor(31, 41, 55); pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); let y = 88; pdf.text(pdf.splitTextToSize(section.summary, pageWidth - margin * 2), margin, y); y += 48; drawVisual(pdf, section, margin, y, pageWidth - margin * 2); y += 132;
    autoTable(pdf, { startY: y, margin: { left: margin, right: margin, bottom: 44 }, head: [["Capability", "Current state"]], body: section.features.map((feature) => [feature, "Available in the current application"]), styles: { fontSize: 8, cellPadding: 5 }, headStyles: { fillColor: [r, g, b], textColor: 255 }, alternateRowStyles: { fillColor: [245, 247, 249] } });
    y = (pdf as any).lastAutoTable.finalY + 20; if (y > pageHeight - 170) { pdf.addPage(); y = 70; } pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(31, 41, 55); pdf.text("Typical workflow", margin, y); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.text(section.workflow.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join("  >  "), margin, y + 18, { maxWidth: pageWidth - margin * 2 }); y += 48; pdf.setFont("helvetica", "bold"); pdf.text("Routes and access", margin, y); pdf.setFont("helvetica", "normal"); pdf.text(pdf.splitTextToSize(`Routes: ${section.routes.join(", ")}\nAccess: ${section.roles}`, pageWidth - margin * 2), margin, y + 16);
  }); addFooter(); pdf.save("kiini-application-documentation.pdf");
}

export default function Documentation() {
  const [selectedSection, setSelectedSection] = useState("overview"); const current = appDocumentation.find((section) => section.id === selectedSection) || appDocumentation[0];
  return <div className="min-h-screen bg-slate-50 text-slate-900"><WebsiteNav /><section className="border-b border-slate-200 bg-white pt-32 pb-12"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8 md:flex-row md:items-end md:justify-between"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700"><BookOpen className="h-4 w-4" /> Product manual</div><h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Kiini Documentation</h1><p className="mt-3 max-w-2xl text-lg text-slate-600">A current-state reference for the platform modules, workflows, routes, roles, reports, and operational controls.</p></div><Button onClick={downloadDocumentationPdf} className="gap-2"><Download className="h-4 w-4" /> Download full PDF</Button></div></section><main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8"><aside className="h-fit space-y-1 rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-6"><p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Application areas</p>{appDocumentation.map((section) => <button key={section.id} onClick={() => setSelectedSection(section.id)} className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${current.id === section.id ? "bg-slate-950 font-semibold text-white" : "text-slate-600 hover:bg-slate-100"}`}>{section.title}</button>)}<div className="mt-4 border-t border-slate-200 pt-3"><a href="/user-guide" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-teal-700 hover:bg-teal-50"><FileText className="h-4 w-4" /> Step-by-step user guide</a><a href="/api-documentation" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"><ExternalLink className="h-4 w-4" /> API documentation</a></div></aside><section className="space-y-6"><Card><CardHeader><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-2xl">{current.title}</CardTitle><CardDescription className="mt-2 text-base">{current.summary}</CardDescription></div><div className="rounded-xl bg-teal-50 p-3 text-teal-700"><Workflow className="h-6 w-6" /></div></div></CardHeader><CardContent className="space-y-6"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><Route className="h-4 w-4 text-teal-600" /> Typical workflow</div><div className="flex flex-wrap items-center gap-2">{current.workflow.map((step, index) => <span key={step} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">{index + 1}</span>{step}</span>)}</div></div><div className="grid gap-4 md:grid-cols-2">{current.features.map((feature) => <div key={feature} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /><span className="text-sm text-slate-700">{feature}</span></div>)}</div><div><h3 className="mb-2 font-semibold text-slate-900">Routes</h3><div className="flex flex-wrap gap-2">{current.routes.map((route) => <code key={route} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{route}</code>)}</div></div><p className="rounded-lg border-l-4 border-teal-500 bg-teal-50 p-4 text-sm text-teal-900"><strong>Access model:</strong> {current.roles}</p></CardContent></Card><Card><CardHeader><CardTitle>Documentation coverage</CardTitle><CardDescription>This manual reflects the current application routes and major capabilities. Use the PDF export for an offline handover or operational archive.</CardDescription></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-lg bg-slate-950 p-4 text-white"><p className="text-2xl font-bold">{appDocumentation.length}</p><p className="text-sm text-slate-300">documented areas</p></div><div className="rounded-lg bg-teal-700 p-4 text-white"><p className="text-2xl font-bold">{appDocumentation.reduce((total, section) => total + section.routes.length, 0)}</p><p className="text-sm text-teal-100">key routes</p></div><div className="rounded-lg bg-blue-700 p-4 text-white"><p className="text-2xl font-bold">PDF</p><p className="text-sm text-blue-100">offline export</p></div></div></CardContent></Card></section></main><WebsiteFooter /></div>;
}
