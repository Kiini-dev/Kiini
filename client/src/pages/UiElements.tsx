import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, Bell, Check, ChevronRight, CircleHelp, Info, MoreHorizontal, Plus, Sparkles, Upload, X } from "lucide-react";
import { toast } from "sonner";

const steps = ["Details", "Review", "Publish"];
const tags = [
  ["Design", "bg-violet-50 text-violet-700"],
  ["Priority", "bg-rose-50 text-rose-700"],
  ["Client-facing", "bg-sky-50 text-sky-700"],
] as const;

export default function UiElements() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(68);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <ModuleLayout title="UI Elements" description="Interactive patterns for dashboards, workflows, and communications" icon={<Sparkles className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Tools" }, { label: "UI Elements" }]}>
      <div className="space-y-6">
        <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
          <CardHeader className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/60"><CardTitle className="text-base">Workflow stepper</CardTitle><CardDescription>Use this pattern for onboarding and multi-stage approvals.</CardDescription></CardHeader>
          <CardContent className="pt-6"><div className="flex items-center justify-between gap-2">{steps.map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none"><div className="flex flex-col items-center gap-2"><div className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold", index < step ? "border-teal-500 bg-teal-500 text-white" : index === step ? "border-teal-500 text-teal-700 ring-4 ring-teal-50 dark:text-teal-300 dark:ring-teal-950/40" : "border-slate-200 text-slate-400 dark:border-slate-700")}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</div><span className={cn("text-xs", index === step ? "font-semibold text-slate-900 dark:text-white" : "text-slate-500")}>{label}</span></div>{index < steps.length - 1 && <div className={cn("mx-3 mb-5 h-px flex-1", index < step ? "bg-teal-500" : "bg-slate-200 dark:bg-slate-700")} />}</div>)}</div><div className="mt-5 flex justify-end gap-2"><Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Back</Button><Button size="sm" onClick={() => step === steps.length - 1 ? toast.success("Workflow complete") : setStep((value) => value + 1)}>{step === steps.length - 1 ? "Finish" : "Continue"}<ChevronRight className="ml-1 h-4 w-4" /></Button></div></CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle className="text-base">Alerts and status</CardTitle><CardDescription>Clear feedback for saved, pending, and blocked states.</CardDescription></CardHeader><CardContent className="space-y-3"><Alert className="border-emerald-200 bg-emerald-50 text-emerald-900"><Check className="h-4 w-4" /><AlertTitle>Saved successfully</AlertTitle><AlertDescription className="text-emerald-800">Your project changes are now visible to the team.</AlertDescription></Alert><Alert className="border-amber-200 bg-amber-50 text-amber-900"><Info className="h-4 w-4" /><AlertTitle>Review requested</AlertTitle><AlertDescription className="text-amber-800">Two approvals are still outstanding.</AlertDescription></Alert><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Payment failed</AlertTitle><AlertDescription>Update the payment method to restore billing.</AlertDescription></Alert><div className="flex flex-wrap gap-2 pt-1">{["Paid", "Processing", "Pending", "Cancelled"].map((label) => <Badge key={label} variant="outline" className={label === "Paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : label === "Pending" ? "border-amber-200 bg-amber-50 text-amber-700" : label === "Cancelled" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-sky-200 bg-sky-50 text-sky-700"}>{label}</Badge>)}</div></CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Progress and tags</CardTitle><CardDescription>Compact tracking elements for projects and reminders.</CardDescription></CardHeader><CardContent className="space-y-5"><div><div className="mb-2 flex justify-between text-sm"><span>Q3 client portal refresh</span><span className="font-semibold">{progress}%</span></div><Progress value={progress} className="h-2" /><div className="mt-3 flex gap-2"><Button variant="outline" size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button><Button variant="outline" size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button></div></div><div className="flex flex-wrap gap-2">{tags.map(([label, style]) => <span key={label} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", style)}>{label}<button aria-label={`Remove ${label}`} className="ml-1.5 align-middle opacity-60 hover:opacity-100"><X className="inline h-3 w-3" /></button></span>)}</div><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="bg-teal-500 text-xs text-white">SK</AvatarFallback></Avatar><div><p className="text-sm font-medium">Sarah Kowalski</p><p className="text-xs text-muted-foreground">Updated 4 minutes ago</p></div><button aria-label="More activity actions" className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="h-4 w-4" /></button></div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle className="text-base">Tabs, forms, and contextual help</CardTitle><CardDescription>Patterns for dense admin workflows without losing guidance.</CardDescription></CardHeader><CardContent><Tabs value={activeTab} onValueChange={setActiveTab}><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsContent value="overview" className="pt-5"><div className="grid gap-5 md:grid-cols-2"><div className="space-y-4"><div className="space-y-2"><Label htmlFor="project-name">Project name</Label><div className="flex gap-2"><Input id="project-name" defaultValue="Q3 client portal refresh" /><TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" aria-label="Project name help"><CircleHelp className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Use a name your client will recognize.</TooltipContent></Tooltip></TooltipProvider></div></div><div className="space-y-2"><Label>Status</Label><Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planning">Planning</SelectItem><SelectItem value="active">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div></div><div className="space-y-4"><div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" placeholder="Add a short handoff note..." /></div><div className="flex flex-wrap items-center gap-2"><Button onClick={() => toast.success("Draft saved")}>Save draft</Button><Popover><PopoverTrigger asChild><Button variant="outline"><Bell className="mr-2 h-4 w-4" /> Reminder</Button></PopoverTrigger><PopoverContent><p className="text-sm font-semibold">Set a reminder</p><p className="mt-1 text-xs text-muted-foreground">Choose when this item should return to your attention.</p><Button size="sm" className="mt-3" onClick={() => toast.success("Reminder added")}>Add reminder</Button></PopoverContent></Popover><Button variant="ghost" size="icon" aria-label="Upload attachment" onClick={() => toast.info("Attachment picker opened")}><Upload className="h-4 w-4" /></Button></div></div></div></TabsContent><TabsContent value="settings" className="pt-5"><div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">Settings panels can reuse the same form, tabs, and alert patterns.</div></TabsContent><TabsContent value="activity" className="pt-5"><div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700"><span className="h-2 w-2 rounded-full bg-teal-500" /><span className="text-sm">Sarah updated the project brief</span><span className="ml-auto text-xs text-muted-foreground">4m ago</span></div></TabsContent></Tabs></CardContent></Card>
      </div>
    </ModuleLayout>
  );
}
