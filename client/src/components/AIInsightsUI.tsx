import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, Zap, PieChart, LineChart as LineChartIcon, BarChart3, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsightCard {
  title: string;
  value: string | number;
  change: number;
  status: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

interface AnomalyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
  action?: string;
}

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * AI Insights & Analytics Dashboard
 * Machine learning predictions, anomaly detection, business intelligence
 */
export function AIInsightsUI() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Revenue trend data
  const revenueData = [
    { date: 'Mar 1', revenue: 45000, target: 50000 },
    { date: 'Mar 8', revenue: 52000, target: 50000 },
    { date: 'Mar 15', revenue: 48000, target: 50000 },
    { date: 'Mar 22', revenue: 61000, target: 50000 },
    { date: 'Mar 24', revenue: 58000, target: 50000 },
  ];

  // Subscription distribution
  const subscriptionData = [
    { name: 'Professional', value: 35, fill: '#3b82f6' },
    { name: 'Growth', value: 28, fill: '#8b5cf6' },
    { name: 'Starter', value: 22, fill: '#ec4899' },
    { name: 'Enterprise', value: 15, fill: '#f59e0b' },
  ];

  // Top insights
  const insights: InsightCard[] = [
    {
      title: 'Projected Monthly Revenue',
      value: '$285,000',
      change: 12.5,
      status: 'positive',
      icon: <TrendingUp className="text-green-500" size={24} />,
    },
    {
      title: 'Churn Risk (30 days)',
      value: '2.3%',
      change: -0.8,
      status: 'positive',
      icon: <AlertTriangle className="text-yellow-500" size={24} />,
    },
    {
      title: 'Subscription Expansion',
      value: '+18 upgrades',
      change: 8.2,
      status: 'positive',
      icon: <Zap className="text-blue-500" size={24} />,
    },
    {
      title: 'Payment Failures',
      value: '1.2%',
      change: 0.3,
      status: 'negative',
      icon: <AlertTriangle className="text-red-500" size={24} />,
    },
  ];

  // Anomalies detected
  const anomalies: AnomalyAlert[] = [
    {
      id: '1',
      title: 'Unusual Payment Pattern',
      description: '5 failed payment attempts from same organization in 2 hours',
      severity: 'high',
      timestamp: new Date('2026-03-24T14:30:00'),
      action: 'Investigate',
    },
    {
      id: '2',
      title: 'Storage Usage Spike',
      description: 'Organization "Acme Corp" used 250GB storage (15x normal)',
      severity: 'medium',
      timestamp: new Date('2026-03-24T12:15:00'),
      action: 'Review',
    },
    {
      id: '3',
      title: 'Trial-to-Paid Conversion Rate Drop',
      description: 'Conversion rate down 8% vs 30-day average',
      severity: 'medium',
      timestamp: new Date('2026-03-24T10:45:00'),
      action: 'Analyze',
    },
  ];

  // Predictions
  const predictions: Prediction[] = [
    {
      metric: 'Monthly Recurring Revenue (MRR)',
      current: 245000,
      predicted: 268000,
      confidence: 92,
      trend: 'up',
    },
    {
      metric: 'Customer Acquisition Cost (CAC)',
      current: 450,
      predicted: 435,
      confidence: 87,
      trend: 'down',
    },
    {
      metric: 'Churn Rate',
      current: 2.8,
      predicted: 2.5,
      confidence: 78,
      trend: 'down',
    },
  ];

  // Customer health scores
  const customerHealth = [
    { name: 'Healthy (30+ days left)', value: 68, color: '#10b981' },
    { name: 'At Risk (10-30 days)', value: 18, color: '#f59e0b' },
    { name: 'Critical (<10 days)', value: 8, color: '#ef4444' },
    { name: 'Churned', value: 6, color: '#6b7280' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-500" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights & Analytics</h1>
              <p className="text-gray-600">ML-powered predictions, anomaly detection, and business intelligence</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                  timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                {insight.icon}
                <span
                  className={`text-sm font-semibold ${
                    insight.change > 0
                      ? 'text-green-600 bg-green-50'
                      : insight.change < 0
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-600 bg-gray-50'
                  } px-2 py-1 rounded`}
                >
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{insight.title}</p>
              <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LineChartIcon size={20} />
              Revenue Trend vs Target
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Actual Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#10b981" name="Target" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart size={20} />
              Subscription Distribution
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChartComponent>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChartComponent>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} />
            AI Predictions (Next 30 Days)
          </h2>
          <div className="space-y-4">
            {predictions.map((pred, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{pred.metric}</h3>
                  <div className="flex items-center gap-2">
                    {pred.trend === 'up' ? (
                      <TrendingUp className="text-green-500" size={20} />
                    ) : (
                      <TrendingUp className="text-red-500 transform rotate-180" size={20} />
                    )}
                    <span className="text-sm font-bold text-gray-700">{pred.confidence}% confidence</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Current: <strong>{pred.current.toLocaleString()}</strong></span>
                  <span>→</span>
                  <span>Predicted: <strong className={pred.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{pred.predicted.toLocaleString()}</strong></span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pred.confidence}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-500" />
            Anomaly Alerts ({anomalies.length})
          </h2>
          <div className="space-y-3">
            {anomalies.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{alert.title}</h3>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <p className="text-xs mt-2 opacity-75">{alert.timestamp.toLocaleString()}</p>
                  </div>
                  {alert.action && (
                    <button className="px-3 py-1 bg-white/50 hover:bg-white/75 rounded font-semibold text-sm ml-4">
                      {alert.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Health Score */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Health Distribution</h2>
          <div className="grid grid-cols-4 gap-4">
            {customerHealth.map((health, idx) => (
              <div key={idx} className="text-center">
                <div
                  className="h-24 rounded-lg flex items-center justify-center text-white font-bold mb-2"
                  style={{ backgroundColor: health.color }}
                >
                  {health.value}%
                </div>
                <p className="text-sm text-gray-600">{health.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
