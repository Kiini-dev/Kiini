import { useState } from "react";
import { FileText, Download, Eye } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";

export default function MyPayslips() {
  const { formatAmount } = useCurrencySettings();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = trpc.payslips.listMine.useQuery({ limit: 50, offset: 0 });
  const detail = trpc.payslips.getOneForStaff.useQuery({ payslipId: selectedId || "" }, { enabled: !!selectedId });
  const downloadPayslip = trpc.payslips.downloadPayslip.useMutation();

  const open = (html: string) => {
    const windowRef = window.open("", "_blank", "width=900,height=1100");
    if (!windowRef) return;
    windowRef.document.open();
    windowRef.document.write(html);
    windowRef.document.close();
    windowRef.focus();
  };

  return (
    <ModuleLayout title="My Payslips" description="View your generated payslips and download the selected template." icon={<FileText className="h-5 w-5" />}>
      <div className="max-w-5xl space-y-4">
        {isLoading ? <Spinner /> : !data?.payslips?.length ? <Card><CardContent className="py-12 text-center text-muted-foreground">No payslips available.</CardContent></Card> : data.payslips.map((payslip: any) => (
          <Card key={payslip.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div><CardTitle>{payslip.payPeriod}</CardTitle><p className="text-sm text-muted-foreground">Pay date: {payslip.payDate ? new Date(payslip.payDate).toLocaleDateString() : "Not set"}</p></div>
              <Badge variant="outline">{payslip.status}</Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
                <span>Basic: <strong>{formatAmount(Number(payslip.basicSalary || 0))}</strong></span>
                <span>Gross: <strong>{formatAmount(Number(payslip.grossPay || 0))}</strong></span>
                <span>Deductions: <strong>{formatAmount(Number(payslip.totalDeductions || 0))}</strong></span>
                <span>Net: <strong>{formatAmount(Number(payslip.netPay || 0))}</strong></span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedId(payslip.id)}><Eye className="mr-2 h-4 w-4" />View</Button>
                <Button variant="outline" size="sm" onClick={async () => { const result = await downloadPayslip.mutateAsync({ payslipId: payslip.id }); open(result.htmlContent || ""); }} disabled={downloadPayslip.isPending}><Download className="mr-2 h-4 w-4" />Download</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {selectedId && detail.data && <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Rendered Payslip</CardTitle><Button variant="outline" onClick={() => open(detail.data.htmlContent || "")} disabled={!detail.data.htmlContent}><Download className="mr-2 h-4 w-4" />Print / Download</Button></CardHeader><CardContent><iframe title="Rendered payslip" srcDoc={detail.data.htmlContent || ""} className="min-h-[800px] w-full border" /></CardContent></Card>}
      </div>
    </ModuleLayout>
  );
}
