import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Send, Trash2, Download, DollarSign, FileCheck, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { StatsCard } from "@/components/ui/stats-card";
import { useCurrencySettings } from "@/lib/currency";

export default function Payslips() {
  useRequireFeature("hr:payroll:view");
  const { formatAmount } = useCurrencySettings();
  const formatStoredAmount = (value: unknown) => formatAmount(Number(value || 0) / 100);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateForm, setGenerateForm] = useState({ payPeriod: "", payDate: "" });
  const [selectedPayslip, setSelectedPayslip] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [, navigate] = useLocation();

  const payslips = trpc.payslips.listAll.useQuery({
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    payPeriod: periodFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const payslipDetail = trpc.payslips.getById.useQuery(
    { id: selectedPayslip! },
    { enabled: !!selectedPayslip }
  );
  const utils = trpc.useUtils();

  const generate = trpc.payslips.generate.useMutation({
    onSuccess: (data) => {
      if (data.errors.length) {
        toast.warning(`Generated ${data.generated} payslip${data.generated === 1 ? "" : "s"}; ${data.errors.length} failed`);
        data.errors.slice(0, 3).forEach((error) => toast.error(error));
      } else {
        toast.success(`Generated ${data.generated} payslips`);
      }
      setShowGenerate(false);
      setGenerateForm({ payPeriod: "", payDate: "" });
      utils.payslips.listAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const sendPayslips = trpc.payslips.sendPayslips.useMutation({
    onSuccess: (data) => {
      if (data.sent > 0) {
        toast.success(`Sent ${data.sent}/${data.total} payslips`);
      } else if (data.errors.length === 0) {
        toast.info("No payslips were sent");
      }
      if (data.errors.length) data.errors.forEach(e => toast.error(e));
      setSelectedIds([]);
      utils.payslips.listAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deletePayslip = trpc.payslips.delete.useMutation({
    onSuccess: () => { toast.success("Deleted"); setDeleteId(null); utils.payslips.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const data = (payslips.data || []) as any[];
  const filtered = data.filter((p: any) =>
    !search || `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: data.length,
    draft: data.filter(p => p.status === "draft").length,
    generated: data.filter(p => p.status === "generated").length,
    sent: data.filter(p => p.status === "sent").length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <ModuleLayout
      title="Payslips"
      description="Generate and send employee payslips"
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[{ label: "HR", href: "/employees" }, { label: "Payroll", href: "/payroll" }, { label: "Payslips" }]}
    >
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatsCard label="Total Payslips" value={stats.total} icon={<FileText className="h-5 w-5" />} color="border-l-blue-500" />
        <StatsCard label="Generated" value={stats.generated} icon={<FileCheck className="h-5 w-5" />} color="border-l-green-500" />
        <StatsCard label="Sent" value={stats.sent} icon={<Send className="h-5 w-5" />} color="border-l-purple-500" />
        <StatsCard label="Draft" value={stats.draft} icon={<Clock className="h-5 w-5" />} color="border-l-orange-500" />
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="generated">Generated</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
          </SelectContent>
        </Select>
        <Input type="month" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="w-[180px]" placeholder="Pay Period" />
        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriodFilter(""); }} className="w-[160px]" aria-label="Start date" />
        <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriodFilter(""); }} className="w-[160px]" aria-label="End date" />
        {selectedIds.length > 0 && (
          <Button variant="secondary" onClick={() => sendPayslips.mutate({ payslipIds: selectedIds })} disabled={sendPayslips.isPending}>
            <Send className="h-4 w-4 mr-2" /> Send Selected ({selectedIds.length})
          </Button>
        )}
        <Button onClick={() => setShowGenerate(true)}>
          <DollarSign className="h-4 w-4 mr-2" /> Generate Payslips
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {payslips.isLoading ? (
            <div className="flex justify-center p-8"><Spinner /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map((p: any) => p.id) : [])}
                      checked={selectedIds.length === filtered.length && filtered.length > 0} />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No payslips found. Generate payslips for a pay period.</TableCell></TableRow>
                ) : filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{p.firstName} {p.lastName}<br /><span className="text-xs text-muted-foreground">{p.employeeNumber}</span></TableCell>
                    <TableCell>{p.payPeriod}</TableCell>
                    <TableCell>{p.payDate ? format(new Date(p.payDate), "MMM d, yyyy") : "-"}</TableCell>
                    <TableCell className="text-right text-green-600">{formatStoredAmount(p.grossPay)}</TableCell>
                    <TableCell className="text-right text-red-600">{formatStoredAmount(p.totalDeductions)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatStoredAmount(p.netPay)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "sent" ? "default" : p.status === "generated" ? "secondary" : "outline"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/payslips/${p.id}`)} title={`Payslip ${p.payPeriod}`}><FileText className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => sendPayslips.mutate({ payslipIds: [p.id] })} title="Send"><Send className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteId(p.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payslip Detail Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
            <DialogDescription>{payslipDetail.data?.firstName} {payslipDetail.data?.lastName} - {payslipDetail.data?.payPeriod}</DialogDescription>
          </DialogHeader>
          {payslipDetail.isLoading ? <Spinner /> : payslipDetail.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Employee #</div><div className="font-medium">{payslipDetail.data.employeeNumber}</div>
                <div>Department</div><div className="font-medium">{payslipDetail.data.department}</div>
                <div>Position</div><div className="font-medium">{payslipDetail.data.position}</div>
                <div>Tax ID</div><div className="font-medium">{payslipDetail.data.taxId || "-"}</div>
                <div>NHIF #</div><div className="font-medium">{payslipDetail.data.nhifNumber || "-"}</div>
                <div>NSSF #</div><div className="font-medium">{payslipDetail.data.nssfNumber || "-"}</div>
              </div>
              <hr />
              <div className="space-y-1">
                <div className="flex justify-between"><span>Basic Salary</span><span className="font-medium">{formatStoredAmount(payslipDetail.data.basicSalary)}</span></div>
                {(() => { 
                  try { 
                    const data = JSON.parse(payslipDetail.data.allowancesBreakdown || "[]");
                    return Array.isArray(data) ? data : [];
                  } catch { 
                    return []; 
                  } 
                })().map((a: any, i: number) => (
                  <div key={i} className="flex justify-between text-green-600"><span>{a.name || a.allowanceType || a.allowanceName || a.component || "Allowance"}</span><span>+ {formatStoredAmount(a.amount)}</span></div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-1"><span>Gross Pay</span><span>{formatStoredAmount(payslipDetail.data.grossPay)}</span></div>
              </div>
              <div className="space-y-1">
                {(() => { 
                  try { 
                    const data = JSON.parse(payslipDetail.data.deductionsBreakdown || "[]");
                    return Array.isArray(data) ? data : [];
                  } catch { 
                    return []; 
                  } 
                })().map((d: any, i: number) => (
                  <div key={i} className="flex justify-between text-red-600"><span>{d.name || d.deductionType || d.benefitType || d.component || "Deduction"}</span><span>- {formatStoredAmount(d.amount ?? d.cost)}</span></div>
                ))}
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total Deductions</span><span className="text-red-600">{formatStoredAmount(payslipDetail.data.totalDeductions)}</span></div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold">Benefits</p>
                {(() => {
                  try {
                    const benefits = JSON.parse(payslipDetail.data.benefitsBreakdown || "[]");
                    return benefits.length ? benefits.map((benefit: any, index: number) => <div key={index} className="flex justify-between text-emerald-700"><span>{benefit.name || benefit.benefitType || "Benefit"}</span><span>{formatStoredAmount(benefit.amount ?? benefit.cost)}</span></div>) : <p className="text-sm text-muted-foreground">No benefits recorded.</p>;
                  } catch {
                    return <p className="text-sm text-muted-foreground">No benefits recorded.</p>;
                  }
                })()}
              </div>
              <div className="flex justify-between text-lg font-bold bg-muted p-3 rounded-lg">
                <span>Net Pay</span><span>{formatStoredAmount(payslipDetail.data.netPay)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payslips</DialogTitle>
            <DialogDescription>Generate payslips for all active employees for a pay period</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pay Period</label>
              <Input type="month" value={generateForm.payPeriod} onChange={(e) => setGenerateForm(p => ({ ...p, payPeriod: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Pay Date</label>
              <Input type="date" value={generateForm.payDate} onChange={(e) => setGenerateForm(p => ({ ...p, payDate: e.target.value }))} />
            </div>
            <p className="text-sm text-muted-foreground">This will calculate PAYE, NHIF/SHIF, NSSF, and Housing Levy for all active employees using Kenyan tax bands.</p>
            <Button className="w-full" disabled={!generateForm.payPeriod || !generateForm.payDate || generate.isPending} onClick={() => generate.mutate(generateForm)}>
              {generate.isPending ? <Spinner className="mr-2" /> : null} Generate Payslips
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Payslip?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deletePayslip.mutate({ id: deleteId })}>Delete</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ModuleLayout>
  );
}
