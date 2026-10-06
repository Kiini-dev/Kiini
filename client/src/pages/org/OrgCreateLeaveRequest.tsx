import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, ArrowLeft } from "lucide-react";
import { addWeekdays, countWeekdaysInclusive } from "@shared/leaveDays";

export default function CreateLeaveRequest() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    days: "",
    reason: "",
  });

  const { data: employees = [] } = trpc.employees.list.useQuery({});

  const createLeaveRequestMutation = trpc.leave.create.useMutation({
    onSuccess: () => {
      toast.success("Leave request submitted successfully!");
      utils.leave.list.invalidate();
      navigate("/leave-management");
    },
    onError: (error: any) => {
      toast.error(`Failed to submit leave request: ${error.message}`);
    },
  });

  const updateStartDate = (startDate: string) => {
    setFormData((current) => ({
      ...current,
      startDate,
      endDate: Number(current.days) > 0
        ? addWeekdays(startDate, Number(current.days)) || ""
        : current.endDate,
      days: Number(current.days) > 0 || !current.endDate
        ? current.days
        : String(countWeekdaysInclusive(startDate, current.endDate) || ""),
    }));
  };

  const updateEndDate = (endDate: string) => {
    setFormData((current) => ({
      ...current,
      endDate,
      days: current.startDate
        ? String(countWeekdaysInclusive(current.startDate, endDate) || "")
        : current.days,
    }));
  };

  const updateDays = (days: string) => {
    setFormData((current) => ({
      ...current,
      days,
      endDate: Number(days) > 0 && current.startDate
        ? addWeekdays(current.startDate, Number(days)) || ""
        : current.startDate ? "" : current.endDate,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.days) {
      toast.error("Please fill in all required fields");
      return;
    }

    createLeaveRequestMutation.mutate({
      employeeId: formData.employeeId,
      leaveType: formData.leaveType as any,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      days: countWeekdaysInclusive(formData.startDate, formData.endDate),
      reason: formData.reason || undefined,
    });
  };

  return (
    <ModuleLayout
      title="Request Leave"
      description="Submit a leave request"
      icon={<Calendar className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "HR", href: "/hr" },
        { label: "Leave Management", href: "/leave-management" },
        { label: "Request Leave" },
      ]}
    >
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Request Leave</CardTitle>
            <CardDescription>
              Submit a leave request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employeeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(employees) && employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {(emp.firstName || "")} {(emp.lastName || "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, leaveType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Number of Days *</Label>
                <Input
                  id="days"
                  type="number"
                  placeholder="0"
                  value={formData.days}
                  onChange={(e) => updateDays(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">Only weekdays are counted; weekends are excluded.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for leave request..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/leave-management")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLeaveRequestMutation.isPending}
                >
                  {createLeaveRequestMutation.isPending
                    ? "Submitting..."
                    : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
