import React, { useState } from 'react';
import { Shield, Activity, AlertCircle, CheckCircle, Lock, Users, Key, Clock } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  details: string;
  ipAddress: string;
}

interface ComplianceChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'at-risk';
  dueDate: Date;
  responsible: string;
  evidenceFile?: string;
}

/**
 * Security & Compliance Dashboard
 * Audit logs, compliance checklists, security settings
 */
export function SecurityComplianceUI() {
  const [activeTab, setActiveTab] = useState<'audit' | 'compliance' | 'security'>('audit');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  const auditLogs: AuditLog[] = [
    {
      id: '1',
      action: 'User Login',
      user: 'john@example.com',
      timestamp: new Date('2026-03-24T14:30:00'),
      status: 'success',
      details: 'Successful login from Nairobi, Kenya',
      ipAddress: '196.3.97.45',
    },
    {
      id: '2',
      action: 'Invoice Generated',
      user: 'jane@example.com',
      timestamp: new Date('2026-03-24T13:15:00'),
      status: 'success',
      details: 'Auto-generated renewal invoice for Org-123',
      ipAddress: '196.3.97.46',
    },
    {
      id: '3',
      action: 'Failed Login Attempt',
      user: 'unknown',
      timestamp: new Date('2026-03-24T12:50:00'),
      status: 'warning',
      details: '3 failed attempts from new IP address',
      ipAddress: '185.220.101.45',
    },
    {
      id: '4',
      action: 'Permission Changed',
      user: 'admin@example.com',
      timestamp: new Date('2026-03-24T11:20:00'),
      status: 'success',
      details: 'Revoked billing:edit permission from user david@org.com',
      ipAddress: '196.3.97.47',
    },
    {
      id: '5',
      action: 'Data Export',
      user: 'manager@example.com',
      timestamp: new Date('2026-03-24T10:15:00'),
      status: 'error',
      details: 'Unauthorized export attempt blocked',
      ipAddress: '196.3.97.48',
    },
  ];

  const complianceItems: ComplianceChecklistItem[] = [
    {
      id: '1',
      title: 'Data Retention Policy',
      description: 'Implement 7-year data retention policy per tax requirements',
      status: 'completed',
      dueDate: new Date('2026-03-31'),
      responsible: 'John Doe',
      evidenceFile: 'policy_v2_signed.pdf',
    },
    {
      id: '2',
      title: 'GDPR Compliance',
      description: 'Implement privacy policies and data subject request handlers',
      status: 'in-progress',
      dueDate: new Date('2026-04-30'),
      responsible: 'Jane Smith',
    },
    {
      id: '3',
      title: 'ISO 27001 Audit',
      description: 'Complete annual information security audit',
      status: 'pending',
      dueDate: new Date('2026-06-30'),
      responsible: 'Security Team',
    },
    {
      id: '4',
      title: 'Access Control Review',
      description: 'Quarterly review of user access permissions',
      status: 'in-progress',
      dueDate: new Date('2026-03-31'),
      responsible: 'Admin Team',
    },
    {
      id: '5',
      title: 'Incident Response Plan',
      description: 'Document and test incident response procedures',
      status: 'at-risk',
      dueDate: new Date('2026-03-28'),
      responsible: 'Compliance Officer',
    },
  ];

  const securitySettings = [
    {
      icon: Lock,
      title: 'Multi-Factor Authentication',
      description: 'Enforce 2FA for all users',
      enabled: true,
      detail: '87% of users have 2FA enabled',
    },
    {
      icon: Key,
      title: 'API Keys',
      description: 'Manage organization API keys',
      enabled: true,
      detail: '12 active keys, 2 inactive',
    },
    {
      icon: Clock,
      title: 'Session Timeout',
      description: 'Auto-logout after 30 minutes of inactivity',
      enabled: true,
      detail: '30 minutes',
    },
    {
      icon: Users,
      title: 'IP Whitelist',
      description: 'Restrict access by IP address range',
      enabled: false,
      detail: 'Not configured',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => filterSeverity === 'all' || log.status === filterSeverity);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      default:
        return <Activity size={20} className="text-gray-500" />;
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'at-risk':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Shield className="text-blue-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
            <p className="text-gray-600">Monitor audit logs, compliance status, and security settings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex">
        {(['audit', 'compliance', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-semibold border-b-2 transition capitalize ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div>
            <div className="flex gap-4 mb-6">
              {(['all', 'success', 'warning', 'error'] as const).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(severity)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition ${
                    filterSeverity === severity
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{log.action}</h3>
                        <span className="text-sm text-gray-500">{log.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{log.details}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>User: {log.user}</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Compliance Score: <strong>78/100</strong> • Next Audit: June 30, 2026
              </p>
            </div>

            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>Responsible: {item.responsible}</span>
                        <span>Due: {item.dueDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getComplianceStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                      {item.evidenceFile && (
                        <span className="text-xs text-blue-500 cursor-pointer hover:underline">{item.evidenceFile}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securitySettings.map((setting, idx) => {
              const Icon = setting.icon;
              return (
                <div key={idx} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon size={24} className="text-gray-400" />
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      setting.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {setting.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{setting.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{setting.description}</p>
                  <p className="text-sm text-gray-500">{setting.detail}</p>
                  <button className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold">
                    Configure
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
