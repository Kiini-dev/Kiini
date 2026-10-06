import React, { useEffect, useState } from "react";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebsiteNav } from "./website/WebsiteNav";
import { WebsiteFooter } from "./website/WebsiteFooter";
import { MockDashboardScreenshot, MockCRMScreenshot, MockFinanceScreenshot, MockHRScreenshot } from "./website/WebsiteMocks";
import { useCurrency, CURRENCIES, type CurrencyCode } from "./website/CurrencyContext";
import {
  ArrowRight, CheckCircle, Zap, Shield, BarChart3, Users, FileText,
  DollarSign, Briefcase, Package, CreditCard, TrendingUp, MessageSquare,
  Globe, Lock, Clock, Sparkles, Building2, ChevronRight, Star,
  Receipt, UserCog, Calendar, ShoppingCart, Layers, Activity,
  BookOpen, HelpCircle, Ticket, Target, FileCheck, Cloud, Server, Cpu, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Module data ──────────────────────────────────────────────
const MODULES = [
  { icon: Users,         label: "CRM & Sales",          color: "from-blue-500 to-blue-600",     desc: "Clients, contacts, opportunities, sales pipeline" },
  { icon: DollarSign,    label: "Accounting & Finance", color: "from-emerald-500 to-teal-600",  desc: "Invoices, payments, expenses, accounts, and income" },
  { icon: UserCog,       label: "HR & Payroll",         color: "from-violet-500 to-purple-600", desc: "Employee records, payroll, leave, and approvals" },
  { icon: Briefcase,     label: "Projects & Services",  color: "from-amber-500 to-orange-600",  desc: "Projects, tasks, service delivery, and work orders" },
  { icon: ShoppingCart,  label: "Procurement",          color: "from-rose-500 to-red-600",      desc: "Suppliers, purchase orders, goods received, inventory" },
  { icon: BarChart3,     label: "Reports & Analytics",  color: "from-cyan-500 to-blue-600",     desc: "Operational, financial, HR, and custom reports" },
  { icon: Calendar,      label: "Leave & Attendance",   color: "from-fuchsia-500 to-pink-600",  desc: "Attendance, leave balances, and request workflows" },
  { icon: Ticket,        label: "Support Tickets",      color: "from-indigo-500 to-violet-600", desc: "Ticket intake, assignment, and resolution tracking" },
  { icon: MessageSquare, label: "Communications",       color: "from-sky-500 to-cyan-600",      desc: "Email, SMS, team messages, and notifications" },
  { icon: FileCheck,     label: "Documents & Contracts",color: "from-lime-500 to-green-600",    desc: "Document templates, records, and contract workflows" },
  { icon: Target,        label: "Budgets & Inflows",    color: "from-orange-500 to-amber-600",  desc: "Budgets, non-sales income, and account classifications" },
  { icon: Sparkles,      label: "AI & Automation",      color: "from-violet-600 to-indigo-700", desc: "AI-assisted insights and configurable workflow support" },
  { icon: Layers,        label: "SaaS Revenue",         color: "from-teal-500 to-cyan-700",     desc: "Platform subscriptions, usage rates, and revenue ledger" },
  { icon: Shield,        label: "Organization Controls",color: "from-slate-500 to-slate-700",   desc: "Organization settings, roles, permissions, and policies" },
];

// ── Features data ────────────────────────────────────────────
const FEATURES = [
  { icon: Layers,    title: "Connected business workflows", highlight: "One platform", desc: "Bring customer, finance, people, project, procurement, and service work into a shared operating hub." },
  { icon: Shield,    title: "Role-aware access",            highlight: "Configurable permissions", desc: "Use roles and custom permissions to shape what teams can see and do, with audit history and MFA support." },
  { icon: BarChart3, title: "Reports & analytics",           highlight: "Cross-functional", desc: "Review financial and operational activity through dashboards, reports, and AI-assisted analysis." },
  { icon: Users,     title: "Organization workspaces",       highlight: "Scoped operations", desc: "Manage organization records and settings separately, with platform-wide views for authorized administrators." },
  { icon: Globe,     title: "Built for regional operations", highlight: "Multi-currency", desc: "Support multi-currency workflows and Kenyan payroll and payment use cases." },
  { icon: Zap,       title: "Approval workflows",            highlight: "Configured processes", desc: "Route leave, payroll, expenses, and other operational work through role-based review and approval." },
];

// ── Pricing tiers ────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    monthlyKes: 3500,
    per: "/mo",
    desc: "Ideal for growing teams that want a clear operating hub.",
    highlight: false,
    badge: null as string | null,
    features: ["Up to 10 users", "CRM & sales workflows", "Invoicing & payments", "Expenses & support tickets", "Reports"],
  },
  {
    name: "Gold",
    monthlyKes: 8500,
    per: "/mo",
    desc: "Expanded operations for teams managing more complexity.",
    highlight: false,
    badge: null as string | null,
    features: ["Up to 50 users", "Projects, HR, leave & attendance", "Accounting & budgets", "Reports & communications", "Support tickets"],
  },
  {
    name: "Professional",
    monthlyKes: 18500,
    per: "/mo",
    desc: "A full operations suite for established businesses.",
    highlight: true,
    badge: "Most Popular",
    features: ["Up to 100 users", "Gold workflow set", "Expanded user capacity"],
  },
  {
    name: "Enterprise",
    monthlyKes: 59000,
    per: "/mo",
    desc: "All modules, deeper support, and custom scale for complex organizations.",
    highlight: false,
    badge: null as string | null,
    features: ["Up to 500 users", "All configured product areas", "Payroll, procurement, AI Hub, contracts & work orders"],
  },
  {
    name: "Custom",
    monthlyKes: 0,
    per: "",
    desc: "Custom pricing for larger teams, tailored workflows, and strategic deployment needs.",
    highlight: false,
    badge: null as string | null,
    features: ["Custom user limits", "Tailored workflows", "Custom integrations", "Priority onboarding", "Dedicated support plan"],
  },
];

const STATS = [
  { value: "CRM → cash", label: "Customer-to-cash workflows" },
  { value: "Dr / Cr", label: "Account balance presentation" },
  { value: "Multi-org", label: "Organization-aware workspaces" },
  { value: "Kenya + beyond", label: "Regional operating context" },
];

const DEFAULT_HERO_SLIDES = [
  {
    id: "operations", badge: "One connected hub", title: "Run your business from one clear operating core.",
    subtitle: "Kiini brings customer relationships, finance, people, projects, procurement, and reporting together so teams can work from shared records instead of disconnected tools.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=85",
    ctaPrimary: { label: "Start a Demo", href: "/book-a-demo" }, ctaSecondary: { label: "Explore Features", href: "/features" },
  },
  {
    id: "finance", badge: "Finance that stays in sync", title: "Turn transactions into decisions with control.",
    subtitle: "Create invoices, track payments, manage budgets, and review performance from a single platform designed for real operating complexity.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1800&q=85",
    ctaPrimary: { label: "See Finance", href: "/features" }, ctaSecondary: { label: "View Pricing", href: "/pricing" },
  },
  {
    id: "people", badge: "Built for African teams", title: "Support people, payroll, and performance in one place.",
    subtitle: "From attendance and payroll to permissions and approvals, Kiini helps teams stay aligned, accountable, and ready for growth.",
    imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85",
    ctaPrimary: { label: "Talk to Sales", href: "/contact" }, ctaSecondary: { label: "Meet the Platform", href: "/about" },
  },
];

const TESTIMONIALS: Array<{ name: string; title: string; stars: number; body: string }> = [];

const FAQ_ITEMS = [
  { q: "Can I manage multiple organizations or branches?", a: "Yes. Kiini supports multi-tenant deployments with data isolation between organizations, while still giving teams access to the shared tools they need to run operations centrally." },
  { q: "How does user access control work?", a: "Kiini includes role-based access controls, configurable permissions, audit logs, MFA, and secure access patterns so different teams can work without exposing unrelated data." },
  { q: "Is Kiini designed for African businesses?", a: "Yes. Kiini is built with African operating realities in mind, including local payments, payroll, compliance context, and multi-currency support for organizations working in Kenya and beyond." },
  { q: "Can we self-host or choose our deployment model?", a: "Kiini supports managed cloud, self-hosted Docker deployments, and private-cloud or VPC environments for organizations needing more control over infrastructure and data location." },
  { q: "How is data security handled?", a: "The platform highlights role-based access, audit controls, encryption at rest and in transit, and a multi-tenant design that keeps organizational data separated." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 font-medium hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <ChevronRight className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuthWithPersistence();
  const [, navigate] = useLocation();
  const { fmt, currency, setCurrency } = useCurrency();

  // Pull content from admin DB with hardcoded fallbacks
  const { data: dbTestimonials } = trpc.websiteAdmin.publicTestimonials.useQuery();
  const { data: dbFAQs } = trpc.websiteAdmin.publicFAQs.useQuery();
  const { data: dbHero } = trpc.websiteAdmin.publicHeroContent.useQuery();
  const { data: dbPricing } = trpc.websiteAdmin.publicPricing.useQuery(undefined, { staleTime: 5 * 60 * 1000, retry: false });
  const [activeHero, setActiveHero] = useState(0);

  const configuredHeroSlides = Array.isArray(dbHero?.slides)
    ? dbHero.slides
      .filter((slide: any) => slide.isActive !== false)
      .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    : [];
  const heroSlides = (configuredHeroSlides.length > 0
    ? configuredHeroSlides
    : DEFAULT_HERO_SLIDES.map((slide, index) => index === 0 && dbHero?.title
      ? {
        ...slide,
        badge: dbHero.badge || slide.badge,
        title: dbHero.title,
        subtitle: dbHero.subtitle || slide.subtitle,
        ctaPrimary: dbHero.ctaPrimary || slide.ctaPrimary,
        ctaSecondary: dbHero.ctaSecondary || slide.ctaSecondary,
      }
      : slide)) as typeof DEFAULT_HERO_SLIDES;
  const currentHero = heroSlides[activeHero] || heroSlides[0];

  useEffect(() => {
    setActiveHero((index) => Math.min(index, Math.max(heroSlides.length - 1, 0)));
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const timer = window.setInterval(() => setActiveHero((index) => (index + 1) % heroSlides.length), 7000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const testimonials = dbTestimonials && dbTestimonials.length > 0
    ? dbTestimonials.map((t: any) => ({ name: t.name, title: `${t.role || ""}${t.company ? `, ${t.company}` : ""}`, stars: t.rating || 5, body: t.content }))
    : TESTIMONIALS;

  const faqItems = dbFAQs && dbFAQs.length > 0
    ? dbFAQs.map((f: any) => ({ q: f.question, a: f.answer }))
    : FAQ_ITEMS;

  const heroStats = dbHero?.stats && dbHero.stats.length > 0 ? dbHero.stats : STATS;
  const landingPlanRows = [
    ...(dbPricing?.dbPlans ?? []),
    ...Object.entries(dbPricing?.prices ?? {}).map(([key, value]) => ({ ...(value as any), planSlug: key })),
  ].filter((plan: any, index: number, plans: any[]) => plans.findIndex((candidate) => (candidate.planSlug || candidate.tier) === (plan.planSlug || plan.tier)) === index);
  const landingPlans = landingPlanRows.length > 0
    ? landingPlanRows.map((plan: any) => {
      const features = typeof plan.features === "string" ? (() => { try { return Object.entries(JSON.parse(plan.features)).filter(([, enabled]) => Boolean(enabled)).slice(0, 7).map(([key]) => key.replace(/_/g, " ")); } catch { return []; } })() : Array.isArray(plan.features) ? plan.features.slice(0, 7).map(String) : [];
      return { name: plan.planName || plan.planSlug, monthlyKes: Number(plan.monthlyPrice || 0), desc: plan.description || "", highlight: plan.tier === "professional", badge: plan.tier === "professional" ? "Most Popular" : null, features };
    })
    : PLANS;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Animation styles */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-subtle { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-fadeInUp { animation: fadeInUp 0.7s ease-out both; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out both; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; } .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; } .delay-500 { animation-delay: 0.5s; }
      `}</style>
      <WebsiteNav overlay />

      {/* ── Hero slider ── */}
      <section className="relative min-h-[760px] overflow-hidden bg-slate-950 text-white sm:min-h-[720px] lg:min-h-[760px]">
        {heroSlides.map((slide: any, index: number) => (
          <div key={slide.id || index} className={cn("absolute inset-0 transition-opacity duration-700", index === activeHero ? "opacity-100" : "pointer-events-none opacity-0")}>
            <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/72" />
          </div>
        ))}
        <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-4 pb-44 pt-28 sm:min-h-[720px] sm:px-6 sm:pb-36 sm:pt-32 lg:min-h-[760px] lg:px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <Badge className="mb-5 border-cyan-200/40 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-lg backdrop-blur-sm sm:mb-6"><Zap className="mr-1.5 h-3 w-3" />{currentHero.badge}</Badge>
            <h1 className="mb-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:mb-6 sm:text-5xl md:text-7xl">{currentHero.title}</h1>
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/90 sm:mb-10 sm:text-lg md:text-2xl">{currentHero.subtitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" className="w-full bg-cyan-400 px-6 py-6 text-base font-bold text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300 sm:w-auto sm:px-8" onClick={() => navigate(currentHero.ctaPrimary?.href || "/signup")}>{currentHero.ctaPrimary?.label || "Get Started"}<ArrowRight className="ml-2 h-5 w-5" /></Button>
              <Button size="lg" variant="outline" className="w-full border-white/70 bg-slate-950/25 px-6 py-6 text-base font-semibold text-white shadow-lg backdrop-blur-sm hover:border-white hover:bg-white/15 sm:w-auto sm:px-8" onClick={() => navigate(currentHero.ctaSecondary?.href || "/features")}>{currentHero.ctaSecondary?.label || "Explore Features"}</Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:bottom-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-5 md:grid-cols-4">{heroStats.map((s) => <div key={s.label}><p className="text-xl font-black sm:text-2xl">{s.value}</p><p className="text-xs text-white/75">{s.label}</p></div>)}</div>
          <div className="flex items-center gap-2 self-end"><button type="button" title="Previous slide" aria-label="Previous slide" className="rounded-full border border-white/50 bg-slate-950/30 p-2 text-white hover:bg-white/15" onClick={() => setActiveHero((activeHero - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft className="h-5 w-5" /></button><span className="text-sm font-medium text-white/85">{activeHero + 1} / {heroSlides.length}</span><button type="button" title="Next slide" aria-label="Next slide" className="rounded-full border border-white/50 bg-slate-950/30 p-2 text-white hover:bg-white/15" onClick={() => setActiveHero((activeHero + 1) % heroSlides.length)}><ChevronRight className="h-5 w-5" /></button></div>
        </div>
      </section>

      {/* ── Module Grid ── */}
      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">What's included</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Connected tools for everyday operations</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Explore key capability areas across sales, finance, people, delivery, and administration. Available features depend on your organization and role.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.label}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 cursor-default"
                  title={mod.desc}
                >
                  <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-4 shadow-md", mod.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{mod.label}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Why Kiini</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Built for serious operations</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Designed for enterprises that need reliability, control, and insight across every function.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all duration-300">
                  <Badge className="mb-5 bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs">{f.highlight}</Badge>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-6 w-6 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Organization controls ── */}
      <section className="py-24 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3 flex items-center justify-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Organization-ready
            </p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">
              Keep teams, records, and decisions
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> in context</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Kiini connects day-to-day work while keeping access and financial activity aligned to the right organization and role.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Building2, title: "Organization scope", desc: "Keep organization workspaces, settings, and accounting activity distinct.", color: "text-indigo-600" },
              { icon: Shield, title: "Role-aware permissions", desc: "Assign access by role and customize permissions for the work each team performs.", color: "text-violet-600" },
              { icon: Receipt, title: "Clear financial records", desc: "Track sales and non-sales income, expenses, account balances, and reconciliation activity.", color: "text-emerald-600" },
              { icon: Activity, title: "Reviewable workflows", desc: "Follow requests, approvals, and operational changes through their status and history.", color: "text-amber-600" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-lg transition-all" title={card.desc}>
                  <Icon className={cn("h-7 w-7 mb-4", card.color)} />
                  <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── App Showcase ── */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Live Platform</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">See Kiini in action</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Every module. One workspace. Real data, real time.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Sales Pipeline &amp; CRM</p>
              <MockCRMScreenshot />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Finance &amp; Invoicing</p>
              <MockFinanceScreenshot />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">HR &amp; Payroll</p>
              <MockHRScreenshot />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="h-8 w-8 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">More connected workflows</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">Explore projects, procurement, leave, accounting policies, non-sales inflows, SaaS revenue, tickets, and organization administration.</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white self-start shadow-sm" onClick={() => navigate("/features")}>
                Explore all features <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Simple onboarding</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Up and running in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Building2, title: "Set up your organization",  desc: "Create your Kiini workspace, invite admins, and configure your plan in minutes." },
              { step: "02", icon: Users,     title: "Add your team",             desc: "Invite staff with specific roles and permissions. They only see what they need." },
              { step: "03", icon: Activity,  title: "Run your business",         desc: "Manage clients, raise invoices, track payroll, and monitor everything from your dashboard." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center group">
                  <div className="text-6xl font-black text-gray-100 absolute -top-4 left-1/2 -translate-x-1/2 select-none group-hover:text-indigo-100 transition-colors">{item.step}</div>
                  <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Transparent pricing</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Plans that scale with you</h2>
            <p className="text-lg text-gray-500">Review the current plan limits and included product areas.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {landingPlans.map((plan: any) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-2xl border p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                  plan.highlight
                    ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100"
                    : "border-gray-200 bg-white",
                )}
              >
                {plan.badge && (
                  <Badge className="mb-4 self-start bg-indigo-600 text-white border-0 text-xs px-2.5">{plan.badge}</Badge>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-gray-900">{plan.monthlyKes === 0 ? "Custom" : fmt(plan.monthlyKes)}</span>
                  {plan.monthlyKes !== 0 && <span className="text-gray-400 text-sm">/mo</span>}
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full",
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                      : "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
                  )}
                  onClick={() => navigate(plan.monthlyKes === 0 ? "/contact" : "/pricing")}
                >
                  {plan.monthlyKes === 0 ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700" onClick={() => navigate("/pricing")}>
              Compare all features →
            </Button>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-24 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">Trusted by teams</p>
              <h2 className="text-4xl md:text-5xl font-black mb-5">What our customers say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.body}"</p>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 border-t border-gray-100 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-indigo-200/50 blur-3xl rounded-full" />
            <div className="relative flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 animate-float">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6">
            Ready to take{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              total control?
            </span>
          </h2>
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
            Join forward-thinking businesses that run everything on Kiini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200 hover:shadow-xl transition-all"
              onClick={() => navigate("/login")}
            >
              Launch Your Hub <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-10 py-6 text-lg transition-all"
              onClick={() => navigate("/contact")}
            >
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
