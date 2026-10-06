import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { toast } from "sonner";
import { ArrowLeft, Calendar } from "lucide-react";
import { addWeekdays, countWeekdaysInclusive } from "@shared/leaveDays";

const LEAVE_TYPES = [
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "maternity", label: "Maternity" },
  { value: "paternity", label: "Paternity" },
  { value: "unpaid", label: "Unpaid" },
  { value: "other", label: "Other" },
  { value: "other", label: "Other" },
];

export default function OrgCreateLeave() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  const canCreateLeave = hasAccess('org:leave:create');

  const [, setLocation] = useLocation();

  const initialDate = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    leaveType: "annual" as const,
    startDate: initialDate,
    endDate: addWeekdays(initialDate, 1) || initialDate,
    days: "1",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.hrLeave.requestLeave.useMutation({
    onSuccess: () => {
      toast.success("Leave request created", { description: "The leave request has been submitted successfully." });
      setLocation(`/org/${slug}/leave`);
    },
    onError: (err) => {
      toast.error("Failed to create leave request", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const updateStartDate = (startDate: string) => {
    setForm((current) => ({
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
    setForm((current) => ({
      ...current,
      endDate,
      days: current.startDate
        ? String(countWeekdaysInclusive(current.startDate, endDate) || "")
        : current.days,
    }));
  };

  const updateDays = (days: string) => {
    setForm((current) => ({
      ...current,
      days,
      endDate: Number(days) > 0 && current.startDate
        ? addWeekdays(current.startDate, Number(days)) || ""
        : current.startDate ? "" : current.endDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateLeave) {
      return;
    }

    if (!form.startDate || !form.endDate || Number(form.days) <= 0) {
      toast.error("Missing required fields", { description: "Dates and number of days are required." });
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      leaveType: form.leaveType as any,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      days: countWeekdaysInclusive(form.startDate, form.endDate),
      reason: form.reason,
    });
  };

  if (!canCreateLeave) {
    return (
      <OrgLayout title="Request Leave" showOrgInfo={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <OrgBreadcrumb slug={slug} items={[{ label: "Leave", href: `/org/${slug}/leave` }, { label: "Request Leave" }]} />
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to request leave.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Request Leave" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[{ label: "Leave", href: `/org/${slug}/leave` }, { label: "Request Leave" }]} />
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/leave`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Leave
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Request Leave
            </CardTitle>
            <CardDescription className="text-white/60">Submit a leave request for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-white/50">This request will be submitted for your employee profile.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leaveType" className="text-white">Leave Type *</Label>
                  <Select value={form.leaveType} onValueChange={(value) => setForm({ ...form, leaveType: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white">Start Date *</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => updateStartDate(e.target.value)} className="bg-white/5 border-white/10 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white">End Date *</Label>
                  <Input id="endDate" type="date" value={form.endDate} onChange={(e) => updateEndDate(e.target.value)} className="bg-white/5 border-white/10 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days" className="text-white">Number of Days *</Label>
                  <Input id="days" type="number" min="1" value={form.days} onChange={(e) => updateDays(e.target.value)} className="bg-white/5 border-white/10 text-white" required />
                  <p className="text-xs text-white/50">Only weekdays are counted; weekends are excluded.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-white">Reason</Label>
                <Textarea id="reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="bg-white/5 border-white/10 text-white min-h-[120px]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setLocation(`/org/${slug}/leave`)} className="text-white/50 hover:text-white">Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Submit Request"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
