import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Helper to format month string
function formatMonth(month: string) {
  try {
    const dt = new Date(month + "-01");
    return format(dt, "MMM yyyy");
  } catch {
    return month;
  }
}

import { ModuleLayout } from "@/components/ModuleLayout";
import { BarChart3 } from "lucide-react";
import { useCurrencySettings } from "@/lib/currency";
import { ReportAnalyticsPanel } from "@/components/ReportAnalyticsPanel";

const TaxComplianceReportsPage: React.FC = () => {
  const { code: currencyCode } = useCurrencySettings();
  const [from, setFrom] = useState<string>(format(new Date(), "yyyy-MM-01"));
  const [to, setTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const rangeInput = {
    from: new Date(from),
    to: new Date(to),
  };

  const payeQuery = trpc.taxCompliance.getPAYEReport.useQuery(rangeInput, {
    enabled: !!from && !!to,
  });
  const nssfQuery = trpc.taxCompliance.getNSSFReport.useQuery(rangeInput, {
    enabled: !!from && !!to,
  });
  const shifQuery = trpc.taxCompliance.getSHIFReport.useQuery(rangeInput, {
    enabled: !!from && !!to,
  });
  const housingQuery = trpc.taxCompliance.getHousingLevyReport.useQuery(rangeInput, {
    enabled: !!from && !!to,
  });

  const kraExport = trpc.taxCompliance.getKRAFilingFormat.useQuery(rangeInput, {
    enabled: false,
  });

  const ytdQuery = trpc.taxCompliance.getYearToDateSummary.useQuery({}, {
    enabled: !!from && !!to,
  });
  const taxTotals = [
    { key: "paye", label: "PAYE", amountKey: "totalPayee", rows: payeQuery.data || [], color: "border-l-teal-600" },
    { key: "nssf", label: "NSSF", amountKey: "totalNSSF", rows: nssfQuery.data || [], color: "border-l-blue-600" },
    { key: "shif", label: "SHIF", amountKey: "totalSHIF", rows: shifQuery.data || [], color: "border-l-orange-500" },
    { key: "housing", label: "Housing levy", amountKey: "totalHousing", rows: housingQuery.data || [], color: "border-l-emerald-600" },
  ];
  const taxRowsByMonth = new Map<string, { month: string; paye: number; nssf: number; shif: number; housing: number }>();
  taxTotals.forEach(({ key, amountKey, rows }) => {
    rows.forEach((row: any) => {
      const month = String(row.month);
      const data = taxRowsByMonth.get(month) || { month, paye: 0, nssf: 0, shif: 0, housing: 0 };
      data[key as "paye" | "nssf" | "shif" | "housing"] = Number(row[amountKey] || 0) / 100;
      taxRowsByMonth.set(month, data);
    });
  });
  const taxChartData = Array.from(taxRowsByMonth.values()).sort((a, b) => a.month.localeCompare(b.month));
  const taxMetrics = taxTotals.map(({ key, label, amountKey, rows, color }) => ({
    label,
    value: (rows.reduce((sum: number, row: any) => sum + Number(row[amountKey] || 0), 0) / 100).toLocaleString("en-KE", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }),
    description: "Selected period",
    color,
  }));

  const handleExportKRA = () => {
    kraExport.refetch().then((res) => {
      if (res.data) {
        const blob = new Blob([atob(res.data)], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `KRA_Filing_${from}_to_${to}.csv`;
        a.click();
      }
    });
  };

  return (
    <ModuleLayout
      title="Tax Reports"
      description="PAYE, NSSF, SHIF & Housing Levy reports"
      icon={<BarChart3 className="h-6 w-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finance", href: "/accounting" },
        { label: "Tax Reports" },
      ]}
    >
      <div className="p-6">

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">From</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">To</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <Button
            onClick={() => {
              payeQuery.refetch();
              nssfQuery.refetch();
              shifQuery.refetch();
              housingQuery.refetch();
              ytdQuery.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
        <div>
          <Button variant="outline" onClick={handleExportKRA} disabled={kraExport.isFetching}>
            Export KRA Filing
          </Button>
        </div>
      </div>

      <ReportAnalyticsPanel title="Monthly statutory contributions" description={`${from} to ${to}`} categoryKey="month" data={taxChartData} series={[{ dataKey: "paye", label: "PAYE", color: "#0f766e" }, { dataKey: "nssf", label: "NSSF", color: "#2563eb" }, { dataKey: "shif", label: "SHIF", color: "#e8790c" }, { dataKey: "housing", label: "Housing levy", color: "#15803d" }]} metrics={taxMetrics} formatValue={(value) => (value * 100).toLocaleString("en-KE", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 })} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Summary card for YTD totals */}
        <Card>
          <CardHeader>
            <CardTitle>Year-to-Date Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {ytdQuery.isLoading ? (
              <p>Loading...</p>
            ) : ytdQuery.data ? (
              <div className="space-y-1">
                <p>
                  Gross Salary: {(ytdQuery.data.grossSalary / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: currencyCode,
                  })}
                </p>
                <p>
                  PAYE: {(ytdQuery.data.payeeTax / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: currencyCode,
                  })}
                </p>
                <p>
                  NSSF: {(ytdQuery.data.nssfContribution / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: currencyCode,
                  })}
                </p>
                <p>
                  SHIF: {(ytdQuery.data.shifContribution / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: currencyCode,
                  })}
                </p>
                <p>
                  Housing Levy: {(ytdQuery.data.housingLevy / 100).toLocaleString("en-KE", {
                    style: "currency",
                    currency: currencyCode,
                  })}
                </p>
              </div>
            ) : (
              <p>No data</p>
            )}
          </CardContent>
        </Card>

        {/* Table sections */}
        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-2">PAYE Withholdings</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell className="text-right">Total PAYE</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(payeQuery.data) && payeQuery.data.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{formatMonth(row.month)}</TableCell>
                    <TableCell className="text-right">
                      {(row.totalPayee / 100).toLocaleString("en-KE", {
                        style: "currency",
                        currency: currencyCode,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-2">NSSF Contributions</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell className="text-right">Total NSSF</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(nssfQuery.data) && nssfQuery.data.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{formatMonth(row.month)}</TableCell>
                    <TableCell className="text-right">
                      {(row.totalNSSF / 100).toLocaleString("en-KE", {
                        style: "currency",
                        currency: currencyCode,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-2">SHIF Contributions</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell className="text-right">Total SHIF</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(shifQuery.data) && shifQuery.data.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{formatMonth(row.month)}</TableCell>
                    <TableCell className="text-right">
                      {(row.totalSHIF / 100).toLocaleString("en-KE", {
                        style: "currency",
                        currency: currencyCode,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="col-span-full">
          <h2 className="text-xl font-semibold mb-2">Housing Levy</h2>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell className="text-right">Total Housing Levy</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(housingQuery.data) && housingQuery.data.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{formatMonth(row.month)}</TableCell>
                    <TableCell className="text-right">
                      {(row.totalHousing / 100).toLocaleString("en-KE", {
                        style: "currency",
                        currency: currencyCode,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      </div> {/* wrapper close */}
    </ModuleLayout>
  );
};

export default TaxComplianceReportsPage;
