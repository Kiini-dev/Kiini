import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

export function FinancialReportsPage() {
  const [dateRange, setDateRange] = useState('ytd'); // ytd, 12m, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const plQuery = trpc.financialReporting.getPLStatement.useQuery(
    startDate && endDate ? { startDate, endDate } : { startDate: '', endDate: '' },
    { enabled: !(!startDate && !endDate) }
  );

  const cashFlowQuery = trpc.financialReporting.getCashFlowProjection.useQuery();
  const arAgingQuery = trpc.financialReporting.getReceivablesAging.useQuery();
  const arSummaryQuery = trpc.financialReporting.getARSummary.useQuery();

  const pl = plQuery.data;
  const cashFlow = cashFlowQuery.data || [];
  const arAging = arAgingQuery.data || [];
  const arSummary = arSummaryQuery.data || { totalOutstanding: 0, topDebtors: [] };

  // Prepare AR aging chart data
  const arChartData = [
    { bucket: '0-30 days', amount: arAging[0]?.amount || 0 },
    { bucket: '30-60 days', amount: arAging[1]?.amount || 0 },
    { bucket: '60-90 days', amount: arAging[2]?.amount || 0 },
    { bucket: '90-180 days', amount: arAging[3]?.amount || 0 },
    { bucket: '180+ days', amount: arAging[4]?.amount || 0 },
  ].map(item => ({
    ...item,
    amount: item.amount / 100,
  }));

  const cashFlowChartData = (cashFlow || []).map((cf: any) => ({
    month: new Date(cf.month).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }),
    inflows: cf.inflows / 100,
    outflows: cf.outflows / 100,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600">P&L, cash flow, and receivables analysis</p>
      </div>

      {/* P&L Statement */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Profit & Loss Statement</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setDateRange('ytd')}
              className={`px-4 py-2 rounded ${dateRange === 'ytd' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Year to Date
            </button>
            <button
              onClick={() => setDateRange('12m')}
              className={`px-4 py-2 rounded ${dateRange === '12m' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Last 12 Months
            </button>
          </div>
        </div>

        {pl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Metrics */}
            <div className="space-y-4">
              <div className="border rounded p-4">
                <div className="text-gray-600 text-sm">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">Ksh {(pl.revenue / 100).toLocaleString('en-KE')}</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-gray-600 text-sm">Total Expenses</div>
                <div className="text-3xl font-bold text-red-600">Ksh {(pl.expenses / 100).toLocaleString('en-KE')}</div>
              </div>
              <div className="border rounded p-4 bg-blue-50">
                <div className="text-gray-600 text-sm">Net Profit</div>
                <div className={`text-3xl font-bold ${pl.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Ksh {(pl.netProfit / 100).toLocaleString('en-KE')}
                </div>
              </div>
              <div className="border rounded p-4">
                <div className="text-gray-600 text-sm">Profit Margin</div>
                <div className="text-2xl font-bold text-gray-900">{pl.netMarginPercentage?.toFixed(1)}%</div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span>Revenue</span>
                <span className="font-semibold text-green-600">Ksh {(pl.revenue / 100).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>COGS</span>
                <span>Ksh {(pl.cogs / 100).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Gross Profit</span>
                <span className="font-semibold">Ksh {(pl.grossProfit / 100).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Gross Margin</span>
                <span>{pl.grossMarginPercentage?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Operating Expenses</span>
                <span>Ksh {(pl.operatingExpenses / 100).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Operating Profit</span>
                <span className="font-semibold">Ksh {(pl.operatingProfit / 100).toLocaleString('en-KE')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Other Expenses</span>
                <span>Ksh {(pl.otherExpenses / 100).toLocaleString('en-KE')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Projection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">12-Month Cash Flow Projection</h2>
        {cashFlowChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={cashFlowChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `Ksh ${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="inflows" stroke="#10b981" name="Inflows" />
              <Line type="monotone" dataKey="outflows" stroke="#ef4444" name="Outflows" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No projection data available</p>
        )}
      </div>

      {/* AR Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Receivables Aging Analysis</h2>
          {arChartData.some(item => item.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={arChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip formatter={(value: any) => `Ksh ${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No AR data available</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Debtors</h2>
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <div className="text-sm text-gray-600">Total Outstanding</div>
            <div className="text-2xl font-bold text-blue-600">
              Ksh {(arSummary.totalOutstanding / 100).toLocaleString('en-KE')}
            </div>
          </div>
          <div className="space-y-2">
            {(arSummary.topDebtors || []).map((debtor: any, idx: number) => (
              <div key={debtor.clientName || `debtor-${idx}`} className="p-2 border rounded hover:bg-gray-50">
                <div className="font-medium text-sm">{debtor.clientName}</div>
                <div className="text-xs text-gray-600">Ksh {(debtor.amount / 100).toLocaleString('en-KE')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
