import { TrendingUp, Loader2 } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReportNavigation } from "@/components/ReportNavigation";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";

export default function MarginTracking() {
  const today = new Date().toISOString().slice(0, 10);
  const plQuery = trpc.financialReports.profitLoss.useQuery({ startDate: `${today.slice(0, 4)}-01-01`, endDate: today });
  const bsQuery = trpc.financialReports.balanceSheet.useQuery({} as any);

  const plData = plQuery.data as any;
  const bsData = bsQuery.data;

  const isLoading = plQuery.isLoading || bsQuery.isLoading;
  const error = plQuery.error || bsQuery.error;

  return (
    <ModuleLayout
      title="Margin Tracking"
      icon={<TrendingUp className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Finance" },
        { label: "Margin Tracking" },
      ]}
    >
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <ReportNavigation active="/finance/reports" />
      <div className="min-w-0 space-y-4">
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">Error: {error.message}</div>
      )}

      {!isLoading && !error && (
        <>
          <ReportAnalyticsPanel
            title="Year-to-date margin performance"
            description={`January 1 through ${today}`}
            categoryKey="metric"
            data={[
              { metric: "Revenue", amount: Number(plData?.revenue || 0) },
              { metric: "Other income", amount: Number(plData?.otherIncome || 0) },
              { metric: "Expenses", amount: Number(plData?.expenses || 0) },
              { metric: "Net profit", amount: Number(plData?.netProfit || 0) },
            ]}
            series={[{ dataKey: "amount", label: "Amount", color: "#0f766e" }]}
            formatValue={(amount) => `Ksh ${(amount / 100).toLocaleString("en-KE")}`}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{plData?.totalRevenue ?? plData?.revenue ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">{plData?.totalExpenses ?? plData?.expenses ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold">{plData?.netProfit ?? plData?.profit ?? "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600">Margin %</p>
                <p className="text-2xl font-bold">
                  {plData?.margin ?? plData?.profitMargin ?? "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit &amp; Loss Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {plData?.items || plData?.lineItems ? (
                <div className="space-y-2">
                  {(plData.items ?? plData.lineItems ?? []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 border-b text-sm">
                      <span>{item.name ?? item.category ?? "—"}</span>
                      <span className="font-medium">{item.amount ?? item.value ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Profit/loss detail not available.</p>
              )}
            </CardContent>
          </Card>

          {bsData && (
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {Object.entries(bsData.summary || {}).map(([type, balance]) => <div key={type}><p className="capitalize text-gray-600">{type}</p><p className="text-xl font-bold">Ksh {(Number(balance) / 100).toLocaleString("en-KE")}</p></div>)}
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Code</th><th className="p-2">Account</th><th className="p-2">Type</th><th className="p-2 text-right">Balance</th></tr></thead><tbody>{(bsData.accounts || []).map((account) => <tr key={account.id} className="border-b"><td className="p-2 font-mono">{account.code}</td><td className="p-2">{account.name}</td><td className="p-2 capitalize">{account.type}</td><td className="p-2 text-right">Ksh {(Number(account.balance) / 100).toLocaleString("en-KE")}</td></tr>)}</tbody></table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
      </div>
      </div>
    </ModuleLayout>
  );
}
