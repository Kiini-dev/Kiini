import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { downloadPayslipPdf, payslipSlug } from "@/lib/payslipPdf";
import { toast } from "sonner";

export default function PayslipDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { formatAmount } = useCurrencySettings();
  const { data: payslip, isLoading } = trpc.payslips.getAccessible.useQuery({ id: id || "" }, { enabled: !!id });
  const download = async () => {
    if (!payslip?.htmlContent) return;
    try {
      const period = String(payslip.payPeriod || "period");
      await downloadPayslipPdf(payslip.htmlContent, `${payslipSlug(period, payslip.firstName, payslip.lastName)}.pdf`);
    } catch (error) {
      console.error("Failed to generate payslip PDF", error);
      toast.error("Failed to generate payslip PDF");
    }
  };

  if (isLoading) return <ModuleLayout title="Payslip Details"><Spinner /></ModuleLayout>;
  if (!payslip) return <ModuleLayout title="Payslip Details" backLink={{ label: "Payslips", href: "/payslips" }}><p>Payslip not found.</p></ModuleLayout>;

  const formatStoredAmount = (value: unknown) => formatAmount(Number(value || 0));
  const parseItems = (value: unknown): any[] => {
    if (Array.isArray(value)) return value;
    try { return value ? JSON.parse(String(value)) : []; } catch { return []; }
  };
  const allowances = parseItems(payslip.allowancesBreakdown);
  const deductionItems = parseItems(payslip.deductionsBreakdown);
  const benefits = parseItems(payslip.benefitsBreakdown);
  const deductions = deductionItems.filter((item) => item.type !== "benefit");
  const statutory = deductions.filter((item) => item.type === "statutory" || /paye|nssf|shif|nhif|housing|pension/i.test(item.name || item.component || ""));
  const nssfTier1 = statutory.find((item) => /nssf.*tier\s*1/i.test(item.name || ""));
  const nssfTier2 = statutory.find((item) => /nssf.*tier\s*2/i.test(item.name || ""));
  const statutoryDetail = [
    nssfTier1 && { name: "NSSF Tier 1", amount: nssfTier1.amount, description: "6% of pensionable earnings within Tier 1" },
    nssfTier2 && { name: "NSSF Tier 2", amount: nssfTier2.amount, description: "6% of pensionable earnings within Tier 2" },
    ...statutory.filter((item) => item !== nssfTier1 && item !== nssfTier2),
  ].filter(Boolean) as any[];

  const rows = [
    ["Basic Salary", payslip.basicSalary],
    ["Gross Pay", payslip.grossPay || payslip.grossSalary],
    ["Total Deductions", payslip.totalDeductions],
    ["Net Pay", payslip.netPay || payslip.netSalary],
  ];

  return (
    <ModuleLayout
      title={`Payslip ${String(payslip.payPeriod || "").split("-").reverse().join("-")}`}
      description={`${payslip.firstName || "Employee"} ${payslip.lastName || ""} | ${payslip.payPeriod || ""}`}
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[{ label: "HR", href: "/hr" }, { label: "Payslips", href: "/payslips" }, { label: "Details" }]}
      backLink={{ label: "Payslips", href: "/payslips" }}
      actions={<Button onClick={download} disabled={!payslip.htmlContent}><Download className="mr-2 h-4 w-4" />Download</Button>}
    >
      <div className="grid max-w-[1600px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.9fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Payslip Summary</CardTitle><Badge>{payslip.status}</Badge></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Employee</span><p className="font-medium">{payslip.firstName} {payslip.lastName}</p></div>
              <div><span className="text-muted-foreground">Employee Number</span><p className="font-medium">{payslip.employeeNumber}</p></div>
              <div><span className="text-muted-foreground">Department</span><p className="font-medium">{payslip.department || "-"}</p></div>
              <div><span className="text-muted-foreground">Pay Period</span><p className="font-medium">{payslip.payPeriod || "-"}</p></div>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Payroll Values</CardTitle></CardHeader><CardContent className="space-y-3">
            {rows.map(([label, value]) => <div key={label} className="flex justify-between border-b pb-2"><span>{label}</span><span className="font-semibold">{formatStoredAmount(value)}</span></div>)}
          </CardContent></Card>
            <BreakdownCard title="Earnings & Allowances" items={[{ name: "Basic Salary", amount: payslip.basicSalary }, ...allowances]} total={Number(payslip.grossPay || payslip.grossSalary || 0)} tone="text-green-700" formatAmount={formatStoredAmount} />
            <BreakdownCard title="Deductions & Statutory" items={deductions} total={Number(payslip.totalDeductions || 0)} tone="text-red-700" formatAmount={formatStoredAmount} />
            <BreakdownCard title="Statutory Calculation Detail" items={statutoryDetail} total={statutoryDetail.reduce((sum, item) => sum + Number(item.amount ?? item.cost ?? 0), 0)} tone="text-orange-700" formatAmount={formatStoredAmount} />
            <BreakdownCard title="Benefits" items={benefits} total={benefits.reduce((sum, item) => sum + Number(item.amount ?? item.cost ?? 0), 0)} tone="text-emerald-700" formatAmount={formatStoredAmount} />
        </div>
        {payslip.htmlContent && <Card className="lg:sticky lg:top-4"><CardHeader><CardTitle>Rendered Payslip Template</CardTitle></CardHeader><CardContent><iframe title="Rendered payslip" srcDoc={payslip.htmlContent} className="h-[calc(100vh-10rem)] min-h-[720px] w-full border" /></CardContent></Card>}
      </div>
    </ModuleLayout>
  );
}

function BreakdownCard({ title, items, total, tone, formatAmount }: { title: string; items: any[]; total: number; tone: string; formatAmount: (value: unknown) => string }) {
  return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="space-y-2">{items.length ? items.map((item, index) => <div key={`${item.name || item.type || item.component}-${index}`} className={`flex justify-between border-b pb-2 text-sm ${tone}`}><span>{item.name || item.allowanceType || item.allowanceName || item.deductionType || item.benefitType || item.component || "Item"}</span><span>{formatAmount(item.amount ?? item.cost)}</span></div>) : <p className="text-sm text-muted-foreground">No items recorded.</p>}<div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total</span><span>{formatAmount(total)}</span></div></CardContent></Card>;
}
