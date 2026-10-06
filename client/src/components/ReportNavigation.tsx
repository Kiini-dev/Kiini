import { Link } from "wouter";
import { BarChart3, Boxes, DollarSign, FileSpreadsheet, FolderKanban, HandCoins, Landmark, ShieldCheck, Users } from "lucide-react";

const reportPages = [
  ["/reports", "Reports & Analytics", BarChart3],
  ["/reports/sales", "Sales Reports", TrendingIcon],
  ["/reports/projects", "Projects Reports", FolderKanban],
  ["/finance/reports", "Financial Reports", Landmark],
  ["/finance/non-sales-inflows", "Non-sales Inflows", HandCoins],
  ["/reports/customers", "Customer / Client Reports", Users],
  ["/reports/hr", "HR Reports", Users],
  ["/payments/reports", "Payment Reports", DollarSign],
  ["/payroll/tax-compliance", "Tax Compliance & P9", ShieldCheck],
  ["/payroll/department-reports", "Department Payroll", FileSpreadsheet],
  ["/erp-controls", "ERP Controls", Landmark],
  ["/erp-operations", "ERP Operations", Boxes],
] as const;

function TrendingIcon() { return <BarChart3 className="h-4 w-4" />; }

export function ReportNavigation({ active }: { active?: string }) {
  return <aside className="kiini-report-sidebar h-fit p-2 lg:sticky lg:top-4"><p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Report pages</p><nav className="space-y-0.5">{reportPages.map(([href, label, Icon]) => <Link key={href} href={href}><a className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${active === href ? "bg-slate-900 font-semibold text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}><Icon className="h-4 w-4" />{label}</a></Link>)}</nav></aside>;
}
