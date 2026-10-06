import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebsiteNav } from "./WebsiteNav";
import { WebsiteFooter } from "./WebsiteFooter";
import { ArrowRight, Zap, Shield, Users, Globe, Sparkles, Target, Heart, Lightbulb, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const ICON_MAP: Record<string, any> = { Shield, Lightbulb, Heart, Globe, Sparkles, Target, Award, Users, Zap };

const DEFAULT_VALUES = [
  {
    icon: Shield,
    title: "Security",
    desc: "Role-based access, MFA, audit trails, encryption at rest and in transit, and controlled permissions across the organization.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Lightbulb,
    title: "Clarity",
    desc: "We turn fragmented operations into one shared view so teams can act with confidence and fewer manual handoffs.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Heart,
    title: "Reliability",
    desc: "Teams need a system they can depend on for everyday work — from customer records to payroll, payments, and reporting.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: Globe,
    title: "Local relevance",
    desc: "Built for African business realities, including Kenyan payments, payroll, and compliance workflows, while supporting wider regional growth.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    desc: "AI-assisted analysis, automation, and continuous improvement help teams move faster without sacrificing control.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Accountability",
    desc: "Every process, role, and approval can be tracked so leadership has clear visibility into what is happening and why.",
    color: "from-cyan-500 to-blue-600",
  },
];

const DEFAULT_TEAM = [
  // No leadership biographies are published without verified team information.
];

export default function About() {
  const [, navigate] = useLocation();
  const { data: dbContent } = trpc.websiteAdmin.publicAboutContent.useQuery(undefined, { retry: false, staleTime: 300000 });

  const heroTitle = dbContent?.heroTitle || "The connected operating core for modern business";
  const heroSubtitle = dbContent?.heroSubtitle || "Kiini brings customer relationships, finance, people, projects, procurement, and reporting into one organization-aware system so teams can work from shared records, roles, and processes instead of disconnected tools.";
  const missionText = dbContent?.missionText || "Kiini brings customer, finance, people, project, procurement, and service workflows into one organization-aware platform. Teams can work from shared records while access and financial activity remain aligned to the organization and role.";
  const stats = dbContent?.stats?.length ? dbContent.stats : [
    { label: "Connected customer workflows", value: "CRM & sales" },
    { label: "Financial visibility", value: "Income & accounts" },
    { label: "People operations", value: "HR & payroll" },
    { label: "Organization access", value: "Role-aware" },
  ];
  const values = dbContent?.values?.length ? dbContent.values.map((v: any) => ({ ...v, icon: ICON_MAP[v.icon] || Shield })) : DEFAULT_VALUES;
  const team = dbContent?.team?.length ? dbContent.team : DEFAULT_TEAM;
  const cta = dbContent?.cta || { title: "Ready to work with us?", subtitle: "Let's talk about how Kiini can transform your operations.", actions: [{ label: "Book a Demo", href: "/book-a-demo", description: "See Kiini in action" }, { label: "Get in Touch", href: "/contact", description: "Contact our team" }, { label: "View Pricing", href: "/pricing", description: "Explore our plans" }] };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <WebsiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Zap className="mr-1.5 h-3 w-3" /> Our story
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none">
            {heroTitle}
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: heroSubtitle }} />
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-4">Our mission</p>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Give every business one hub. Total control.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                <div dangerouslySetInnerHTML={{ __html: missionText }} />
              </p>
              <p className="text-gray-500 leading-relaxed">
                We serve businesses across Africa and beyond, with particular depth in Kenya's financial and compliance ecosystem — from M-Pesa to KRA to Kenyan payroll statutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s: any) => (
                <div key={s.label} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 text-center hover:shadow-md transition-shadow">
                  <p className="text-4xl font-black text-indigo-600 mb-1">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {team.length > 0 && <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">What we stand for</p>
            <h2 className="text-4xl md:text-5xl font-black">Our values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v: { title: string; icon: React.ComponentType<{ className?: string }>; color: string; desc: string }) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:border-indigo-300 transition-all">
                  <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br mb-5", v.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                  <div className="text-sm text-gray-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: v.desc }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>}

      {/* Team */}
      <section className="py-24 border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">The people</p>
            <h2 className="text-4xl md:text-5xl font-black">Leadership team</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member: any) => (
              <div key={member.name} className="rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg hover:border-indigo-300 transition-all">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-5">
                  <span className="text-xl font-black text-white">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-base mb-0.5">{member.name}</h3>
                <p className="text-xs text-indigo-600 mb-3">{member.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-white to-indigo-50/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-5">{cta.title}</h2>
            <div className="text-gray-500 text-lg" dangerouslySetInnerHTML={{ __html: cta.subtitle }} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {cta.actions.map((action: any, index: number) => <Button key={`${action.label}-${index}`} size="lg" variant={index === 2 ? "outline" : "default"} className={index === 2 ? "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-8 py-6 h-auto flex-col" : "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col"} onClick={() => navigate(action.href)}><span className="text-base">{action.label}</span><span className="text-xs opacity-90 mt-1">{action.description}</span></Button>)}
          </div>
        </div>
      </section>

      <WebsiteFooter />
    </div>
  );
}
