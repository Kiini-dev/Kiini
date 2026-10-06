import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ChevronRight, FileText, LayoutDashboard, LogIn, Plus, Search, Users } from "lucide-react";

interface InteractiveModuleDemoProps {
  moduleName: string;
  color?: string;
}

type DemoRecord = { id: number; name: string; detail: string; status: string };

const MODULES: Record<string, { icon: string; description: string; records: DemoRecord[] }> = {
  CRM: { icon: "📊", description: "Manage clients and sales relationships", records: [{ id: 1, name: "Acme Group", detail: "Enterprise client · Nairobi", status: "Active" }, { id: 2, name: "BlueStar Inc", detail: "Opportunity · KSh 340,000", status: "Proposal" }] },
  Finance: { icon: "💰", description: "Track invoices, payments, and cash flow", records: [{ id: 1, name: "INV-2026-042", detail: "Acme Group · KSh 184,000", status: "Paid" }, { id: 2, name: "INV-2026-043", detail: "BlueStar Inc · KSh 92,500", status: "Pending" }] },
  HR: { icon: "👥", description: "Run people operations and payroll", records: [{ id: 1, name: "James Kariuki", detail: "Engineering · Net KSh 112,300", status: "Processed" }, { id: 2, name: "Wanjiru Maina", detail: "Finance · Leave pending", status: "Review" }] },
  Projects: { icon: "📋", description: "Deliver work on time and on budget", records: [{ id: 1, name: "Website Redesign", detail: "Acme Group · 75% complete", status: "Active" }, { id: 2, name: "Cloud Migration", detail: "Enterprise Corp · 30% complete", status: "On hold" }] },
  Procurement: { icon: "📦", description: "Control purchasing from request to delivery", records: [{ id: 1, name: "LPO-2026-018", detail: "Office equipment · KSh 86,000", status: "Approved" }, { id: 2, name: "GRN-2026-011", detail: "12 items received", status: "Received" }] },
  Templates: { icon: "📄", description: "Create reusable documents and communications", records: [{ id: 1, name: "Standard Invoice", detail: "12 variables · Updated today", status: "Published" }, { id: 2, name: "Service Agreement", detail: "8 variables · Draft", status: "Draft" }] },
  Analytics: { icon: "📈", description: "Turn operational data into decisions", records: [{ id: 1, name: "Revenue trend", detail: "+14.2% this quarter", status: "Healthy" }, { id: 2, name: "Collection rate", detail: "87% of invoices paid", status: "On target" }] },
  Communications: { icon: "💬", description: "Coordinate your team and customer updates", records: [{ id: 1, name: "Invoice reminder", detail: "45 recipients · 98% delivered", status: "Sent" }, { id: 2, name: "Team announcement", detail: "12 team members", status: "Draft" }] },
  "AI Hub": { icon: "✨", description: "Draft, analyze, and automate with AI assistance", records: [{ id: 1, name: "Cash flow insight", detail: "Forecast confidence · 92%", status: "Ready" }, { id: 2, name: "Proposal draft", detail: "Generated from project brief", status: "Review" }] },
};

function resolveModule(moduleName: string) {
  const key = Object.keys(MODULES).find((name) => moduleName.startsWith(name)) || "CRM";
  return { key, ...MODULES[key] };
}

export default function InteractiveModuleDemo({ moduleName }: InteractiveModuleDemoProps) {
  const module = resolveModule(moduleName);
  const [step, setStep] = useState<"login" | "workspace">("login");
  const [role, setRole] = useState("Admin");
  const [records, setRecords] = useState(module.records);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("Ready to explore the demo workspace.");

  const visibleRecords = records.filter((record) => `${record.name} ${record.detail} ${record.status}`.toLowerCase().includes(search.toLowerCase()));
  const runAction = () => {
    const nextId = Math.max(...records.map((record) => record.id), 0) + 1;
    setRecords((current) => [{ id: nextId, name: `New ${module.key} record`, detail: "Created in the interactive demo", status: "New" }, ...current]);
    setNotice(`${module.key} record created successfully. Try searching or opening another view.`);
  };

  return (
    <Card className="overflow-hidden border-gray-200 shadow-lg">
      <div className="border-b bg-slate-950 px-5 py-3 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="text-2xl">{module.icon}</span><div><p className="font-semibold">Kiini {module.key} workspace</p><p className="text-xs text-white/60">{module.description}</p></div></div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">Demo mode</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        {step === "login" ? (
          <div className="mx-auto max-w-md space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium"><LogIn className="h-4 w-4 text-indigo-600" /> Start with a role-based login</div>
            <Input defaultValue="demo@kiini.africa" aria-label="Demo email" readOnly />
            <select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Admin</option><option>Accountant</option><option>HR Manager</option><option>Project Manager</option></select>
            <Button className="w-full" onClick={() => { setStep("workspace"); setNotice(`Signed in as ${role}. Your ${module.key} workspace is ready.`); }}>Sign in to demo <ChevronRight className="ml-2 h-4 w-4" /></Button>
            <p className="text-center text-xs text-muted-foreground">No account or data is created. This is a safe, in-browser walkthrough.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm text-muted-foreground"><LayoutDashboard className="h-4 w-4" /> {role} · Overview</div><Button size="sm" onClick={runAction}><Plus className="mr-1 h-4 w-4" /> New record</Button></div>
            <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Records</p><p className="text-2xl font-bold">{records.length}</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Active workflow</p><p className="text-2xl font-bold text-emerald-600">Live</p></div><div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Last action</p><p className="text-sm font-semibold mt-1">Just now</p></div></div>
            <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder={`Search ${module.key.toLowerCase()} records`} /></div>
            <div className="divide-y rounded-lg border">{visibleRecords.map((record) => <div key={record.id} className="flex items-center justify-between gap-3 p-4"><div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-indigo-500" /><div><p className="font-medium">{record.name}</p><p className="text-sm text-muted-foreground">{record.detail}</p></div></div><Badge variant="outline">{record.status}</Badge></div>)}{visibleRecords.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No matching records.</p>}</div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{notice}</div>
            <Button variant="outline" size="sm" onClick={() => setStep("login")}>Restart walkthrough</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
