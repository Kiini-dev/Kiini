import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { toast } from "sonner";
import { countWeekdaysInclusive } from "@shared/leaveDays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { Calendar, Search, ArrowLeft, Lock, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  returned: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? "pending").toLowerCase();
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${STATUS_STYLES[s] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {s}
    </span>
  );
}

function AccessDenied({ slug }: { slug: string }) {
  const [, setLocation] = useLocation();
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="py-20 text-center">
        <Lock className="h-12 w-12 text-white/20 mx-auto mb-4" />
        <p className="text-white font-semibold text-lg mb-2">Access Restricted</p>
        <p className="text-white/50 text-sm mb-6">Leave Management is not enabled for your organization. Please contact your administrator.</p>
        <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => setLocation(`/org/${slug}/dashboard`)}>
          Back to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

const STATUSES = ["all", "pending", "approved", "returned", "rejected", "cancelled"];
const LEAVE_TYPES = ["all", "annual", "sick", "maternity", "paternity", "unpaid", "other"];

export default function OrgLeave() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [view, setView] = useState<"mine" | "approvals">("mine");
  const [reviewing, setReviewing] = useState<{ id: string; organizationId?: string | null; decision: "approve" | "reject" | "return" } | null>(null);
  const [reviewComments, setReviewComments] = useState("");

  const { data: myOrgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300_000 });
  const { hasAccess, userRole } = useOrgAccess();
  const canViewLeave = hasAccess("org:leave:view");
  const canCreateLeave = hasAccess("org:leave:create");
  const isPlatformAdmin = userRole === "super_admin";
  const canApproveLeave = ["hr", "super_admin"].includes(userRole) && hasAccess("org:leave:approve");
  useEffect(() => {
    if (canApproveLeave) setView("approvals");
  }, [canApproveLeave]);

  const { data: ownLeaves = [], isLoading: ownLoading } = trpc.leave.list.useQuery(
    { limit: 100 },
    { staleTime: 60_000, enabled: !!canViewLeave && !isPlatformAdmin && view === "mine" }
  );
  const currentYear = new Date().getFullYear();
  const { data: myLeaveBalances = [], isLoading: balancesLoading, error: balancesError } = trpc.hrLeave.getLeaveBalance.useQuery(
    { fiscalYear: currentYear },
    { enabled: canViewLeave && !isPlatformAdmin && view === "mine" },
  );
  const { data: approvalLeaves = [], isLoading: approvalLoading } = trpc.leave.listForApproval.useQuery(
    { limit: 500 },
    { staleTime: 60_000, enabled: canApproveLeave }
  );
  const leaves = view === "approvals" && canApproveLeave ? approvalLeaves : ownLeaves;
  const isLoading = ownLoading || (view === "approvals" && approvalLoading);
  const utils = trpc.useUtils();
  const approveMutation = trpc.leave.approve.useMutation({
    onSuccess: async () => {
      toast.success("Leave request approved");
      setReviewing(null);
      setReviewComments("");
      await Promise.all([utils.leave.list.invalidate(), utils.leave.listForApproval.invalidate()]);
    },
    onError: (error) => toast.error(error.message || "Could not approve leave request"),
  });
  const rejectMutation = trpc.leave.reject.useMutation({
    onSuccess: async () => {
      toast.success("Leave request rejected");
      setReviewing(null);
      setReviewComments("");
      await Promise.all([utils.leave.list.invalidate(), utils.leave.listForApproval.invalidate()]);
    },
    onError: (error) => toast.error(error.message || "Could not reject leave request"),
  });
  const returnMutation = trpc.leave.returnForRevision.useMutation({
    onSuccess: async () => {
      toast.success("Leave request returned for revision");
      setReviewing(null);
      setReviewComments("");
      await Promise.all([utils.leave.list.invalidate(), utils.leave.listForApproval.invalidate()]);
    },
    onError: (error) => toast.error(error.message || "Could not return leave request"),
  });

  const submitReview = () => {
    if (!reviewing) return;
    if (reviewing.decision !== "approve" && !reviewComments.trim()) {
      toast.error(reviewing.decision === "return" ? "Add revision instructions before continuing" : "Add a rejection reason before continuing");
      return;
    }
    if (reviewing.decision === "approve") {
      approveMutation.mutate({ id: reviewing.id, organizationId: reviewing.organizationId, comments: reviewComments.trim() || undefined });
    } else if (reviewing.decision === "reject") {
      rejectMutation.mutate({ id: reviewing.id, organizationId: reviewing.organizationId, comments: reviewComments.trim() });
    } else {
      returnMutation.mutate({ id: reviewing.id, organizationId: reviewing.organizationId, comments: reviewComments.trim() });
    }
  };

  const accessGranted = !myOrgData || canViewLeave;

  const filtered = (leaves as any[]).filter((l) => {
    const matchStatus = activeStatus === "all" || l.status?.toLowerCase() === activeStatus;
    const matchSearch = !search ||
      l.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      l.reason?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pending = (leaves as any[]).filter((l) => l.status === "pending").length;
  const approved = (leaves as any[]).filter((l) => l.status === "approved").length;
  const totalDays = (leaves as any[]).filter((l) => l.status === "approved").reduce((s, l) => {
    if (!l.startDate || !l.endDate) return s;
    return s + countWeekdaysInclusive(l.startDate, l.endDate);
  }, 0);
  const today = new Date();
  const currentlyAway = new Set((leaves as any[])
    .filter((l) => l.status === "approved" && new Date(l.startDate) <= today && new Date(l.endDate) >= today)
    .map((l) => l.employeeId)).size;

  return (
    <OrgLayout title="Leave Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <OrgBreadcrumb slug={slug} items={[{ label: "Leave" }]} />
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        {canApproveLeave && (
          <div className="flex gap-2">
            {!isPlatformAdmin && <Button size="sm" variant={view === "mine" ? "default" : "ghost"} onClick={() => setView("mine")}>My requests</Button>}
            <Button size="sm" variant={view === "approvals" ? "default" : "ghost"} onClick={() => setView("approvals")}>Approval queue</Button>
          </div>
        )}

        {!canViewLeave ? <AccessDenied slug={slug} /> : (
          <>
            {view === "mine" && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">My leave balances</CardTitle>
                  <p className="text-sm text-white/50">Entitlement and usage for {currentYear}, by leave type.</p>
                </CardHeader>
                <CardContent className="p-0">
                  {balancesLoading ? (
                    <p className="p-6 text-center text-sm text-white/50">Loading balances...</p>
                  ) : balancesError ? (
                    <p className="p-6 text-center text-sm text-red-300">Could not load leave balances: {balancesError.message}</p>
                  ) : myLeaveBalances.length === 0 ? (
                    <p className="p-6 text-center text-sm text-white/50">No leave balances have been allocated for {currentYear}.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      <div className="grid grid-cols-5 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                        <div>Leave type</div><div>Entitlement</div><div>Used</div><div>Pending</div><div>Available</div>
                      </div>
                      {myLeaveBalances.map((balance: any) => (
                        <div key={balance.id} className="grid grid-cols-5 px-6 py-3 text-sm text-white/70">
                          <div className="capitalize">{String(balance.leaveType).replace(/_/g, " ")}</div>
                          <div>{Number(balance.totalEntitlement || 0).toFixed(1)} days</div>
                          <div>{Number(balance.used || 0).toFixed(1)} days</div>
                          <div>{Number(balance.pending || 0).toFixed(1)} days</div>
                          <div className="font-semibold text-white">{Number(balance.available || 0).toFixed(1)} days</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: "Total Requests", value: String(leaves.length), color: "from-blue-600/20 to-blue-600/5" },
                { label: "Pending", value: String(pending), color: "from-yellow-600/20 to-yellow-600/5" },
                { label: "Approved", value: String(approved), color: "from-green-600/20 to-green-600/5" },
                { label: "Returned", value: String((leaves as any[]).filter((l) => l.status === "returned").length), color: "from-orange-600/20 to-orange-600/5" },
                { label: "Currently Away", value: String(currentlyAway), color: "from-purple-600/20 to-purple-600/5" },
                { label: "Total Days Off", value: String(Math.round(totalDays)), color: "from-indigo-600/20 to-indigo-600/5" },
              ].map((k) => (
                <Card key={k.label} className={`bg-gradient-to-br ${k.color} border-white/10`}>
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="text-xs font-medium text-white/60">{k.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-xl font-bold text-white">{k.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {STATUSES.map((s) => (
                  <Button key={s} variant="ghost" size="sm"
                    className={`capitalize text-xs ${activeStatus === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
                    onClick={() => setActiveStatus(s)}>
                    {s} <span className="ml-1.5 text-white/30">
                      ({s === "all" ? leaves.length : (leaves as any[]).filter((l) => l.status?.toLowerCase() === s).length})
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by employee or leave type..."
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                </div>
                {canCreateLeave && !isPlatformAdmin && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setLocation(`/org/${slug}/leave/create`)}>
                    <Plus className="h-4 w-4 mr-1" /> New Request
                  </Button>
                )}
              </div>
            </div>

            {/* Leave Table */}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {view === "approvals" ? "Organization leave requests" : "My leave history"}
              </h2>
              <p className="text-sm text-white/50">
                {view === "approvals" ? "Leave requests submitted by employees in your organization." : "Track your submitted requests and their decisions."}
              </p>
            </div>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 bg-white/5 rounded" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <Calendar className="h-10 w-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">{search || activeStatus !== "all" ? "No leave requests match your filters" : "No leave requests yet"}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    <div className="grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">
                      <div className="col-span-3">Employee</div>
                      <div className="col-span-2">Leave Type</div>
                      <div className="col-span-2">Dates</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1 text-right">Days</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {filtered.map((l: any) => {
                      const days = l.startDate && l.endDate
                        ? countWeekdaysInclusive(l.startDate, l.endDate)
                        : "—";
                      return (
                        <div key={l.id} className="grid grid-cols-12 px-6 py-3 items-center hover:bg-white/5 transition-colors">
                          <div className="col-span-3">
                            <p className="text-sm font-medium text-white">{l.employeeName || "Unknown"}</p>
                            <p className="text-xs text-white/40">{l.employeeEmail || "—"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-white/70 capitalize">{l.leaveType || "Annual"}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-white/60">
                              {l.startDate ? new Date(l.startDate).toLocaleDateString() : "—"}
                              {l.endDate && ` – ${new Date(l.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="col-span-2"><StatusBadge status={l.status} /></div>
                          <div className="col-span-1 text-right">
                            <p className="text-sm text-white/60">{days}</p>
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            {view === "approvals" && canApproveLeave && l.status === "pending" ? (
                              <>
                                <Button size="sm" onClick={() => { setReviewComments(""); setReviewing({ id: l.id, organizationId: l.organizationId, decision: "approve" }); }}>Approve</Button>
                                <Button size="sm" variant="outline" onClick={() => { setReviewComments(""); setReviewing({ id: l.id, organizationId: l.organizationId, decision: "return" }); }}>Return</Button>
                                <Button size="sm" variant="destructive" onClick={() => { setReviewComments(""); setReviewing({ id: l.id, organizationId: l.organizationId, decision: "reject" }); }}>Reject</Button>
                              </>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-white/70" onClick={() => setLocation(`/org/${slug}/leave/${l.id}`)}>View</Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        <Dialog open={Boolean(reviewing)} onOpenChange={(open) => { if (!open) { setReviewing(null); setReviewComments(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewing?.decision === "approve" ? "Approve leave request" : reviewing?.decision === "return" ? "Return leave request for revision" : "Reject leave request"}</DialogTitle>
              <DialogDescription>{reviewing?.decision === "approve" ? "Add an optional comment for the employee." : "Instructions are required and will be shared with the employee."}</DialogDescription>
            </DialogHeader>
            <Textarea value={reviewComments} onChange={(event) => setReviewComments(event.target.value)} placeholder={reviewing?.decision === "approve" ? "Approval comment (optional)" : reviewing?.decision === "return" ? "Explain what the employee should revise" : "Rejection reason"} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
              <Button variant={reviewing?.decision === "reject" ? "destructive" : "default"} disabled={approveMutation.isPending || rejectMutation.isPending || returnMutation.isPending} onClick={submitReview}>
                {reviewing?.decision === "approve" ? "Confirm approval" : reviewing?.decision === "return" ? "Return for revision" : "Confirm rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </OrgLayout>
  );
}
