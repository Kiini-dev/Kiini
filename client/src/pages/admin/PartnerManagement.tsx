import { useMemo, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertCircle, Check, DollarSign, Handshake, Loader2, Plus, Search, ShieldOff, Users } from "lucide-react";
import { toast } from "sonner";

type PartnerProfile = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  website: string | null;
  partnerType: string;
  status: string;
  referralCode: string;
  commissionRate: number | string | null;
  notes: string | null;
  createdAt: string | Date | null;
};

const applicationStatuses = ["pending", "approved", "rejected", "suspended"] as const;
const referralStatuses = ["submitted", "qualified", "converted", "rejected", "paid"] as const;
const commissionStatuses = ["pending", "approved", "payable", "paid", "void"] as const;
const payoutStatuses = ["requested", "processing", "paid", "rejected"] as const;

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function formatMoney(amount: number | string | null | undefined, currency = "KES") {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount || 0));
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "approved" || status === "active" || status === "paid" || status === "converted"
    ? "default"
    : status === "rejected" || status === "suspended" || status === "void"
      ? "destructive"
      : "secondary";
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}

export default function PartnerManagement() {
  const { user, loading: authLoading } = useAuth();
  const isGlobalSuperAdmin = user?.role === "super_admin" && !user.organizationId;
  const utils = trpc.useUtils();
  const [tab, setTab] = useState("applications");
  const [search, setSearch] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [reviewing, setReviewing] = useState<PartnerProfile | null>(null);
  const [reviewForm, setReviewForm] = useState({ status: "approved", notes: "", commissionRate: "15", userId: "" });
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [commissionForm, setCommissionForm] = useState({ partnerId: "", referralId: "", dealId: "", amount: "", currency: "KES", notes: "" });

  const reportQuery = trpc.partners.getProgramReport.useQuery(undefined, { enabled: isGlobalSuperAdmin });
  const applicationsQuery = trpc.partners.listApplications.useQuery({ limit: 500 }, { enabled: isGlobalSuperAdmin });
  const referralsQuery = trpc.partners.listReferrals.useQuery({ limit: 500 }, { enabled: isGlobalSuperAdmin });
  const commissionsQuery = trpc.partners.listCommissions.useQuery({}, { enabled: isGlobalSuperAdmin });
  const payoutsQuery = trpc.partners.listPayouts.useQuery({ limit: 500 }, { enabled: isGlobalSuperAdmin });

  const refreshAll = async () => {
    await Promise.all([
      utils.partners.getProgramReport.invalidate(),
      utils.partners.listApplications.invalidate(),
      utils.partners.listReferrals.invalidate(),
      utils.partners.listCommissions.invalidate(),
      utils.partners.listPayouts.invalidate(),
    ]);
  };

  const reviewMutation = trpc.partners.reviewApplication.useMutation({
    onSuccess: async () => { toast.success("Partner application updated"); setReviewing(null); await refreshAll(); },
    onError: (error) => toast.error(error.message),
  });
  const updateReferralMutation = trpc.partners.updateReferral.useMutation({
    onSuccess: refreshAll,
    onError: (error) => toast.error(error.message),
  });
  const recordCommissionMutation = trpc.partners.recordCommission.useMutation({
    onSuccess: async () => { toast.success("Commission recorded"); setCommissionOpen(false); await refreshAll(); },
    onError: (error) => toast.error(error.message),
  });
  const updateCommissionMutation = trpc.partners.updateCommission.useMutation({
    onSuccess: refreshAll,
    onError: (error) => toast.error(error.message),
  });
  const updatePayoutMutation = trpc.partners.updatePayout.useMutation({
    onSuccess: async () => { toast.success("Payout updated"); await refreshAll(); },
    onError: (error) => toast.error(error.message),
  });

  const profiles = (applicationsQuery.data || []) as PartnerProfile[];
  const referrals = referralsQuery.data || [];
  const commissions = commissionsQuery.data || [];
  const payouts = payoutsQuery.data || [];
  const visibleProfiles = useMemo(() => profiles.filter((partner) => {
    const matchesStatus = applicationFilter === "all"
      ? true
      : applicationFilter === "partners"
        ? ["approved", "active"].includes(partner.status)
        : partner.status === applicationFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [partner.name, partner.email, partner.company, partner.referralCode]
      .some((value) => String(value || "").toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  }), [profiles, applicationFilter, search]);

  const report = reportQuery.data;
  const busy = reportQuery.isLoading || applicationsQuery.isLoading || referralsQuery.isLoading || commissionsQuery.isLoading || payoutsQuery.isLoading;
  const hasError = reportQuery.error || applicationsQuery.error || referralsQuery.error || commissionsQuery.error || payoutsQuery.error;

  const openReview = (partner: PartnerProfile) => {
    setReviewing(partner);
    setReviewForm({
      status: partner.status === "active" ? "approved" : partner.status,
      notes: partner.notes || "",
      commissionRate: String(partner.commissionRate ?? 15),
      userId: partner.userId || "",
    });
  };

  const saveReview = () => {
    if (!reviewing) return;
    reviewMutation.mutate({
      id: reviewing.id,
      status: reviewForm.status as typeof applicationStatuses[number],
      notes: reviewForm.notes,
      commissionRate: Number(reviewForm.commissionRate),
      userId: reviewForm.userId.trim() || undefined,
    });
  };

  const saveCommission = () => {
    if (!commissionForm.partnerId || !Number(commissionForm.amount)) {
      toast.error("Choose a partner and enter a commission amount");
      return;
    }
    recordCommissionMutation.mutate({
      partnerId: commissionForm.partnerId,
      referralId: commissionForm.referralId || undefined,
      dealId: commissionForm.dealId || undefined,
      amount: Number(commissionForm.amount),
      currency: commissionForm.currency,
      notes: commissionForm.notes || undefined,
    });
  };

  if (authLoading) {
    return <ModuleLayout title="Partner Management" icon={<Handshake className="size-5" />}><div className="flex min-h-48 items-center justify-center"><Loader2 className="size-6 animate-spin" /></div></ModuleLayout>;
  }
  if (!isGlobalSuperAdmin) {
    return (
      <ModuleLayout title="Partner Management" description="Manage Kiini's partner program" icon={<Handshake className="size-5" />}>
        <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
          <ShieldOff className="mb-4 size-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Global super admin access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">This workspace manages the platform-wide partner program.</p>
        </div>
      </ModuleLayout>
    );
  }

  const overview = report as any;

  return (
    <ModuleLayout
      title="Partner Management"
      description="Review applications and manage partners, referrals, commissions, and payouts."
      icon={<Handshake className="size-5" />}
      breadcrumbs={[{ label: "Enterprise", href: "/enterprise/tenants" }, { label: "Partners" }]}
      actions={<Button onClick={() => { setCommissionForm({ partnerId: "", referralId: "", dealId: "", amount: "", currency: "KES", notes: "" }); setCommissionOpen(true); }}><Plus className="mr-2 size-4" />Record commission</Button>}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">Partners</p><p className="mt-1 text-2xl font-semibold">{overview?.partners?.total ?? 0}</p></div><Users className="size-5 text-muted-foreground" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">Pending applications</p><p className="mt-1 text-2xl font-semibold">{overview?.partners?.byStatus?.pending ?? 0}</p></div><AlertCircle className="size-5 text-amber-600" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">Referrals</p><p className="mt-1 text-2xl font-semibold">{overview?.referrals?.total ?? 0}</p></div><Handshake className="size-5 text-muted-foreground" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">Commission recorded</p><p className="mt-1 text-2xl font-semibold">{formatMoney(overview?.commissions?.gross)}</p></div><DollarSign className="size-5 text-emerald-700" /></CardContent></Card>
        </div>

        {hasError && <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Some partner data could not be loaded. Check the database migration status and retry.</div>}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-5">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search partners" placeholder="Search name, email, company, code" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            {(tab === "applications" || tab === "partners") && <Select value={applicationFilter} onValueChange={setApplicationFilter}><SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All records</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="partners">Approved partners</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>}
          </div>

          <TabsContent value="applications">
            <Card><CardHeader><CardTitle className="text-base">Applications</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Applicant</TableHead><TableHead>Company</TableHead><TableHead>Type</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Review</TableHead></TableRow></TableHeader><TableBody>
              {busy ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading partner records…</TableCell></TableRow> : visibleProfiles.filter((partner) => !["approved", "active"].includes(partner.status)).map((partner) => <TableRow key={partner.id}><TableCell><p className="font-medium">{partner.name}</p><p className="text-xs text-muted-foreground">{partner.email}</p></TableCell><TableCell>{partner.company || "—"}</TableCell><TableCell className="capitalize">{partner.partnerType === "affiliate" ? "Referral" : partner.partnerType}</TableCell><TableCell>{formatDate(partner.createdAt)}</TableCell><TableCell><StatusBadge status={partner.status} /></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openReview(partner)}>Review</Button></TableCell></TableRow>)}
              {!busy && !visibleProfiles.some((partner) => !["approved", "active"].includes(partner.status)) && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No applications match this filter.</TableCell></TableRow>}
            </TableBody></Table></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card><CardHeader><CardTitle className="text-base">Approved partners</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Referral code</TableHead><TableHead>Type</TableHead><TableHead>Commission</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>
              {busy ? <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Loading partner records…</TableCell></TableRow> : visibleProfiles.filter((partner) => ["approved", "active"].includes(partner.status)).map((partner) => <TableRow key={partner.id}><TableCell><p className="font-medium">{partner.name}</p><p className="text-xs text-muted-foreground">{partner.email}</p></TableCell><TableCell className="font-mono text-xs">{partner.referralCode}</TableCell><TableCell className="capitalize">{partner.partnerType === "affiliate" ? "Referral" : partner.partnerType}</TableCell><TableCell>{Number(partner.commissionRate ?? 0)}%</TableCell><TableCell>{formatDate(partner.createdAt)}</TableCell><TableCell><StatusBadge status={partner.status} /></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openReview(partner)}>Manage</Button></TableCell></TableRow>)}
              {!busy && !visibleProfiles.some((partner) => ["approved", "active"].includes(partner.status)) && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No approved partners match this filter.</TableCell></TableRow>}
            </TableBody></Table></div></CardContent></Card>
          </TabsContent>

          <TabsContent value="referrals"><Card><CardHeader><CardTitle className="text-base">Partner referrals</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Prospect</TableHead><TableHead>Partner</TableHead><TableHead>Source</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{referralsQuery.isLoading ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading referrals…</TableCell></TableRow> : (referrals || []).filter((row: any) => !search || `${row.referredName} ${row.referredEmail} ${row.partnerId}`.toLowerCase().includes(search.toLowerCase())).map((row: any) => <TableRow key={row.id}><TableCell><p className="font-medium">{row.referredName || "Unnamed prospect"}</p><p className="text-xs text-muted-foreground">{row.referredEmail}</p></TableCell><TableCell className="font-mono text-xs">{row.partnerId}</TableCell><TableCell>{row.source || "partner"}</TableCell><TableCell>{formatDate(row.createdAt)}</TableCell><TableCell><Select value={row.status} onValueChange={(status) => updateReferralMutation.mutate({ id: row.id, status: status as typeof referralStatuses[number] })}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent>{referralStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}{!referralsQuery.isLoading && !referrals?.length && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No referrals yet.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card></TabsContent>

          <TabsContent value="commissions"><Card><CardHeader><CardTitle className="text-base">Commissions</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Referral / deal</TableHead><TableHead>Earned</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{commissionsQuery.isLoading ? <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading commissions…</TableCell></TableRow> : (commissions || []).filter((row: any) => !search || `${row.partnerId} ${row.referralId} ${row.dealId}`.toLowerCase().includes(search.toLowerCase())).map((row: any) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.partnerId}</TableCell><TableCell className="font-mono text-xs">{row.referralId || row.dealId || "—"}</TableCell><TableCell>{formatDate(row.earnedAt)}</TableCell><TableCell>{formatMoney(row.amount, row.currency)}</TableCell><TableCell><Select value={row.status} onValueChange={(status) => updateCommissionMutation.mutate({ id: row.id, status: status as typeof commissionStatuses[number] })}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent>{commissionStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}{!commissionsQuery.isLoading && !commissions?.length && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No commissions recorded.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card></TabsContent>

          <TabsContent value="payouts"><Card><CardHeader><CardTitle className="text-base">Payout requests</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Requested</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{payoutsQuery.isLoading ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading payouts…</TableCell></TableRow> : (payouts || []).filter((row: any) => !search || `${row.partnerId} ${row.reference} ${row.method}`.toLowerCase().includes(search.toLowerCase())).map((row: any) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.partnerId}</TableCell><TableCell>{formatDate(row.requestedAt)}</TableCell><TableCell className="capitalize">{row.method}</TableCell><TableCell>{row.reference || "—"}</TableCell><TableCell>{formatMoney(row.amount, row.currency)}</TableCell><TableCell><Select value={row.status} onValueChange={(status) => updatePayoutMutation.mutate({ id: row.id, status: status as typeof payoutStatuses[number] })}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger><SelectContent>{payoutStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></TableCell></TableRow>)}{!payoutsQuery.isLoading && !payouts?.length && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No payout requests.</TableCell></TableRow>}</TableBody></Table></div></CardContent></Card></TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage partner</DialogTitle><DialogDescription>{reviewing?.name} · {reviewing?.email}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Status</Label><Select value={reviewForm.status} onValueChange={(status) => setReviewForm((form) => ({ ...form, status }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{applicationStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Commission rate (%)</Label><Input type="number" min="0" max="100" step="0.01" value={reviewForm.commissionRate} onChange={(event) => setReviewForm((form) => ({ ...form, commissionRate: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Linked user ID</Label><Input value={reviewForm.userId} onChange={(event) => setReviewForm((form) => ({ ...form, userId: event.target.value }))} placeholder="Kiini user ID" /></div>
            <div className="space-y-2"><Label>Internal notes</Label><Textarea value={reviewForm.notes} onChange={(event) => setReviewForm((form) => ({ ...form, notes: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button><Button disabled={reviewMutation.isPending} onClick={saveReview}>{reviewMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={commissionOpen} onOpenChange={setCommissionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record commission</DialogTitle><DialogDescription>Add a commission entry to a partner account.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Partner</Label><Select value={commissionForm.partnerId} onValueChange={(partnerId) => setCommissionForm((form) => ({ ...form, partnerId }))}><SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger><SelectContent>{profiles.filter((profile) => ["approved", "active"].includes(profile.status)).map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.name} · {profile.referralCode}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Amount</Label><Input type="number" min="0.01" step="0.01" value={commissionForm.amount} onChange={(event) => setCommissionForm((form) => ({ ...form, amount: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Currency</Label><Input maxLength={3} value={commissionForm.currency} onChange={(event) => setCommissionForm((form) => ({ ...form, currency: event.target.value.toUpperCase() }))} /></div>
            <div className="space-y-2"><Label>Referral ID (optional)</Label><Input value={commissionForm.referralId} onChange={(event) => setCommissionForm((form) => ({ ...form, referralId: event.target.value }))} /></div>
            <div className="space-y-2"><Label>Deal ID (optional)</Label><Input value={commissionForm.dealId} onChange={(event) => setCommissionForm((form) => ({ ...form, dealId: event.target.value }))} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea value={commissionForm.notes} onChange={(event) => setCommissionForm((form) => ({ ...form, notes: event.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCommissionOpen(false)}>Cancel</Button><Button disabled={recordCommissionMutation.isPending} onClick={saveCommission}>{recordCommissionMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
