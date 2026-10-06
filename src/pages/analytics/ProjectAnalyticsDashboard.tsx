import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Clock, Users } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export function ProjectAnalyticsDashboard() {
  const [selectedRisk, setSelectedRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const allProjectsQuery = trpc.projectAnalytics.getAllProjectAnalytics.useQuery();
  const profitabilityQuery = trpc.projectAnalytics.getProfitabilityAnalysis.useQuery();
  const riskProjectsQuery = trpc.projectAnalytics.getProjectsByRisk.useQuery({ riskLevel: selectedRisk });

  const projects = allProjectsQuery.data || [];
  const profitability = profitabilityQuery.data || [];
  const riskProjects = riskProjectsQuery.data || [];

  // Calculate summary stats
  const stats = {
    total: projects.length,
    active: projects.filter((p: any) => p.status === 'active').length,
    avgCompletion: Math.round(projects.reduce((sum: number, p: any) => sum + (p.completionPercentage || 0), 0) / (projects.length || 1)),
    atRisk: projects.filter((p: any) => p.riskLevel === 'high').length,
  };

  // Prepare profitability chart data
  const profitChartData = profitability.slice(0, 10).map((p: any) => ({
    name: p.projectName.substring(0, 15),
    profit: p.profit / 100,
    revenue: p.revenue / 100,
  }));

  // Risk distribution
  const riskDistribution = [
    { name: 'Low', value: projects.filter((p: any) => p.riskLevel === 'low').length },
    { name: 'Medium', value: projects.filter((p: any) => p.riskLevel === 'medium').length },
    { name: 'High', value: projects.filter((p: any) => p.riskLevel === 'high').length },
  ];

  // Completion status
  const completionData = [
    { name: '0-25%', value: projects.filter((p: any) => (p.completionPercentage || 0) <= 25).length },
    { name: '25-50%', value: projects.filter((p: any) => (p.completionPercentage || 0) > 25 && (p.completionPercentage || 0) <= 50).length },
    { name: '50-75%', value: projects.filter((p: any) => (p.completionPercentage || 0) > 50 && (p.completionPercentage || 0) <= 75).length },
    { name: '75-100%', value: projects.filter((p: any) => (p.completionPercentage || 0) > 75).length },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Analytics</h1>
        <p className="text-gray-600">Monitor project performance and profitability</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Projects" value={stats.total} color="blue" />
        <StatCard icon={Clock} label="Active Projects" value={stats.active} color="green" />
        <StatCard icon={DollarSign} label="Avg Completion" value={`${stats.avgCompletion}%`} color="yellow" />
        <StatCard icon={AlertCircle} label="At Risk" value={stats.atRisk} color="red" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Projects by Profitability</h2>
          {profitChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `Ksh ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution</h2>
          {riskDistribution.some(r => r.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No projects</p>
          )}
        </div>

        {/* Completion Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Project Completion Status</h2>
          {completionData.some(c => c.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No projects</p>
          )}
        </div>

        {/* Risk Filter and List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Projects by Risk Level</h2>
          <div className="flex gap-2 mb-4">
            {['all', 'low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedRisk(level as any)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize transition ${
                  selectedRisk === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {riskProjects.length > 0 ? (
              riskProjects.map((project: any) => (
                <div key={project.id} className="p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium text-sm">{project.projectName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Progress: {project.completionPercentage}% | Status: {project.status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No projects found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}
