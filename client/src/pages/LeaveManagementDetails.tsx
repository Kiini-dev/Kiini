import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModuleLayout } from "@/components/ModuleLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Edit2, Trash2, Calendar, CalendarDays } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { countWeekdaysInclusive } from "@shared/leaveDays";
import mutateAsync from '@/lib/mutationHelpers';
import { useAuth } from "@/_core/hooks/useAuth";
import { canAccessFeature } from "@/lib/permissions";

export default function LeaveManagementDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const canReview = Boolean(user && canAccessFeature(user.role, "leave:approve"));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: ownLeave, isLoading: ownLoading } = trpc.leave.getById.useQuery(id || "", {
    enabled: Boolean(id) && !canReview,
  });
  const { data: reviewLeave, isLoading: reviewLoading } = trpc.leave.getForApproval.useQuery(id || "", {
    enabled: Boolean(id) && canReview,
  });
  const leaveData = canReview ? reviewLeave : ownLeave;
  const isLoading = canReview ? reviewLoading : ownLoading;
  const utils = trpc.useUtils();

  const deleteLeaveMutation = trpc.leave.delete.useMutation({
    onSuccess: () => {
      toast.success("Leave request deleted successfully");
      utils.leave.list.invalidate();
      setLocation("/leave-management");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete leave request");
    },
  });

  // Calculate days
  const calculateDays = (startDate: string, endDate: string) => {
    return countWeekdaysInclusive(startDate, endDate);
  };

  const leaveRecord = leaveData ? {
    id: id,
    employeeId: (leaveData as any).employeeId || "Unknown",
    employeeName: (leaveData as any).employeeName || "My leave request",
    leaveType: (leaveData as any).leaveType || "Annual Leave",
    startDate: (leaveData as any).startDate ? new Date((leaveData as any).startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: (leaveData as any).endDate ? new Date((leaveData as any).endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    daysRequested: (leaveData as any).startDate && (leaveData as any).endDate 
      ? calculateDays((leaveData as any).startDate, (leaveData as any).endDate)
      : 0,
    status: (leaveData as any).status || "pending",
    reason: (leaveData as any).reason || "",
    approvalComments: (leaveData as any).approvalComments || "",
  } : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteLeaveMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    return <Badge variant="outline">{type}</Badge>;
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Leave Request Details"
        icon={<Calendar className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Leave Management", href: "/leave-management" },
          { label: "Details" },
        ]}
        backLink={{ label: "Leave Management", href: "/leave-management" }}
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading leave request...</p>
        </div>
      </ModuleLayout>
    );
  }

  if (!leaveRecord) {
    return (
      <ModuleLayout
        title="Leave Request Details"
        icon={<Calendar className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Leave Management", href: "/leave-management" },
          { label: "Details" },
        ]}
        backLink={{ label: "Leave Management", href: "/leave-management" }}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Leave request not found</p>
          <Button onClick={() => setLocation("/leave-management")}>Back to Leave Management</Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Leave Request Details"
      icon={<Calendar className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Leave Management", href: "/leave-management" },
        { label: "Details" },
      ]}
      backLink={{ label: "Leave Management", href: "/leave-management" }}
    >
      <div className="space-y-3">

        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT SIDEBAR */}
          <div className="lg:w-72 shrink-0 space-y-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{leaveRecord.employeeName}</CardTitle>
                  <Badge variant={getStatusVariant(leaveRecord.status)}>
                    {leaveRecord.status.charAt(0).toUpperCase() + leaveRecord.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <div className="mt-1">{getLeaveTypeBadge(leaveRecord.leaveType)}</div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-semibold">{leaveRecord.employeeId}</p>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">From - To</p>
                    <p className="font-semibold">{leaveRecord.startDate} → {leaveRecord.endDate}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Days Requested</p>
                  <p className="text-2xl font-bold">{leaveRecord.daysRequested} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reason / Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveRecord.reason ? (
                  <p className="text-sm leading-relaxed">{leaveRecord.reason}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No reason provided.</p>
                )}
              </CardContent>
            </Card>

            {leaveRecord.approvalComments && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval / Rejection Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{leaveRecord.approvalComments}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge variant={getStatusVariant(leaveRecord.status)}>
                    {leaveRecord.status.charAt(0).toUpperCase() + leaveRecord.status.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Request Duration</p>
                  <p className="text-sm font-medium">{leaveRecord.daysRequested} day(s)</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="text-sm font-medium">{leaveRecord.startDate} — {leaveRecord.endDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Leave Request"
          description="Are you sure you want to delete this leave request? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </ModuleLayout>
  );
}
