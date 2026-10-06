import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";
import ActionButtons from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Umbrella,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "annual" | "sick" | "unpaid" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "approved" | "pending" | "rejected" | "returned" | "cancelled";
  appliedDate: string;
  approvalComments?: string;
  organizationId?: string | null;
  organizationName?: string;
}

export default function LeaveManagement() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === "super_admin";
  const canReview = Boolean(user && ["hr", "super_admin"].includes(user.role));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"mine" | "approvals">(canReview ? "approvals" : "mine");
  const [organizationScope, setOrganizationScope] = useState<"all" | "current">(isPlatformAdmin ? "all" : "current");
  const [reviewing, setReviewing] = useState<{ id: string; organizationId?: string | null; decision: "approve" | "reject" | "return" } | null>(null);
  const [reviewComments, setReviewComments] = useState("");

  const { data: myRequests = [], isLoading: myRequestsLoading } = trpc.leave.list.useQuery(
    { limit: 100 },
    { enabled: Boolean(user) && !isPlatformAdmin && view === "mine" },
  );
  const currentYear = new Date().getFullYear();
  const { data: myLeaveBalances = [], isLoading: balancesLoading, error: balancesError } = trpc.hrLeave.getLeaveBalance.useQuery(
    { fiscalYear: currentYear },
    { enabled: Boolean(user) && !isPlatformAdmin && view === "mine" },
  );
  const { data: approvalRequests = [], isLoading: approvalRequestsLoading, error: approvalRequestsError } = trpc.leave.listForApproval.useQuery(
    { limit: 500, allOrganizations: isPlatformAdmin && organizationScope === "all" },
    { enabled: canReview },
  );
  useEffect(() => {
    if (canReview) setView("approvals");
  }, [canReview]);
  useEffect(() => {
    setOrganizationScope(isPlatformAdmin ? "all" : "current");
  }, [isPlatformAdmin]);
  const requests = (view === "approvals" && canReview ? approvalRequests : myRequests) as LeaveRequest[];
  const isLoading = myRequestsLoading || (view === "approvals" && approvalRequestsLoading);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.leave.delete.useMutation({
    onSuccess: () => { void utils.leave.list.invalidate(); },
  });
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

  const handleReview = () => {
    if (!reviewing) return;
    if (reviewing.decision !== "approve" && !reviewComments.trim()) {
      toast.error(reviewing.decision === "return" ? "Add instructions for the employee" : "Add a rejection reason before continuing");
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

  const filteredRequests = requests.filter((request) => {
    const now = new Date();
    const matchesSearch =
      String(request.employeeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(request.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(request.leaveType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(request.organizationName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all"
      || request.status === statusFilter
      || (statusFilter === "currently_on_leave" && request.status === "approved" && new Date(request.startDate) <= now && new Date(request.endDate) >= now);

    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "outline";
      case "returned":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      case "returned":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-blue-500/10 text-blue-500";
      case "sick":
        return "bg-red-500/10 text-red-500";
      case "unpaid":
        return "bg-gray-500/10 text-gray-500";
      case "maternity":
        return "bg-pink-500/10 text-pink-500";
      case "paternity":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const totalDays = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.days, 0);
  const today = new Date();
  const onLeaveCount = new Set(requests
    .filter((r) => r.status === "approved" && new Date(r.startDate) <= today && new Date(r.endDate) >= today)
    .map((r) => r.employeeId)).size;

  return (
    <ModuleLayout
      title="Leave Management"
      description="Manage employee leave requests and approvals"
      icon={<Calendar className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "HR", href: "/hr" },
        { label: "Leave Management" },
      ]}
      actions={
        user?.employeeId && !isPlatformAdmin ? <Button onClick={() => navigate("/leave-management/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Leave Request
        </Button> : null
      }
    >
      <div className="space-y-6">
        {canReview && (
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Leave views">
            {!isPlatformAdmin && <Button variant={view === "mine" ? "default" : "outline"} onClick={() => setView("mine")}>My requests</Button>}
            <Button variant={view === "approvals" ? "default" : "outline"} onClick={() => setView("approvals")}>Leave management</Button>
            {isPlatformAdmin && view === "approvals" && <>
              <Button variant={organizationScope === "all" ? "secondary" : "outline"} onClick={() => setOrganizationScope("all")}>All organizations</Button>
              <Button variant={organizationScope === "current" ? "secondary" : "outline"} onClick={() => setOrganizationScope("current")}>{user?.organizationName || "My organization"}</Button>
            </>}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            label="Approved"
            value={approvedCount}
            description="Leave requests approved"
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="border-l-green-500"
          />

          <StatsCard
            label="Pending"
            value={pendingCount}
            description="Awaiting approval"
            icon={<Clock className="h-5 w-5" />}
            color="border-l-orange-500"
          />

          <StatsCard
            label="Total Days"
            value={totalDays}
            description="Days approved"
            icon={<Calendar className="h-5 w-5" />}
            color="border-l-blue-500"
          />

          {view === "approvals" && (
            <StatsCard
              label="Returned"
              value={requests.filter((r) => r.status === "returned").length}
              description="Needs employee revision"
              icon={<AlertCircle className="h-5 w-5" />}
              color="border-l-yellow-500"
            />
          )}

          <StatsCard
            label="Currently on Leave"
            value={onLeaveCount}
            description={view === "mine" ? "Your active leave" : "Employees currently away"}
            icon={<Umbrella className="h-5 w-5" />}
            color="border-l-purple-500"
          />
        </div>

        {view === "mine" && (
          <Card>
            <CardHeader>
              <CardTitle>My leave balances</CardTitle>
              <CardDescription>Entitlement and usage for {currentYear}, by leave type.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave type</TableHead>
                    <TableHead>Entitlement</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Available</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balancesLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading balances...</TableCell></TableRow>
                  ) : balancesError ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-destructive">Could not load leave balances: {balancesError.message}</TableCell></TableRow>
                  ) : myLeaveBalances.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No leave balances have been allocated for {currentYear}.</TableCell></TableRow>
                  ) : myLeaveBalances.map((balance: any) => (
                    <TableRow key={balance.id}>
                      <TableCell><Badge variant="outline">{String(balance.leaveType).replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell>{Number(balance.totalEntitlement || 0).toFixed(1)} days</TableCell>
                      <TableCell>{Number(balance.used || 0).toFixed(1)} days</TableCell>
                      <TableCell>{Number(balance.pending || 0).toFixed(1)} days</TableCell>
                      <TableCell className="font-semibold">{Number(balance.available || 0).toFixed(1)} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{view === "approvals" ? (organizationScope === "all" && isPlatformAdmin ? "Platform leave requests" : "Organization leave requests") : "My leave history"}</CardTitle>
                <CardDescription>{view === "approvals" ? "Monitor applications, current absences and decisions across the selected scope" : "Submit and track your leave applications"}</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="currently_on_leave">Currently on leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {view === "approvals" && approvalRequestsError && (
              <p className="mb-4 text-sm text-destructive">Could not load leave requests: {approvalRequestsError.message}</p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  {view === "approvals" && isPlatformAdmin && organizationScope === "all" && <TableHead>Organization</TableHead>}
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval comments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{request.employeeId}</div>
                      </div>
                    </TableCell>
                    {view === "approvals" && isPlatformAdmin && organizationScope === "all" && <TableCell>{request.organizationName || "Unknown organization"}</TableCell>}
                    <TableCell>
                      <Badge className={getLeaveTypeColor(request.leaveType)} variant="outline">
                        {request.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{request.days} days</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status)} className="gap-1">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.approvalComments || "—"}</TableCell>
                    <TableCell className="text-right">
                      {view === "approvals" && canReview ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/leave-management/${request.id}`)}>View</Button>
                          {request.status === "pending" && <>
                            <Button size="sm" onClick={() => { setReviewComments(""); setReviewing({ id: request.id, organizationId: request.organizationId, decision: "approve" }); }}>Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => { setReviewComments(""); setReviewing({ id: request.id, organizationId: request.organizationId, decision: "return" }); }}>Return</Button>
                            <Button size="sm" variant="destructive" onClick={() => { setReviewComments(""); setReviewing({ id: request.id, organizationId: request.organizationId, decision: "reject" }); }}>Reject</Button>
                          </>}
                        </div>
                      ) : (
                        <ActionButtons
                          id={request.id}
                          handlers={{
                            onView: (id) => navigate(`/leave-management/${id}`),
                            onEdit: (id) => navigate(`/leave-management/${id}/edit`),
                            onDelete: (id) => {
                              if (confirm("Delete this pending leave request?")) deleteMutation.mutate(String(id));
                            },
                          }}
                          showView={true}
                          showEdit={request.status === "pending" || request.status === "returned"}
                          showDelete={request.status === "pending" || request.status === "returned"}
                          variant="dropdown"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={Boolean(reviewing)} onOpenChange={(open) => { if (!open) { setReviewing(null); setReviewComments(""); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{reviewing?.decision === "approve" ? "Approve leave request" : reviewing?.decision === "return" ? "Return leave request for revision" : "Reject leave request"}</DialogTitle>
              <DialogDescription>
                {reviewing?.decision === "approve" ? "Add an optional comment for the employee." : "Instructions are required and will be shared with the employee."}
              </DialogDescription>
            </DialogHeader>
            <Textarea value={reviewComments} onChange={(event) => setReviewComments(event.target.value)} placeholder={reviewing?.decision === "approve" ? "Approval comment (optional)" : reviewing?.decision === "return" ? "Explain what the employee should revise" : "Rejection reason"} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
              <Button variant={reviewing?.decision === "reject" ? "destructive" : "default"} disabled={approveMutation.isPending || rejectMutation.isPending || returnMutation.isPending} onClick={handleReview}>
                {reviewing?.decision === "approve" ? "Confirm approval" : reviewing?.decision === "return" ? "Return for revision" : "Confirm rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
