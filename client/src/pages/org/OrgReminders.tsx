import { useState } from "react";
import { AlarmClock, CalendarDays, Edit2, Plus, Trash2 } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";

const emptyForm = { name: "", type: "custom" as const, frequency: "once" as const, timing: "on" as const, customDays: "", emailEnabled: true, smsEnabled: false, emailTemplate: "" };

export default function Reminders() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ reminderId: "", scheduledFor: "", referenceType: "custom", referenceId: "" });
  const { user } = useAuthWithPersistence({ redirectOnUnauthenticated: false });
  const { data: definitions = [], isLoading } = trpc.reminders.definitions.useQuery();
  const { data: scheduled = [] } = trpc.reminders.list.useQuery({ limit: 100 });
  const utils = trpc.useUtils();
  const create = trpc.reminders.create.useMutation();
  const update = trpc.reminders.update.useMutation();
  const remove = trpc.reminders.delete.useMutation();
  const deliver = trpc.reminders.deliverDue.useMutation();
  const schedule = trpc.reminders.schedule.useMutation();
  const cancel = trpc.reminders.cancel.useMutation();

  const save = async () => {
    if (!form.name.trim()) return toast.error("Reminder name is required");
    try {
      const input = { ...form, customDays: form.customDays ? Number(form.customDays) : undefined };
      if (editingId) await update.mutateAsync({ id: editingId, ...input });
      else await create.mutateAsync(input);
      await utils.reminders.definitions.invalidate();
      setForm(emptyForm); setEditingId(null); toast.success("Reminder saved");
    } catch (error: any) { toast.error(error.message || "Failed to save reminder"); }
  };

  const saveSchedule = async () => {
    if (!scheduleForm.reminderId || !scheduleForm.scheduledFor || !user?.id) return toast.error("Select a reminder and date");
    try {
      await schedule.mutateAsync({ reminderId: scheduleForm.reminderId, scheduledFor: new Date(scheduleForm.scheduledFor), referenceType: scheduleForm.referenceType, referenceId: scheduleForm.referenceId || "reminder", recipientId: user.id, recipientType: "user" });
      await utils.reminders.list.invalidate();
      setScheduleForm({ ...scheduleForm, reminderId: "", scheduledFor: "", referenceId: "" });
      toast.success("Reminder scheduled");
    } catch (error: any) { toast.error(error.message || "Failed to schedule reminder"); }
  };

  return <ModuleLayout title="Reminders" description="Manage scheduled reminders, notifications, and calendar follow-ups." icon={<AlarmClock className="h-5 w-5" />} actions={<Button onClick={() => { setEditingId(null); setForm(emptyForm); }}><Plus className="mr-2 h-4 w-4" />New Reminder</Button>}>
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card><CardHeader><CardTitle>{editingId ? "Edit Reminder" : "Create Reminder"}</CardTitle></CardHeader><CardContent className="space-y-4">
        <Input placeholder="Reminder name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}><option value="custom">Custom</option><option value="invoice_due">Invoice due</option><option value="estimate_expiry">Estimate expiry</option><option value="project_milestone">Project milestone</option><option value="payment_overdue">Payment overdue</option></select>
        <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as any })}><option value="once">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom interval</option></select>
        {form.frequency === "custom" && <Input type="number" min="1" placeholder="Repeat every N days" value={form.customDays} onChange={e => setForm({ ...form, customDays: e.target.value })} />}
        <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.timing} onChange={e => setForm({ ...form, timing: e.target.value as any })}><option value="on">On due date</option><option value="before">Before due date</option><option value="after">After due date</option></select>
        <Input placeholder="Notification message" value={form.emailTemplate} onChange={e => setForm({ ...form, emailTemplate: e.target.value })} />
        <div className="flex gap-2"><Button onClick={save} disabled={create.isPending || update.isPending}>{editingId ? "Update" : "Create"}</Button>{editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}</div>
      </CardContent></Card>
      <div className="space-y-6"><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Reminder Definitions</CardTitle><Button variant="outline" size="sm" onClick={() => deliver.mutateAsync().then(() => utils.reminders.list.invalidate())}><CalendarDays className="mr-2 h-4 w-4" />Process Due</Button></CardHeader><CardContent>{isLoading ? <p>Loading...</p> : <div className="space-y-2">{definitions.map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-md border p-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.type} · {item.frequency} · {item.timing}</p></div><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setScheduleForm({ ...scheduleForm, reminderId: item.id })}>Schedule</Button><Button size="icon" variant="ghost" onClick={() => { setEditingId(item.id); setForm({ ...emptyForm, ...item, customDays: item.customDays ? String(item.customDays) : "", emailEnabled: Boolean(item.emailEnabled), smsEnabled: Boolean(item.smsEnabled) }); }}><Edit2 className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove.mutateAsync(item.id).then(() => utils.reminders.definitions.invalidate())}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></div>)}</div>}</CardContent></Card><Card><CardHeader><CardTitle>Schedule Reminder</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-4"><select className="rounded-md border px-3 py-2 text-sm" value={scheduleForm.reminderId} onChange={e => setScheduleForm({ ...scheduleForm, reminderId: e.target.value })}><option value="">Select reminder</option>{definitions.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Input type="datetime-local" value={scheduleForm.scheduledFor} onChange={e => setScheduleForm({ ...scheduleForm, scheduledFor: e.target.value })} /><Input placeholder="Reference ID (optional)" value={scheduleForm.referenceId} onChange={e => setScheduleForm({ ...scheduleForm, referenceId: e.target.value })} /><Button onClick={saveSchedule} disabled={schedule.isPending}>Schedule</Button></CardContent></Card><Card><CardHeader><CardTitle>Scheduled Reminders</CardTitle></CardHeader><CardContent>{scheduled.length ? <div className="space-y-2">{scheduled.map((item: any) => <div key={item.id} className="flex items-center justify-between border-b py-2 text-sm"><span>{item.title || "Reminder"}</span><Badge variant="outline">{item.status}</Badge><span>{new Date(item.scheduledFor).toLocaleString()}</span>{item.status === "pending" && <Button size="sm" variant="ghost" onClick={() => cancel.mutateAsync({ id: item.id }).then(() => utils.reminders.list.invalidate())}>Cancel</Button>}</div>)}</div> : <p className="text-sm text-muted-foreground">No scheduled reminders.</p>}</CardContent></Card></div>
    </div>
  </ModuleLayout>;
}
