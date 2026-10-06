import React from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '@/utils/trpc';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, AlertTriangle, Clock, Target } from 'lucide-react';

export function MainDashboard() {
  const navigate = useNavigate();

  // Query multiple data sources for dashboard
  const projectsQuery = trpc.projectAnalytics.getAllProjectAnalytics.useQuery();
  const clientsQuery = trpc.clientScoring.getAllClientScores.useQuery();
  const financialsQuery = trpc.financialReporting.getPLStatement.useQuery({ startDate: '', endDate: '' });
  const expensesQuery = trpc.expenses.getReports.useQuery();

  const projects = projectsQuery.data || [];
  const clients = clientsQuery.data || [];
  const expenses = expensesQuery.data || [];

  // Calculate KPIs
  const kpis = {
    activeProjects: projects.filter((p: any) => p.status === 'active').length,
    totalRevenue: projects.reduce((sum: number, p: any) => sum + (p.revenue || 0), 0) / 100,
    teamSize: new Set(projects.flatMap((p: any) => p.teamMembers || [])).size,
    atRiskClients: clients.filter((c: any) => c.riskLevel === 'red').length,
    pendingExpenses: expenses.filter((e: any) => e.status !== 'reimbursed').length,
    pendingExpenseAmount: expenses
      .filter((e: any) => e.status !== 'reimbursed')
      .reduce((sum: number, e: any) => sum + (e.totalAmount || 0), 0) / 100,
  };

  // Recent projects
  const recentProjects = projects.slice(0, 5).map((p: any) => ({
    name: p.projectName.substring(0, 20),
    completion: p.completionPercentage,
    risk: p.riskLevel,
  }));

  // Client health distribution
  const clientHealth = [
    { name: 'Excellent', count: clients.filter((c: any) => c.score >= 80).length },
    { name: 'Good', count: clients.filter((c: any) => c.score >= 60 && c.score < 80).length },
    { name: 'Fair', count: clients.filter((c: any) => c.score >= 40 && c.score < 60).length },
    { name: 'At Risk', count: clients.filter((c: any) => c.score < 40).length },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your consolidated view.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          icon={Clock}
          label="Active Projects"
          value={kpis.activeProjects}
          color="blue"
          onClick={() => navigate('/analytics/projects')}
        />
        <KpiCard
          icon={DollarSign}
          label="Total Revenue"
          value={`Ksh ${kpis.totalRevenue.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
          color="green"
        />
        <KpiCard
          icon={Users}
          label="Team Size"
          value={kpis.teamSize}
          color="blue"
          onClick={() => navigate('/team/performance')}
        />
        <KpiCard
          icon={AlertTriangle}
          label="At Risk Clients"
          value={kpis.atRiskClients}
          color="red"
          onClick={() => navigate('/analytics/clients')}
        />
        <KpiCard
          icon={Target}
          label="Pending Expenses"
          value={kpis.pendingExpenses}
          color="yellow"
          onClick={() => navigate('/expenses')}
        />
        <KpiCard
          icon={TrendingUp}
          label="Expense Amount"
          value={`Ksh ${kpis.pendingExpenseAmount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActionButton
          title="View Projects"
          icon={TrendingUp}
          onClick={() => navigate('/analytics/projects')}
        />
        <ActionButton
          title="Financial Reports"
          icon={DollarSign}
          onClick={() => navigate('/finance/reports')}
        />
        <ActionButton
          title="Team Performance"
          icon={Users}
          onClick={() => navigate('/team/performance')}
        />
        <ActionButton
          title="Expense Management"
          icon={AlertTriangle}
          onClick={() => navigate('/expenses')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} /> Recent Projects
          </h2>
          {recentProjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recentProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Bar dataKey="completion" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No project data</p>
          )}
        </div>

        {/* Client Health */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} /> Client Health Distribution
          </h2>
          {clientHealth.some(c => c.count > 0) ? (
            <div className="space-y-3">
              {clientHealth.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.name === 'Excellent'
                          ? 'bg-green-500'
                          : item.name === 'Good'
                          ? 'bg-blue-500'
                          : item.name === 'Fair'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(item.count / Math.max(1, ...clientHealth.map(c => c.count))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No client data</p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Projects by Status"
          data={[
            { label: 'Active', value: projects.filter((p: any) => p.status === 'active').length },
            { label: 'Planning', value: projects.filter((p: any) => p.status === 'planning').length },
            { label: 'Completed', value: projects.filter((p: any) => p.status === 'completed').length },
          ]}
        />
        <SummaryCard
          title="Risk Distribution"
          data={[
            { label: 'Low Risk', value: projects.filter((p: any) => p.riskLevel === 'low').length },
            { label: 'Medium Risk', value: projects.filter((p: any) => p.riskLevel === 'medium').length },
            { label: 'High Risk', value: projects.filter((p: any) => p.riskLevel === 'high').length },
          ]}
        />
        <SummaryCard
          title="Expense Status"
          data={[
            { label: 'Pending', value: expenses.filter((e: any) => e.status === 'submitted').length },
            { label: 'Approved', value: expenses.filter((e: any) => e.status === 'approved').length },
            { label: 'Reimbursed', value: expenses.filter((e: any) => e.status === 'reimbursed').length },
          ]}
        />
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, onClick }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-lg ${colors[color]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-75 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon size={32} opacity={0.3} />
      </div>
    </div>
  );
}

function ActionButton({ title, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500"
    >
      <Icon size={32} className="text-blue-600 mb-2 mx-auto" />
      <p className="font-medium text-gray-900">{title}</p>
    </button>
  );
}

function SummaryCard({ title, data }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item: any, idx: number) => (
          <div key={item.id || `stat-${idx}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
