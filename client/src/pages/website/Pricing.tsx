import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { WebsiteNav } from "./WebsiteNav";
import { WebsiteFooter } from "./WebsiteFooter";
import { CheckCircle, X, ArrowRight, Zap, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency, CURRENCIES, type CurrencyCode } from "./CurrencyContext";
import { trpc } from "@/lib/trpc";

const FEATURE_LABELS: Record<string, string> = {
  crm: "Core CRM & Sales",
  invoicing: "Invoicing & Payments",
  payments: "Payments",
  expenses: "Expenses",
  hr: "HR records",
  payroll: "Payroll",
  leave: "Leave & Attendance",
  attendance: "Attendance",
  projects: "Projects module",
  procurement: "Procurement",
  accounting: "Accounting",
  budgets: "Budgets",
  reports: "Reports",
  ai_hub: "AI Hub",
  communications: "Team communication",
  tickets: "Support tickets",
  contracts: "Contracts",
  work_orders: "Work orders",
};

const FEATURE_ORDER = [
  "crm",
  "invoicing",
  "payments",
  "projects",
  "hr",
  "payroll",
  "leave",
  "attendance",
  "procurement",
  "accounting",
  "budgets",
  "reports",
  "ai_hub",
  "communications",
  "tickets",
  "contracts",
  "work_orders",
];

const DEFAULT_PLANS = [
  {
    key: "trial",
    name: "Trial",
    monthlyKes: 0, annualKes: 0,
    desc: "A 7-day trial for evaluating core workflows.",
    highlight: false,
    badge: null as string | null,
    cta: "Start Free Trial",
    link: "/signup",
    features: [
      { text: "Up to 5 users", included: true },
      { text: "CRM & sales", included: true },
      { text: "Invoicing", included: true },
      { text: "Reports", included: true },
    ],
  },
  {
    key: "starter",
    name: "Starter",
    monthlyKes: 3500, annualKes: 35000,
    desc: "Core customer and finance workflows for teams of up to 10 users.",
    highlight: false,
    badge: null as string | null,
    cta: "Get Started",
    link: "/login",
    features: [
      { text: "Up to 10 users", included: true },
      { text: "CRM & sales workflows", included: true },
      { text: "Invoicing and payments", included: true },
      { text: "Expenses and support tickets", included: true },
      { text: "Reports", included: true },
    ],
  },
  {
    key: "gold",
    name: "Gold",
    monthlyKes: 8500, annualKes: 85000,
    desc: "Expanded finance, people, project, and reporting workflows for up to 50 users.",
    highlight: false,
    badge: null as string | null,
    cta: "Get Started",
    link: "/login",
    features: [
      { text: "Up to 50 users", included: true },
      { text: "Projects, HR, leave, and attendance", included: true },
      { text: "Accounting and budgets", included: true },
      { text: "Communications, reports, and support tickets", included: true },
    ],
  },
  {
    key: "professional",
    name: "Professional",
    monthlyKes: 18500, annualKes: 185000,
    desc: "The Gold workflow set with capacity for up to 100 users.",
    highlight: true,
    badge: "Most Popular" as string | null,
    cta: "Get Started",
    link: "/login",
    features: [
      { text: "Up to 100 users", included: true },
      { text: "Gold workflow set", included: true },
      { text: "Expanded user capacity", included: true },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthlyKes: 59000, annualKes: 590000,
    desc: "All configured product areas for teams of up to 500 users.",
    highlight: false,
    badge: null as string | null,
    cta: "Contact Sales",
    link: "/contact",
    features: [
      { text: "Up to 500 users", included: true },
      { text: "All configured product areas", included: true },
      { text: "Payroll, procurement, AI Hub, contracts, and work orders", included: true },
    ],
  },
  {
    key: "custom",
    name: "Custom",
    monthlyKes: 0, annualKes: 0,
    desc: "Contact sales to discuss a plan for your organization.",
    highlight: false,
    badge: null as string | null,
    cta: "Talk to Sales",
    link: "/contact",
    features: [
      { text: "Custom user limits", included: true },
      { text: "Plan details confirmed with sales", included: true },
    ],
  },
];

type ComparisonCategoryRow = { category: string };
type ComparisonValueRow = { label: string; starter?: string | boolean; pro?: string | boolean; ent?: string | boolean } & Record<string, string | boolean | undefined>;
type ComparisonRow = ComparisonCategoryRow | ComparisonValueRow;

const DEFAULT_COMPARISON_ROWS: ComparisonRow[] = [
  { category: "User capacity" },
  { label: "Maximum users", trial: "Up to 5", starter: "Up to 10", gold: "Up to 50", pro: "Up to 100", ent: "Up to 500", custom: "Custom" },
  { category: "Product areas" },
  { label: "CRM & sales", trial: true, starter: true, gold: true, pro: true, ent: true, custom: true },
  { label: "Invoicing", trial: true, starter: true, gold: true, pro: true, ent: true, custom: true },
  { label: "Payments", trial: false, starter: true, gold: true, pro: true, ent: true, custom: true },
  { label: "Expenses & support tickets", trial: false, starter: true, gold: true, pro: true, ent: true, custom: true },
  { label: "Reports", trial: true, starter: true, gold: true, pro: true, ent: true, custom: true },
  { label: "Projects", trial: false, starter: false, gold: true, pro: true, ent: true, custom: true },
  { label: "HR, leave & attendance", trial: false, starter: false, gold: true, pro: true, ent: true, custom: true },
  { label: "Accounting & budgets", trial: false, starter: false, gold: true, pro: true, ent: true, custom: true },
  { label: "Communications", trial: false, starter: false, gold: true, pro: true, ent: true, custom: true },
  { label: "Payroll", trial: false, starter: false, gold: false, pro: false, ent: true, custom: true },
  { label: "Procurement, contracts & work orders", trial: false, starter: false, gold: false, pro: false, ent: true, custom: true },
  { label: "AI Hub", trial: false, starter: false, gold: false, pro: false, ent: true, custom: true },
];

type PricingFeature = { text: string; included: boolean };

type PricingPlanData = {
  key?: string;
  name?: string;
  planName?: string;
  planSlug?: string;
  tier?: string;
  monthlyKes?: number;
  annualKes?: number;
  monthlyPrice?: number | string;
  annualPrice?: number | string;
  description?: string;
  desc?: string;
  highlight?: boolean;
  badge?: string | null;
  cta?: string;
  ctaLink?: string;
  link?: string;
  features?: unknown;
  [key: string]: unknown;
};

function parsePlanFeatures(features: unknown, fallbackFeatures?: Record<string, boolean>): PricingFeature[] {
  const fromFallback = () => fallbackFeatures
    ? FEATURE_ORDER.filter((key) => key in fallbackFeatures).map((key) => ({
      text: FEATURE_LABELS[key] || key,
      included: Boolean(fallbackFeatures[key]),
    }))
    : [];

  if (!features || (typeof features === "object" && !Array.isArray(features) && Object.keys(features).length === 0)) {
    return fromFallback();
  }
  const featureObj = typeof features === "string" ? (() => {
    try { return JSON.parse(features); } catch { return null; }
  })() : features;

  if (Array.isArray(featureObj)) {
    const parsedFeatures = featureObj
      .map((feature: any) => {
        if (typeof feature === "string") return { text: feature, included: true };
        if (!feature || typeof feature !== "object") return null;
        const key = feature.featureKey || feature.key || feature.name || feature.text || feature.label;
        if (!key) return null;
        return {
          text: FEATURE_LABELS[key] || feature.label || feature.name || feature.text || String(key).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          included: feature.included ?? feature.isEnabled ?? true,
        };
      })
      .filter(Boolean) as PricingFeature[];
    return parsedFeatures.length ? parsedFeatures : fromFallback();
  }
  if (featureObj && typeof featureObj === "object") {
    return FEATURE_ORDER.filter((key: string) => key in featureObj).map((key: string) => ({
      text: FEATURE_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      included: Boolean((featureObj as Record<string, unknown>)[key]),
    }));
  }
  return fromFallback();
}

function normalizeDbPlan(plan: PricingPlanData, fallbackFeatures?: Record<string, boolean>) {
  const planKey = plan.planSlug || plan.tier || plan.key || String(plan.name || plan.planName || "").toLowerCase().replace(/\s+/g, "-");
  const monthlyKes = Number(plan.monthlyPrice ?? plan.monthlyKes ?? 0);
  const annualKes = Number(plan.annualPrice ?? plan.annualKes ?? Math.round(monthlyKes * 12 * 0.8));
  const features = parsePlanFeatures(plan.features, fallbackFeatures);
  const displayName = plan.planName || plan.name || plan.label || plan.key || planKey;
  const defaultCtaLink = monthlyKes > 0
    ? `/signup?plan=${encodeURIComponent(planKey)}&next=${encodeURIComponent(`/checkout/${planKey}`)}`
    : "/contact";

  return {
    key: planKey,
    name: displayName,
    monthlyKes,
    annualKes,
    desc: plan.description || plan.desc || "",
    highlight: plan.highlight ?? plan.tier === "professional",
    badge: plan.badge ?? null,
    cta: plan.cta ?? (monthlyKes > 0 ? "Get Started" : "Contact Sales"),
    ctaLink: plan.ctaLink ?? defaultCtaLink,
    features: features.length ? features : [],
    tier: plan.tier,
    planSlug: plan.planSlug,
  };
}

function Cell({ value }: { value: string | boolean | undefined }) {
  if (value === true)  return <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-gray-300 mx-auto" />;
  return <span className="text-sm text-gray-600">{value as string}</span>;
}

export default function Pricing() {
  const [, navigate] = useLocation();
  const [annual, setAnnual] = useState(false);
  const { currency, setCurrency, fmt } = useCurrency();

  // Fetch pricing from DB
  const { data: pricingData } = trpc.websiteAdmin.publicPricing.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Use DB-managed pricing config if available, otherwise fall back to defaults
  const customConfig = pricingData?.customConfig;
  const tierFeatures = (pricingData?.tierFeatures ?? {}) as Record<string, Record<string, boolean>>;
  const dbPlans = (pricingData?.plans ?? pricingData?.dbPlans ?? []).map((plan: PricingPlanData) => normalizeDbPlan(plan, tierFeatures[plan.planSlug || plan.tier || plan.key || ""]));
  const settingPlans = Object.entries(pricingData?.prices ?? {}).map(([key, value]) => normalizeDbPlan({ ...(value as PricingPlanData), key, planSlug: key }, tierFeatures[key]));
  const managedPlans = [
    ...dbPlans.filter((dbPlan) => !settingPlans.some((settingPlan) => settingPlan.key === dbPlan.key)),
    ...settingPlans,
  ];
  const hasManagedPlans = managedPlans.length > 0;
  const PLANS = hasManagedPlans ? managedPlans : (customConfig?.plans || DEFAULT_PLANS);
  const COMPARISON_ROWS: ComparisonRow[] = (customConfig?.comparisonRows as ComparisonRow[]) || DEFAULT_COMPARISON_ROWS;
  const faqItems = customConfig?.faq || [
    { q: "Can I change plans later?",         a: "Yes. You can upgrade or downgrade at any time. Pro-rated billing is applied automatically." },
    { q: "How are users counted?",             a: "A user is any person invited to your organization who has login access. Deactivated users do not count." },
    { q: "Is there a free trial?",             a: "Yes — new organizations start with a free 7-day Trial tier, no credit card required." },
    { q: "Do you offer discounts for NGOs?",  a: "Yes. We offer 30% discounts for registered non-profit organizations. Contact sales for details." },
  ];

  const mergedPlans = !hasManagedPlans && !customConfig && pricingData?.prices
    ? PLANS.map((plan: any) => {
      const tierMap: Record<string, string> = { 'Starter': 'starter', 'Professional': 'professional', 'Enterprise': 'enterprise' };
      const tier = plan.key || plan.tier || tierMap[plan.name];
      const priceData = tier ? pricingData.prices?.[tier] : null;
      if (priceData) {
        return {
          ...plan,
          monthlyKes: priceData.monthlyKes || plan.monthlyKes,
          annualKes: priceData.annualKes || Math.round((priceData.monthlyKes || plan.monthlyKes) * 12 * 0.8),
          desc: priceData.description || plan.desc,
        };
      }
      return plan;
    })
    : PLANS;

  const planPrice = (plan: typeof DEFAULT_PLANS[0]) => {
    if (plan.monthlyKes === 0) return plan.key === "trial" ? "Free" : "Custom";
    return annual ? fmt(plan.annualKes / 12) : fmt(plan.monthlyKes);
  };

  const planKeyFor = (plan: any) => plan.planSlug || plan.key || plan.tier || plan.name?.toLowerCase()?.replace(/\s+/g, "-");
  const planCtaLink = (plan: any) => {
    if (plan.monthlyKes === 0 && planKeyFor(plan) !== "trial" || plan.cta === "Contact Sales") return plan.ctaLink || plan.link || "/contact";
    const key = planKeyFor(plan);
    return `/signup?plan=${encodeURIComponent(key)}&next=${encodeURIComponent(`/checkout/${key}`)}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <WebsiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Zap className="mr-1.5 h-3 w-3" /> Simple, transparent pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Plans that grow<br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              with your business
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10">
            Compare user limits and the product areas included with each current tier.
          </p>

          {/* Currency selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 px-3 text-xs text-gray-400"><Globe className="h-3 w-3" /> Currency:</span>
              {CURRENCIES.map((c: { code: CurrencyCode; symbol: string; name: string }) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    currency.code === c.code ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-full border border-gray-200 p-1.5 bg-gray-50">
            <button
              className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all", !annual ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900")}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={cn("px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2", annual ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-900")}
              onClick={() => setAnnual(true)}
            >
              Annual
              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0 px-1.5 py-0">Annual billing</Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mergedPlans.map((plan: any) => (
              <div
                key={plan.key || plan.name}
                className={cn(
                  "rounded-2xl border p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                  plan.highlight
                    ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100 relative"
                    : "border-gray-200 bg-white",
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white border-0 px-3 py-1 text-xs shadow-lg">{plan.badge}</Badge>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black">{planPrice(plan)}</span>
                  {plan.monthlyKes !== 0 && <span className="text-gray-400 text-sm">/mo</span>}
                </div>
                {annual && plan.monthlyKes !== 0 && (
                  <p className="text-xs text-emerald-600 mb-3">Billed annually: {fmt(plan.annualKes)} total</p>
                )}
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f: PricingFeature) => (
                    <li key={f.text} className="flex items-start gap-2.5 text-sm">
                      {f.included
                        ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        : <X className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />}
                      <span className={f.included ? "text-gray-600" : "text-gray-400"}>{f.text}</span>
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
                  onClick={() => navigate(planCtaLink(plan))}
                >
                  {plan.cta} {plan.cta !== "Contact Sales" && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Full comparison</h2>
            <p className="text-gray-500">Everything, side by side.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Feature</TableHead>
                {mergedPlans.map((plan: any) => (
                  <TableHead key={plan.key || plan.name} className="text-center">{plan.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row: ComparisonRow, i: number) => {
                if ("category" in row) {
                  const category = String(row.category);
                  return (
                    <TableRow key={category || `category-${i}`} className="bg-gray-50/80">
                      <TableCell colSpan={mergedPlans.length + 1} className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-indigo-600">
                        {category}
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={row.label || `row-${i}`}>
                    <TableCell className="text-gray-600">{row.label}</TableCell>
                    {mergedPlans.map((plan: any) => {
                      const key = plan.key === "professional" ? "pro" : plan.key === "enterprise" ? "ent" : plan.key;
                      return <TableCell key={plan.key || plan.name} className="text-center"><Cell value={row[key]} /></TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-10">Pricing FAQ</h2>
          <div className="space-y-6">
            {faqItems.map((item: any) => (
              <div key={item.q} className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                <h4 className="font-semibold mb-2">{item.q}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-5">Not sure which plan?</h2>
          <p className="text-gray-500 mb-8 text-lg">Talk to us — we will help you choose the right fit.</p>
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200" onClick={() => navigate("/contact")}>
            Talk to Sales <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
