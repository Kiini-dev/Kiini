import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, User, Edit2 } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    present: "bg-green-500/20 text-green-300 border-green-500/30",
    absent: "bg-red-500/20 text-red-300 border-red-500/30",
    late: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "half-day": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgAttendanceDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const attendanceId = params.id as string;

  const canViewAttendance = hasAccess('org:attendance:view');
  const canEditAttendance = hasAccess('org:attendance:edit');
  const canDeleteAttendance = hasAccess('org:attendance:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: attendance, isLoading } = trpc.attendance.getById.useQuery(attendanceId, {
    enabled: !!attendanceId && checkPermission("hr:attendance:view"),
  });

  const handleEdit = () => {
    setLocation(`/org/${slug}/attendance/${attendanceId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/org/${slug}/attendance`);
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
      <PermissionGuard allowed={canViewAttendance} feature="org:attendance:view" slug={slug}>

        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!attendance) {
    return (
      <OrgLayout slug={slug}>
        <div className="p-6">
          <div className="text-center text-red-400">Attendance record not found</div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Attendance", href: `/org/${slug}/attendance` },
          { label: `Attendance #${attendanceId}` },
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Attendance Details</h1>
          </div>
          {checkPermission("hr:attendance:edit") && (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Record
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{attendance.employeeName || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  {attendance.date
                    ? new Date(attendance.date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={attendance.status} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Check-in Time</label>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {attendance.checkInTime || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Check-out Time</label>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {attendance.checkOutTime || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Notes</label>
                <p className="text-sm">{attendance.notes || "No notes"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

