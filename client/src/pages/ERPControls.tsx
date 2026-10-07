import { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, FilePlus2, LockKeyhole, ReceiptText, Scale } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/utils/format";

export default function ERPControls() {
  const utils = trpc.useUtils();
  const [periodName, setPeriodName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const periods = trpc.erpOperations.periods.list.useQuery();
  const postings = trpc.erpOperations.posting.list.useQuery();
  const aging = trpc.erpOperations.receivables.aging.useQuery();
  const reportErrors = [periods, postings, aging]
    .filter((query) => query.isError)
    .map((query) => query.error?.message || "Request failed");
  const createPeriod = trpc.erpOperations.periods.create.useMutation({
    onSuccess: () => { toast.success("Accounting period created"); setPeriodName(""); setPeriodStart(""); setPeriodEnd(""); utils.erpOperations.periods.list.invalidate(); },
    onError: (error) => toast.error(error.message),
  });
  const setPeriodStatus = trpc.erpOperations.periods.setStatus.useMutation({
    onSuccess: () => { toast.success("Accounting period updated"); utils.erpOperations.periods.list.invalidate(); },
    onError: (error) => toast.error(error.message),
  });

  const totalOutstanding = (aging.data as any[] | undefined)?.reduce((sum, row) => sum + Number(row.total || 0) - Number(row.paidAmount || 0), 0) || 0;
  const money = (value: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value / 100);

  return (
    <ModuleLayout title="ERP Controls" description="Accounting control, posting, reconciliation and receivables operations" icon={<Scale className="h-5 w-5" />} breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Accounting", href: "/accounting" }, { label: "ERP Controls" }]}>
      <div className="space-y-5">
        {reportErrors.length > 0 && <Card role="alert" className="border-destructive"><CardContent className="pt-6 text-sm text-destructive">Some ERP control data could not be loaded: {reportErrors.join("; ")}</CardContent></Card>}
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardDescription>Open accounting periods</CardDescription><CardTitle>{(periods.data as any[] | undefined)?.filter((row) => row.status === "open").length || 0}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Posted batches</CardDescription><CardTitle>{(postings.data as any[] | undefined)?.length || 0}</CardTitle></CardHeader></Card>
          <Card><CardHeader className="pb-2"><CardDescription>Receivables outstanding</CardDescription><CardTitle>{money(totalOutstanding)}</CardTitle></CardHeader></Card>
        </div>
        <Tabs defaultValue="periods">
          <TabsList><TabsTrigger value="periods"><CalendarClock className="mr-2 h-4 w-4" />Periods</TabsTrigger><TabsTrigger value="postings"><FilePlus2 className="mr-2 h-4 w-4" />Postings</TabsTrigger><TabsTrigger value="aging"><ReceiptText className="mr-2 h-4 w-4" />AR Aging</TabsTrigger></TabsList>
          <TabsContent value="periods" className="space-y-4">
            <Card><CardHeader><CardTitle>Create accounting period</CardTitle><CardDescription>Periods control when transactions can be posted and when books can be closed.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><Input placeholder="2026 Q4" value={periodName} onChange={(event) => setPeriodName(event.target.value)} /><Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /><Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /><Button disabled={!periodName || !periodStart || !periodEnd || createPeriod.isPending} onClick={() => createPeriod.mutate({ name: periodName, startDate: periodStart, endDate: periodEnd })}>Create period</Button></CardContent></Card>
            <Card><CardHeader><CardTitle>Accounting periods</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{((periods.data as any[]) || []).map((period) => <TableRow key={period.id}><TableCell className="font-medium">{period.name}</TableCell><TableCell>{formatDate(period.startDate)} to {formatDate(period.endDate)}</TableCell><TableCell><Badge variant={period.status === "closed" ? "secondary" : period.status === "locked" ? "outline" : "default"}>{period.status}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={setPeriodStatus.isPending} onClick={() => setPeriodStatus.mutate({ id: period.id, status: period.status === "open" ? "locked" : "open" })}><LockKeyhole className="mr-1 h-3 w-3" />{period.status === "open" ? "Lock" : "Reopen"}</Button>{period.status !== "closed" && <Button size="sm" onClick={() => setPeriodStatus.mutate({ id: period.id, status: "closed" })}>Close</Button>}</div></TableCell></TableRow>)}{!periods.data?.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No accounting periods yet.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
          </TabsContent>
          <TabsContent value="postings"><Card><CardHeader><CardTitle>ERP posting batches</CardTitle><CardDescription>Balanced source-linked postings created through the ERP posting API.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader><TableBody>{((postings.data as any[]) || []).map((posting) => <TableRow key={posting.id}><TableCell>{formatDate(posting.postingDate)}</TableCell><TableCell>{posting.sourceType}</TableCell><TableCell>{posting.description}</TableCell><TableCell className="text-right">{money(Number(posting.totalDebit || 0))}</TableCell><TableCell className="text-right">{money(Number(posting.totalCredit || 0))}</TableCell></TableRow>)}{!postings.data?.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No ERP postings yet.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
          <TabsContent value="aging"><Card><CardHeader><CardTitle>Accounts receivable aging</CardTitle><CardDescription>Open invoices grouped by due-date risk.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Outstanding</TableHead><TableHead className="text-right">Days overdue</TableHead></TableRow></TableHeader><TableBody>{((aging.data as any[]) || []).map((row) => <TableRow key={row.id}><TableCell>{row.invoiceNumber}</TableCell><TableCell>{row.dueDate ? formatDate(row.dueDate) : "-"}</TableCell><TableCell>{row.status}</TableCell><TableCell className="text-right">{money(Number(row.total || 0) - Number(row.paidAmount || 0))}</TableCell><TableCell className="text-right">{Math.max(0, Number(row.daysOverdue || 0))}</TableCell></TableRow>)}{!aging.data?.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No outstanding receivables.</TableCell></TableRow>}</TableBody></Table></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
}
