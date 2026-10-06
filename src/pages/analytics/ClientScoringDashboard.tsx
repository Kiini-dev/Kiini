import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter } from 'recharts';
import { AlertCircle, TrendingDown, Target, Zap } from 'lucide-react';

const RISK_COLORS = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444' };

export function ClientScoringDashboard() {
  const [filterRisk, setFilterRisk] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  const allScoresQuery = trpc.clientScoring.getAllClientScores.useQuery();
  const atRiskQuery = trpc.clientScoring.getAtRiskClients.useQuery();
  const highValueQuery = trpc.clientScoring.getHighValueClients.useQuery();
  const churnQuery = trpc.clientScoring.getChurnRiskAnalysis.useQuery();

  const allScores = allScoresQuery.data || [];
  const atRisk = atRiskQuery.data || [];
  const highValue = highValueQuery.data || [];
  const churnAnalysis = churnQuery.data || { distribution: [] };

  // Filter data
  const filteredScores = filterRisk === 'all' 
    ? allScores 
    : allScores.filter((c: any) => c.riskLevel === filterRisk);

  // Score distribution
  const scoreDistribution = [
    { range: '0-20 (Critical)', count: allScores.filter((c: any) => c.score < 20).length },
    { range: '20-40 (Poor)', count: allScores.filter((c: any) => c.score >= 20 && c.score < 40).length },
    { range: '40-60 (Fair)', count: allScores.filter((c: any) => c.score >= 40 && c.score < 60).length },
    { range: '60-80 (Good)', count: allScores.filter((c: any) => c.score >= 60 && c.score < 80).length },
    { range: '80-100 (Excellent)', count: allScores.filter((c: any) => c.score >= 80).length },
  ];

  // Risk distribution pie
  const riskDistribution = [
    { name: 'Excellent (Green)', value: allScores.filter((c: any) => c.riskLevel === 'green').length, fill: '#10b981' },
    { name: 'At Risk (Yellow)', value: allScores.filter((c: any) => c.riskLevel === 'yellow').length, fill: '#f59e0b' },
    { name: 'Critical (Red)', value: allScores.filter((c: any) => c.riskLevel === 'red').length, fill: '#ef4444' },
  ];

  // Churn risk scatter data
  const churnScatterData = allScores.slice(0, 50).map((c: any) => ({
    clientName: c.clientName,
    lifetime: c.lifetimeValue / 100,
    churnRisk: c.churnRisk || 0,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Client Performance Scoring</h1>
        <p className="text-gray-600">Health scores, risk levels, and churn predictions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          label="Total Clients" 
          value={allScores.length} 
          color="blue"
        />
        <KpiCard 
          label="High Value (80+)" 
          value={allScores.filter((c: any) => c.score >= 80).length}
          color="green"
        />
        <KpiCard 
          label="At Risk (Yellow)" 
          value={allScores.filter((c: any) => c.riskLevel === 'yellow').length}
          color="yellow"
        />
        <KpiCard 
          label="Critical (Red)" 
          value={allScores.filter((c: any) => c.riskLevel === 'red').length}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          {riskDistribution.some(r => r.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution.filter(r => r.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        {/* Score Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Client Score Distribution</h2>
          {scoreDistribution.some(s => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        {/* Lifetime Value vs Churn Risk */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Client Lifetime Value vs Churn Risk</h2>
          {churnScatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="churnRisk" name="Churn Risk %" />
                <YAxis type="number" dataKey="lifetime" name="LTV (Ksh)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => value.toLocaleString('en-KE')} />
                <Scatter name="Clients" data={churnScatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Client Scores</h2>
          <div className="flex gap-2">
            {['all', 'green', 'yellow', 'red'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterRisk(level as any)}
                className={`px-3 py-1 rounded text-sm capitalize transition ${
                  filterRisk === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-center">Score</th>
                <th className="px-4 py-2 text-center">Risk Level</th>
                <th className="px-4 py-2 text-center">Churn Risk</th>
                <th className="px-4 py-2 text-right">LTV</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.slice(0, 20).map((client: any) => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{client.clientName}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="inline-block px-3 py-1 rounded-full text-white font-semibold text-sm"
                      style={{backgroundColor: client.score >= 80 ? '#10b981' : client.score >= 60 ? '#f59e0b' : '#ef4444'}}>
                      {client.score}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize`}
                      style={{backgroundColor: RISK_COLORS[client.riskLevel as keyof typeof RISK_COLORS], color: 'white'}}>
                      {client.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{client.churnRisk || 0}%</td>
                  <td className="px-4 py-2 text-right">Ksh {(client.lifetimeValue / 100).toLocaleString('en-KE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredScores.length === 0 && (
            <div className="text-center py-8 text-gray-500">No clients found</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard icon={AlertCircle} title="At Risk Clients" count={atRisk.length} color="red" />
        <ActionCard icon={Target} title="High Value Clients" count={highValue.length} color="green" />
        <ActionCard icon={Zap} title="Total Clients" count={allScores.length} color="blue" />
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color as keyof typeof colors]}`}>{value}</p>
    </div>
  );
}

function ActionCard({ icon: Icon, title, count, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`p-6 rounded-lg cursor-pointer transition hover:shadow-lg ${colors[color as keyof typeof colors]}`}>
      <Icon size={32} className="mb-2" />
      <div className="font-semibold text-lg">{count}</div>
      <div className="text-sm opacity-75">{title}</div>
    </div>
  );
}
