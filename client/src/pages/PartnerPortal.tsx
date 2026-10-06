import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardPlus,
  Copy,
  DollarSign,
  ExternalLink,
  Handshake,
  Link2,
  Loader2,
  Search,
  Send,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type ReferralDraft = { referredName: string; referredEmail: string; notes: string };
type PayoutDraft = { amount: string; method: "mpesa" | "bank" | "paypal"; reference: string };

function money(value: number, currency = "KES") {
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `${currency} ${Number(value || 0).toLocaleString("en-KE")}`;
  }
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function statusStyle(status: string) {
  if (["approved", "active", "converted", "paid"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (["pending", "submitted", "qualified", "payable", "requested", "processing"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-800";
  if (["rejected", "suspended", "lost", "void"].includes(status)) return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={`capitalize ${statusStyle(status)}`}>{status.replace(/_/g, " ")}</Badge>;
}

function monthlyEarnings(commissions: any[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      month: month.toLocaleDateString("en-KE", { month: "short" }),
      total: 0,
    };
  });
  const totals = new Map(months.map((month) => [month.key, month]));
  commissions.forEach((commission) => {
    if (commission.status === "void" || !commission.earnedAt) return;
    const date = new Date(commission.earnedAt);
    if (Number.isNaN(date.getTime())) return;
    const month = totals.get(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    if (month) month.total += Number(commission.amount || 0);
  });
  return months;
}

function Metric({ label, value, detail, icon, accent }: { label: string; value: string | number; detail: string; icon: React.ReactNode; accent: string }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="flex min-h-32 items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tabular-nums text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className={`shrink-0 rounded-md p-2.5 ${accent}`}>{icon}</span>
      </CardContent>
    </Card>
  );
}

export default function PartnerPortal() {
  const utils = trpc.useUtils();
  const profileQuery = trpc.partners.getMyProfile.useQuery();
  const referralsQuery = trpc.partners.listMyReferrals.useQuery({ limit: 200 });
  const earningsQuery = trpc.partners.getMyEarnings.useQuery();
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referral, setReferral] = useState<ReferralDraft>({ referredName: "", referredEmail: "", notes: "" });
  const [payout, setPayout] = useState<PayoutDraft>({ amount: "", method: "mpesa", reference: "" });
  const [referralSearch, setReferralSearch] = useState("");
  const [referralStatus, setReferralStatus] = useState("all");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const createReferral = trpc.partners.createReferral.useMutation({
    onSuccess: async () => {
      toast.success("Referral submitted");
      setReferral({ referredName: "", referredEmail: "", notes: "" });
      setShowReferralDialog(false);
      await Promise.all([utils.partners.listMyReferrals.invalidate(), utils.partners.getMyEarnings.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const requestPayout = trpc.partners.requestPayout.useMutation({
    onSuccess: async () => {
      toast.success("Payout request submitted");
      setPayout({ amount: "", method: "mpesa", reference: "" });
      await utils.partners.getMyEarnings.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const cancelPayout = trpc.partners.cancelMyPayout.useMutation({
    onSuccess: async () => {
      toast.success("Payout request cancelled");
      await utils.partners.getMyEarnings.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const profile = profileQuery.data as any;
  const referrals = (referralsQuery.data || []) as any[];
  const earnings = earningsQuery.data as any;
  const commissions = (earnings?.commissions || []) as any[];
  const payouts = (earnings?.payouts || []) as any[];
  const totals = earnings?.totals || { earned: 0, payable: 0, paid: 0, requested: 0 };
  const referralSummary = earnings?.referralSummary || {
    total: referrals.length,
    active: referrals.filter((row) => ["submitted", "qualified"].includes(row.status)).length,
    converted: referrals.filter((row) => ["converted", "paid"].includes(row.status)).length,
    conversionRate: referrals.length ? Math.round((referrals.filter((row) => ["converted", "paid"].includes(row.status)).length / referrals.length) * 100) : 0,
  };
  const referralLink = profile ? `${window.location.origin}/signup?ref=${profile.referralCode}` : "";
  const chartData = monthlyEarnings(commissions);
  const paidOut = payouts.filter((row) => row.status === "paid").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const waitingPayouts = payouts.filter((row) => ["requested", "processing"].includes(row.status)).length;
  const visibleReferrals = referrals.filter((row) => {
    const matchesStatus = referralStatus === "all" || row.status === referralStatus;
    const query = referralSearch.trim().toLowerCase();
    const matchesSearch = !query || `${row.referredName || ""} ${row.referredEmail || ""}`.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
  const recentReferrals = referrals.slice(0, 5);
  const averageCommission = commissions.length ? Number(totals.earned) / commissions.filter((row) => row.status !== "void").length : 0;

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the referral link");
    }
  };

  if (profileQuery.isLoading) {
    return (
      <ModuleLayout title="Partner Dashboard" description="Your referrals, earnings, and payouts" icon={<Handshake className="size-5" />} breadcrumbs={[{ label: "Partner Dashboard" }]}>
        <div className="space-y-6">
          <Skeleton className="h-36 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32" />)}</div>
          <Skeleton className="h-72 w-full" />
        </div>
      </ModuleLayout>
    );
  }

  if (profileQuery.error) {
    const pendingAccess = (profileQuery.error as any).data?.code === "FORBIDDEN";
    return (
      <ModuleLayout title="Partner Dashboard" description="Your referrals, earnings, and payouts" icon={<Handshake className="size-5" />} breadcrumbs={[{ label: "Partner Dashboard" }]}>
        <Card className="mx-auto max-w-2xl border-amber-200">
          <CardContent className="flex flex-col items-center px-6 py-14 text-center">
            <ShieldCheck className="size-11 text-amber-600" />
            <h2 className="mt-4 text-xl font-semibold">{pendingAccess ? "Partner access is pending" : "Dashboard unavailable"}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {pendingAccess ? "Your account is not linked to an approved partner profile yet. Apply to the partner program and an administrator will review your access." : "We couldn't load your partner dashboard. Please try again, or contact an administrator if the problem continues."}
            </p>
            <div className="mt-6 flex gap-2">
              {pendingAccess ? <Button onClick={() => window.location.assign("/become-a-partner")}><ExternalLink className="mr-2 size-4" />Partner program</Button> : <Button variant="outline" onClick={() => profileQuery.refetch()}>Try again</Button>}
            </div>
          </CardContent>
        </Card>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Partner Dashboard"
      description="Manage referrals, track commissions, and request payouts."
      icon={<Handshake className="size-5" />}
      breadcrumbs={[{ label: "Partner Dashboard" }]}
      actions={<Button variant="outline" onClick={() => window.location.assign("/become-a-partner")}><ExternalLink className="mr-2 size-4" />Program details</Button>}
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-lg bg-slate-950 px-5 py-6 text-white sm:px-7">
          <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10 text-lg font-semibold">
                {(profile.company || profile.name || "P").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-emerald-300">{profile.partnerType} partner</p>
                <h2 className="mt-1 truncate text-xl font-semibold sm:text-2xl">{profile.company || profile.name}</h2>
                <p className="mt-1 truncate text-sm text-slate-300">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <StatusBadge status={profile.status} />
              <Button onClick={() => setShowReferralDialog(true)} className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
                <ClipboardPlus className="mr-2 size-4" />Add referral
              </Button>
            </div>
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-slate-300"><BadgeCheck className="size-4 text-emerald-300" /><span>Commission rate</span><strong className="ml-auto text-white">{Number(profile.commissionRate || 0)}%</strong></div>
            <div className="flex items-center gap-2 text-slate-300"><Link2 className="size-4 text-emerald-300" /><span>Referral code</span><strong className="ml-auto text-white">{profile.referralCode}</strong></div>
            <div className="flex items-center gap-2 text-slate-300"><CalendarDays className="size-4 text-emerald-300" /><span>Partner since</span><strong className="ml-auto text-white">{formatDate(profile.createdAt)}</strong></div>
          </div>
        </section>

        <section aria-label="Partner performance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Referrals" value={referralSummary.total} detail={`${referralSummary.active} in progress`} icon={<Users className="size-5" />} accent="bg-teal-50 text-teal-700" />
          <Metric label="Conversions" value={referralSummary.converted} detail={`${referralSummary.conversionRate}% conversion rate`} icon={<CheckCircle2 className="size-5" />} accent="bg-emerald-50 text-emerald-700" />
          <Metric label="Commission earned" value={money(Number(totals.earned))} detail={`${commissions.filter((row) => row.status !== "void").length} commission entries`} icon={<DollarSign className="size-5" />} accent="bg-amber-50 text-amber-700" />
          <Metric label="Available to request" value={money(Number(totals.payable))} detail={waitingPayouts ? `${waitingPayouts} payout request${waitingPayouts === 1 ? "" : "s"} in review` : "Ready for payout request"} icon={<Wallet className="size-5" />} accent="bg-sky-50 text-sky-700" />
        </section>

        <section className="flex flex-col justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 rounded-md bg-white p-2 text-emerald-700"><Link2 className="size-4" /></span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-950">Your referral link</p>
              <p className="mt-1 break-all text-sm text-slate-700">{referralLink}</p>
            </div>
          </div>
          <Button variant="outline" onClick={copyReferralLink} className="shrink-0 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100">
            {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}{copied ? "Copied" : "Copy link"}
          </Button>
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent">Overview</TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent">Referrals</TabsTrigger>
            <TabsTrigger value="earnings" className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent">Commissions</TabsTrigger>
            <TabsTrigger value="payouts" className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div><CardTitle className="text-base">Commission trend</CardTitle><CardDescription>Commission value earned over the last six months.</CardDescription></div>
                  <span className="rounded-md bg-emerald-50 p-2 text-emerald-700"><Banknote className="size-4" /></span>
                </CardHeader>
                <CardContent>
                  {earningsQuery.isLoading ? <Skeleton className="h-64 w-full" /> : (
                    <div className="h-64 w-full" role="img" aria-label="Monthly commission earnings chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                          <defs><linearGradient id="partnerEarningsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.22} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} /></linearGradient></defs>
                          <CartesianGrid stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} width={62} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                          <Tooltip formatter={(value: number) => money(value)} labelStyle={{ color: "#0f172a" }} contentStyle={{ borderRadius: 8, borderColor: "#cbd5e1" }} />
                          <Area type="monotone" dataKey="total" name="Commission" stroke="#0f766e" strokeWidth={2.5} fill="url(#partnerEarningsFill)" activeDot={{ r: 5, fill: "#0f766e" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-base">Partner snapshot</CardTitle><CardDescription>How your referrals are moving.</CardDescription></CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">In progress</p><p className="mt-1 text-xl font-semibold tabular-nums">{referralSummary.active}</p></div><ArrowUpRight className="size-5 text-amber-600" /></div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Average commission</p><p className="mt-1 text-xl font-semibold tabular-nums">{money(averageCommission)}</p></div><DollarSign className="size-5 text-emerald-700" /></div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">Paid out</p><p className="mt-1 text-xl font-semibold tabular-nums">{money(paidOut)}</p></div><ArrowDownRight className="size-5 text-sky-700" /></div>
                  <Button variant="outline" className="w-full justify-between" onClick={() => window.location.assign("/become-a-partner")}>
                    Partner program details<ChevronRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div><CardTitle className="text-base">Recent referrals</CardTitle><CardDescription>Latest prospects submitted through your partner account.</CardDescription></div>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("referrals")}>All referrals<ChevronRight className="ml-1 size-4" /></Button>
              </CardHeader>
              <ReferralTable rows={recentReferrals} loading={referralsQuery.isLoading} emptyMessage="Your submitted prospects will appear here." />
            </Card>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><CardTitle className="text-base">Referral pipeline</CardTitle><CardDescription>{referralSummary.total} referrals · {referralSummary.converted} converted</CardDescription></div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={referralSearch} onChange={(event) => setReferralSearch(event.target.value)} placeholder="Search prospects" className="pl-9" /></div>
                  <Select value={referralStatus} onValueChange={setReferralStatus}>
                    <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="submitted">Submitted</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <ReferralTable rows={visibleReferrals} loading={referralsQuery.isLoading} emptyMessage="No referrals match this view." />
              <p className="px-6 pb-5 text-xs text-muted-foreground">Showing up to 200 most recent referrals.</p>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Lifetime commission" value={money(Number(totals.earned))} detail="Excludes voided entries" icon={<DollarSign className="size-5" />} accent="bg-amber-50 text-amber-700" />
              <Metric label="Available balance" value={money(Number(totals.payable))} detail="Ready to request" icon={<Wallet className="size-5" />} accent="bg-emerald-50 text-emerald-700" />
              <Metric label="Commission entries" value={commissions.filter((row) => row.status !== "void").length} detail="Across all referrals" icon={<Banknote className="size-5" />} accent="bg-sky-50 text-sky-700" />
            </div>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle className="text-base">Commission ledger</CardTitle><CardDescription>Commission amounts and processing status.</CardDescription></CardHeader>
              <Table><TableHeader><TableRow><TableHead>Earned</TableHead><TableHead>Referral</TableHead><TableHead>Status</TableHead><TableHead>Payable date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>{commissions.map((row) => <TableRow key={row.id}><TableCell className="whitespace-nowrap">{formatDate(row.earnedAt)}</TableCell><TableCell className="font-mono text-xs">{row.referralId ? row.referralId.slice(0, 8) : row.dealId ? row.dealId.slice(0, 8) : "—"}</TableCell><TableCell><StatusBadge status={row.status} /></TableCell><TableCell>{formatDate(row.payableAt)}</TableCell><TableCell className="text-right font-medium tabular-nums">{money(Number(row.amount), row.currency)}</TableCell></TableRow>)}
                  {!commissions.length && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No commission entries yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wallet className="size-4 text-emerald-700" />Request a payout</CardTitle><CardDescription>Request an amount up to your current available balance.</CardDescription></CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); requestPayout.mutate({ amount: Number(payout.amount), method: payout.method, reference: payout.reference || undefined }); }}>
                    <div className="space-y-2"><Label htmlFor="payout-amount">Amount (KES)</Label><Input id="payout-amount" type="number" inputMode="decimal" min="0.01" step="0.01" max={Number(totals.payable)} value={payout.amount} onChange={(event) => setPayout({ ...payout, amount: event.target.value })} placeholder={Number(totals.payable).toFixed(2)} required /><p className="text-xs text-muted-foreground">Available: {money(Number(totals.payable))}</p></div>
                    <div className="space-y-2"><Label htmlFor="payout-method">Payment method</Label><Select value={payout.method} onValueChange={(method: PayoutDraft["method"]) => setPayout({ ...payout, method })}><SelectTrigger id="payout-method"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mpesa">M-Pesa</SelectItem><SelectItem value="bank">Bank transfer</SelectItem><SelectItem value="paypal">PayPal</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label htmlFor="payout-reference">Payment destination</Label><Input id="payout-reference" value={payout.reference} onChange={(event) => setPayout({ ...payout, reference: event.target.value })} placeholder="Phone, account number, or PayPal email" maxLength={255} /></div>
                    <Button className="w-full" type="submit" disabled={!payout.amount || Number(payout.amount) <= 0 || Number(payout.amount) > Number(totals.payable) || requestPayout.isPending || Number(totals.payable) <= 0}>
                      {requestPayout.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ArrowUpRight className="mr-2 size-4" />}Submit payout request
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-base">Payout history</CardTitle><CardDescription>{waitingPayouts} request{waitingPayouts === 1 ? "" : "s"} awaiting processing.</CardDescription></CardHeader>
                <CardContent className="space-y-3">
                  {payouts.map((row) => (
                    <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-4">
                      <div><p className="font-semibold tabular-nums">{money(Number(row.amount), row.currency)}</p><p className="mt-1 text-xs text-muted-foreground">{String(row.method).toUpperCase()} · Requested {formatDate(row.requestedAt)}</p>{row.reference && <p className="mt-1 text-xs text-muted-foreground">Destination: {row.reference}</p>}</div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={row.status} />
                        {row.status === "requested" && <Button variant="ghost" size="sm" disabled={cancelPayout.isPending} onClick={() => cancelPayout.mutate({ id: row.id })}><X className="mr-1 size-3.5" />Cancel</Button>}
                      </div>
                    </div>
                  ))}
                  {!payouts.length && <div className="flex flex-col items-center py-12 text-center"><Wallet className="size-9 text-slate-300" /><p className="mt-3 text-sm font-medium">No payout requests yet</p><p className="mt-1 text-sm text-muted-foreground">Your requests and payment history will appear here.</p></div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit a referral</DialogTitle><DialogDescription>Add a prospect to your referral pipeline. Their email is used to attribute the referral.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); createReferral.mutate(referral); }}>
            <div className="space-y-2"><Label htmlFor="referral-name">Prospect name</Label><Input id="referral-name" value={referral.referredName} onChange={(event) => setReferral({ ...referral, referredName: event.target.value })} maxLength={255} placeholder="Name" /></div>
            <div className="space-y-2"><Label htmlFor="referral-email">Business email</Label><Input id="referral-email" type="email" value={referral.referredEmail} onChange={(event) => setReferral({ ...referral, referredEmail: event.target.value })} maxLength={320} placeholder="name@company.com" required /></div>
            <div className="space-y-2"><Label htmlFor="referral-notes">Context <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="referral-notes" value={referral.notes} onChange={(event) => setReferral({ ...referral, notes: event.target.value })} maxLength={5000} rows={3} placeholder="Company, need, or introduction context" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowReferralDialog(false)}>Cancel</Button><Button type="submit" disabled={!referral.referredEmail || createReferral.isPending}>{createReferral.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Submit referral</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}

function ReferralTable({ rows, loading, emptyMessage }: { rows: any[]; loading: boolean; emptyMessage: string }) {
  if (loading) return <div className="space-y-3 px-6 pb-6">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>Prospect</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Submitted</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell><p className="font-medium">{row.referredName || "Unnamed prospect"}</p><p className="text-xs text-muted-foreground">{row.referredEmail}</p></TableCell><TableCell className="capitalize">{row.source || "partner"}</TableCell><TableCell><StatusBadge status={row.status} /></TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(row.createdAt)}</TableCell></TableRow>)}
          {!rows.length && <TableRow><TableCell colSpan={4} className="h-28 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}