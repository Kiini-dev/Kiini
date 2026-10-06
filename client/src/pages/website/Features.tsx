import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebsiteNav } from "./WebsiteNav";
import { WebsiteFooter } from "./WebsiteFooter";
import {
  Users, DollarSign, UserCog, Briefcase, ShoppingCart, BarChart3,
  Calendar, Ticket, MessageSquare, FileCheck, Target, Sparkles,
  ArrowRight, CheckCircle, Zap, Shield, Globe, Layers,
  Receipt, Package, CreditCard, TrendingUp, Clock, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import InteractiveModuleDemo from "./InteractiveModuleDemo";

function ModuleDemoMockup({ moduleName, color }: { moduleName: string; color: string }) {
  return <InteractiveModuleDemo moduleName={moduleName} color={color} />;
}

const ICON_MAP: Record<string, any> = { Users, DollarSign, UserCog, Briefcase, ShoppingCart, BarChart3, Calendar, Ticket, MessageSquare, FileCheck, Target, Sparkles, Shield, Globe, Zap, Activity, Layers };

const DEFAULT_FEATURE_SECTIONS = [
  {
    category: "CRM & Sales",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    accent: "text-blue-600",
    border: "border-blue-200",
    bg: "bg-blue-50/50",
    desc: "A complete client relationship and sales pipeline — from first contact to closed deal.",
    features: [
      "Client & contact management with full interaction history",
      "Visual pipeline with custom stages",
      "Opportunity tracking and forecasting",
      "Product catalog with pricing and discounts",
      "Quotations and proposals",
      "Activity logging (calls, emails, meetings)",
      "Lead source attribution and conversion tracking",
    ],
  },
  {
    category: "Finance & Billing",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    accent: "text-emerald-600",
    border: "border-emerald-200",
    bg: "bg-emerald-50/50",
    desc: "Manage customer billing, business income, expenses, and account-level financial activity.",
    features: [
      "Invoice creation with itemized line items",
      "Recurring invoice schedules",
      "Payment tracking, receipts, and payment plans",
      "Expense and budget tracking",
      "Chart of accounts with debit and credit balances",
      "Non-sales inflows for grants, other income, equity, and loans",
      "Bank reconciliation and financial reports",
      "Separate organization and platform accounting scopes",
    ],
  },
  {
    category: "HR & Payroll",
    icon: UserCog,
    color: "from-violet-500 to-purple-600",
    accent: "text-violet-600",
    border: "border-violet-200",
    bg: "bg-violet-50/50",
    desc: "Coordinate employee records, leave, attendance, payroll, and performance workflows.",
    features: [
      "Employee records with document management",
      "Department and job group hierarchy",
      "Flexible leave date and duration entry with weekday-based day counts",
      "Attendance tracking with clock in/out",
      "Payroll processing with allowances and deductions",
      "Payslip generation and payroll reporting",
      "Performance reviews and appraisals",
    ],
  },
  {
    category: "Projects & Work Orders",
    icon: Briefcase,
    color: "from-amber-500 to-orange-600",
    accent: "text-amber-600",
    border: "border-amber-200",
    bg: "bg-amber-50/50",
    desc: "Deliver projects on time and on budget with complete visibility.",
    features: [
      "Project creation with milestones and phases",
      "Task assignment with priorities and deadlines",
      "Time tracking per task and team member",
      "Budget vs actual cost tracking",
      "Work order management with field assignments",
      "Kanban and list views",
      "Team collaboration and file attachments",
    ],
  },
  {
    category: "Procurement",
    icon: ShoppingCart,
    color: "from-rose-500 to-red-600",
    accent: "text-rose-600",
    border: "border-rose-200",
    bg: "bg-rose-50/50",
    desc: "Streamline purchasing from requisition to goods delivery.",
    features: [
      "Purchase requisitions with approval workflows",
      "Local Purchase Orders (LPO) generation",
      "Supplier management and vendor ratings",
      "Goods Received Notes (GRN)",
      "Invoice matching and reconciliation",
      "Procurement budget tracking",
      "Inventory and stock management",
    ],
  },
  {
    category: "Templates & Documents",
    icon: FileCheck,
    color: "from-slate-500 to-gray-700",
    accent: "text-slate-700",
    border: "border-slate-200",
    bg: "bg-slate-50/50",
    desc: "Create, reuse and automate document templates across the platform.",
    features: [
      "Unified template system across modules (invoices, proposals, contracts)",
      "Default templates per organization and document type",
      "Email & SMS templates with variable placeholders",
      "Recurring invoice templates and template-based billing",
      "Generate PDFs from saved templates and export/print",
    ],
  },
  {
    category: "Analytics & Reports",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-600",
    accent: "text-cyan-600",
    border: "border-cyan-200",
    bg: "bg-cyan-50/50",
    desc: "Review business performance with role-scoped dashboards and reports.",
    features: [
      "Executive dashboard with KPI widgets",
      "Revenue, expense, account-balance, and cash activity reports",
      "Sales pipeline and conversion reports",
      "HR headcount and payroll reports",
      "Project completion and time reports",
      "Custom report builder",
      "CSV and PDF report exports",
    ],
  },
  {
    category: "SaaS Revenue & Billing",
    icon: DollarSign,
    color: "from-teal-500 to-cyan-700",
    accent: "text-teal-700",
    border: "border-teal-200",
    bg: "bg-teal-50/50",
    desc: "Review Kiini subscription revenue and the configured usage-based rate cards.",
    features: [
      "Subscription and usage-based rate cards",
      "Seat and usage metrics for billing calculations",
      "Revenue ledger entries with date and scope filters",
      "Correction by offset entries rather than editing posted charges",
      "Organization income and platform SaaS revenue views",
    ],
  },
  {
    category: "Organization Administration",
    icon: Shield,
    color: "from-slate-500 to-gray-700",
    accent: "text-slate-700",
    border: "border-slate-200",
    bg: "bg-slate-50/50",
    desc: "Configure organizations, roles, permissions, and accounting policies.",
    features: [
      "Organization-specific users, settings, and feature access",
      "Custom roles and permissions",
      "Department-head role and permission assignment",
      "Organization accounting policies",
      "Platform-wide administration for authorized super admins",
    ],
  },
  {
    category: "AI Hub",
    icon: Sparkles,
    color: "from-violet-600 to-indigo-700",
    accent: "text-violet-600",
    border: "border-violet-200",
    bg: "bg-violet-50/50",
    desc: "AI-powered assistance across all modules to speed up your workflows.",
    features: [
      "AI-assisted analysis and recommendations",
      "AI insights and anomaly detection tools",
      "AI-assisted business reporting",
    ],
  },
  {
    category: "Communications",
    icon: MessageSquare,
    color: "from-sky-500 to-cyan-600",
    accent: "text-sky-600",
    border: "border-sky-200",
    bg: "bg-sky-50/50",
    desc: "Keep your team and clients in sync with built-in messaging.",
    features: [
      "Internal team announcements",
      "Automated client notifications",
      "SMS and email dispatch",
      "Document sharing and attachments",
      "Activity feed per record",
    ],
  },
];

export default function Features() {
  const [, navigate] = useLocation();
  const { data: dbContent } = trpc.websiteAdmin.publicFeaturesContent.useQuery(undefined, { retry: false, staleTime: 300000 });

  const heroTitle = dbContent?.heroTitle || "Every feature your business demands";
  const heroBadge = dbContent?.heroBadge || "Connected business workflows";
  const heroSubtitle = dbContent?.heroSubtitle || "Kiini is not a collection of separate tools stitched together — it is one deeply integrated platform where every module shares data, permissions, and workflows.";

  const COLORS = [
    { color: "from-blue-500 to-blue-600", accent: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50/50" },
    { color: "from-emerald-500 to-teal-600", accent: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50/50" },
    { color: "from-violet-500 to-purple-600", accent: "text-violet-600", border: "border-violet-200", bg: "bg-violet-50/50" },
    { color: "from-amber-500 to-orange-600", accent: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50/50" },
    { color: "from-rose-500 to-red-600", accent: "text-rose-600", border: "border-rose-200", bg: "bg-rose-50/50" },
    { color: "from-cyan-500 to-blue-600", accent: "text-cyan-600", border: "border-cyan-200", bg: "bg-cyan-50/50" },
    { color: "from-violet-600 to-indigo-700", accent: "text-violet-600", border: "border-violet-200", bg: "bg-violet-50/50" },
    { color: "from-sky-500 to-cyan-600", accent: "text-sky-600", border: "border-sky-200", bg: "bg-sky-50/50" },
  ];

  const featureSections = dbContent?.sections?.length
    ? dbContent.sections.map((s: any, i: number) => ({
        ...s,
        icon: ICON_MAP[s.icon] || Users,
        ...(COLORS[i % COLORS.length]),
      }))
    : DEFAULT_FEATURE_SECTIONS;

  const defaultPillars = [
    { icon: Shield, title: "Role-aware access", desc: "Use roles and custom permissions to align module access with responsibilities." },
    { icon: Zap, title: "Connected workflows", desc: "Move records through daily work, review, approval, and reporting in one platform." },
    { icon: Globe, title: "Organization scope", desc: "Keep organization-level operations distinct from platform-wide administration." },
    { icon: Activity, title: "Financial traceability", desc: "Review income, expenses, account balances, and correction entries with their context." },
  ];
  const pillars = dbContent?.pillars?.length
    ? dbContent.pillars.map((p: any) => ({ ...p, icon: ICON_MAP[p.icon] || Shield }))
    : defaultPillars;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <WebsiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Layers className="mr-1.5 h-3 w-3" /> {heroBadge}
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none">
            {heroTitle}
          </h1>
          <div className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed" dangerouslySetInnerHTML={{ __html: heroSubtitle }} />
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200"
            onClick={() => navigate("/login")}
          >
            Access the Platform <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Feature cards grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureSections.map((section: any, idx: number) => {
            const Icon = section.icon;
            const featureId = section.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
            return (
              <button
                key={section.category}
                onClick={() => navigate(`/features/${featureId}`)}
                className={cn(
                  "group text-left rounded-2xl border p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer",
                  "hover:border-transparent hover:-translate-y-1",
                  section.border,
                  section.bg,
                )}
              >
                {/* Icon and title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shrink-0 shadow-lg", section.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold leading-tight group-hover:text-indigo-600 transition-colors">{section.category}</h3>
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700" dangerouslySetInnerHTML={{ __html: section.desc }} />

                {/* Feature count */}
                <div className="mb-4">
                  <span className={cn("inline-block text-xs font-semibold px-3 py-1 rounded-full", section.bg, section.accent)}>
                    {section.features.length} features
                  </span>
                </div>

                {/* Preview of features */}
                <div className="space-y-2 mb-4">
                  {section.features.slice(0, 3).map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className={cn("h-3 w-3 shrink-0 mt-0.5", section.accent)} />
                      <span className="text-xs text-gray-600 line-clamp-1">{f}</span>
                    </div>
                  ))}
                  {section.features.length > 3 && (
                    <div className="text-xs text-indigo-600 font-semibold pt-2">
                      +{section.features.length - 3} more features →
                    </div>
                  )}
                </div>

                {/* CTA indicator */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 group-hover:border-indigo-200">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-indigo-600">Learn more</span>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform pillars */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Platform fundamentals</p>
          <h2 className="text-4xl md:text-5xl font-black mb-14">Solid foundations, every layer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p: any) => {
              const Icon = typeof p.icon === 'string' ? (ICON_MAP[p.icon] || Shield) : p.icon;
              return (
                <div key={p.title} className="rounded-2xl border border-gray-200 bg-white p-7 text-center hover:shadow-lg hover:border-indigo-300 transition-all">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 mb-5">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                  <div className="text-sm text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.desc }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-5">See it in action</h2>
            <p className="text-gray-500 text-lg">Request a demo and we will walk you through every module, or explore our pricing.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col" onClick={() => navigate("/book-a-demo")}>
              <span className="text-base">Book a Demo</span>
              <span className="text-xs opacity-90 mt-1">Schedule your walkthrough</span>
            </Button>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col" onClick={() => navigate("/pricing")}>
              <span className="text-base">View Pricing</span>
              <span className="text-xs opacity-90 mt-1">Explore our plans</span>
            </Button>
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-8 py-6 h-auto flex-col" onClick={() => navigate("/contact")}>
              <span className="text-base">Get Support</span>
              <span className="text-xs text-gray-500 mt-1">Have questions?</span>
            </Button>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
