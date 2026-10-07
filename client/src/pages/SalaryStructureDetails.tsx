import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Edit, FileText, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/utils/format";

export default function SalaryStructureDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: structures = [], isLoading } = trpc.payroll.salaryStructures.list.useQuery({});
  const structure = structures.find((item: any) => item.id === id) as any;
  const { data: payrollRows = [] } = trpc.payroll.list.useQuery({ limit: 5000, offset: 0 });
  const employeeId = structure?.employeeId || "";
  const { data: employees = [] } = trpc.employees.list.useQuery({});
  const employee = (employees as any[]).find((item: any) => item.id === employeeId);
  const { data: allowances = [] } = trpc.payroll.allowances.byEmployee.useQuery({ employeeId }, { enabled: !!employeeId });
  const { data: deductions = [] } = trpc.payroll.deductions.byEmployee.useQuery({ employeeId }, { enabled: !!employeeId });
  const { data: benefits = [] } = trpc.payroll.benefits.byEmployee.useQuery({ employeeId }, { enabled: !!employeeId });

  if (isLoading) return <ModuleLayout title="Salary Structure Details"><Spinner /></ModuleLayout>;
  if (!structure) return <ModuleLayout title="Salary Structure Details" backLink={{ label: "Payroll", href: "/payroll" }}><p>Salary structure not found.</p></ModuleLayout>;

  const employeeName = employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : employeeId;
  const rows = [
    ["Basic salary", structure.basicSalary],
    ["Total allowances", structure.allowances],
    ["Total deductions", structure.deductions],
  ];
  const nextStructureStart = (structures as any[])
    .filter((item: any) => item.employeeId === employeeId && new Date(item.effectiveDate).getTime() > new Date(structure.effectiveDate).getTime())
    .reduce((soonest: number | null, item: any) => {
      const time = new Date(item.effectiveDate).getTime();
      return soonest === null || time < soonest ? time : soonest;
    }, null);
  const structurePayroll = (payrollRows as any[]).filter((record: any) => {
    if (record.employeeId !== employeeId || !record.payPeriodStart) return false;
    const period = new Date(record.payPeriodStart).getTime();
    return period >= new Date(structure.effectiveDate).getTime() && (nextStructureStart === null || period < nextStructureStart);
  });
  const trackedTotals = structurePayroll.reduce((totals: any, record: any) => ({
    basicSalary: totals.basicSalary + Number(record.basicSalary || 0),
    allowances: totals.allowances + Number(record.allowances || 0),
    deductions: totals.deductions + Number(record.deductions || 0),
    netSalary: totals.netSalary + Number(record.netSalary || 0),
  }), { basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0 });

  return (
    <ModuleLayout
      title="Salary Structure Details"
      description={`${employeeName} | Effective ${new Date(structure.effectiveDate).toLocaleDateString()}`}
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[{ label: "HR", href: "/hr" }, { label: "Payroll", href: "/payroll" }, { label: "Salary Structures", href: "/payroll/salary-structures" }, { label: "Details" }]}
      backLink={{ label: "Salary Structures", href: "/payroll/salary-structures" }}
      actions={<Button variant="outline" onClick={() => navigate(`/salary-structures/${id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</Button>}
    >
      <div className="max-w-5xl space-y-6">
        <Card>
          <CardHeader><CardTitle>{employeeName}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-sm text-muted-foreground">Employee number</p><p className="font-medium">{employee?.employeeNumber || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Department</p><p className="font-medium">{employee?.department || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Position</p><p className="font-medium">{employee?.position || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Tax rate</p><p className="font-medium">{(Number(structure.taxRate || 0) / 100).toFixed(2)}%</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Structure Values</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {rows.map(([label, value]) => <div key={label as string} className="rounded-md border p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-xl font-semibold">{formatCurrency(Number(value || 0) / 100)}</p></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll totals for this structure</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(trackedTotals).map(([label, value]) => (
                <div key={label} className="rounded-md border p-4">
                  <p className="text-sm capitalize text-muted-foreground">{label.replace(/([A-Z])/g, " $1")}</p>
                  <p className="text-lg font-semibold">{formatCurrency(Number(value) / 100)}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{structurePayroll.length} payroll record(s) since this structure became effective.</p>
            <Table>
              <TableHeader><TableRow><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Basic</TableHead><TableHead className="text-right">Allowances</TableHead><TableHead className="text-right">Deductions</TableHead><TableHead className="text-right">Net pay</TableHead></TableRow></TableHeader>
              <TableBody>
                {structurePayroll.length ? structurePayroll.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.payPeriodStart).toLocaleDateString()} – {record.payPeriodEnd ? new Date(record.payPeriodEnd).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="capitalize">{record.status}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(record.basicSalary || 0) / 100)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(record.allowances || 0) / 100)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(record.deductions || 0) / 100)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(record.netSalary || 0) / 100)}</TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={6} className="py-6 text-center text-muted-foreground">No payroll history in this effective period.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <CompensationCard title="Allowances" items={allowances as any[]} nameKey="allowanceType" amountKey="amount" onAdd={() => navigate(`/allowances/create?employeeId=${employeeId}`)} onEdit={(item) => navigate(`/allowances/${item.id}/edit`)} />
          <CompensationCard title="Deductions" items={deductions as any[]} nameKey="deductionType" amountKey="amount" onAdd={() => navigate(`/deductions/create?employeeId=${employeeId}`)} onEdit={(item) => navigate(`/deductions/${item.id}/edit`)} />
          <CompensationCard title="Benefits" items={benefits as any[]} nameKey="benefitType" amountKey="cost" onAdd={() => navigate(`/benefits/create?employeeId=${employeeId}`)} onEdit={(item) => navigate(`/benefits/${item.id}/edit`)} />
        </div>
        {structure.notes && <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><RichTextDisplay html={structure.notes} /></CardContent></Card>}
      </div>
    </ModuleLayout>
  );
}

function CompensationCard({ title, items, nameKey, amountKey, onAdd, onEdit }: { title: string; items: any[]; nameKey: string; amountKey: string; onAdd: () => void; onEdit: (item: any) => void }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">{title}</CardTitle><Button size="icon" variant="ghost" onClick={onAdd} title={`Add ${title}`}><Plus className="h-4 w-4" /></Button></CardHeader><CardContent className="space-y-3">{items.length ? items.map((item) => <div key={item.id} className="flex items-center justify-between border-b pb-2 text-sm"><div><p className="font-medium">{item[nameKey] || "-"}</p><p className="text-xs text-muted-foreground">{item.frequency || item.provider || ""}</p></div><Button size="icon" variant="ghost" onClick={() => onEdit(item)}><Edit className="h-3.5 w-3.5" /></Button><span>{formatCurrency(Number(item[amountKey] || 0) / 100)}</span></div>) : <p className="text-sm text-muted-foreground">None configured.</p>}</CardContent></Card>;
}
