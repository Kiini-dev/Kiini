import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronRight, Download, Upload } from 'lucide-react';

interface Permission {
  module: string;
  action: string;
}

interface RolePermissions {
  role: string;
  permissions: Record<string, boolean>; // "module:action" -> granted
}

interface PermissionMatrixProps {
  organizationId: string;
  role?: string; // If set, show permissions for specific role
  userId?: string; // If set, show permissions for specific user
}

/**
 * Permission Matrix Component
 * Allows super-admins to configure granular permissions for users/roles
 * Shows a matrix of modules × actions with toggle controls
 */
export default function PermissionMatrix({
  organizationId,
  role,
  userId,
}: PermissionMatrixProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(['accounting', 'invoicing', 'hr', 'crm'])
  );
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  // Define available modules and their actions
  const moduleActions: Record<string, string[]> = {
    accounting: ['view', 'create_entry', 'edit_entry', 'delete_entry', 'approve', 'export'],
    invoicing: ['view', 'create', 'edit', 'delete', 'send', 'mark_paid', 'create_credit_note'],
    payments: ['view', 'record_payment', 'refund', 'reconcile', 'export'],
    crm: ['view', 'create_client', 'edit_client', 'delete_client', 'manage_opportunities', 'export'],
    hr: ['view', 'manage_employees', 'view_salary', 'edit_salary', 'approve_leave', 'export'],
    payroll: ['view', 'process_payroll', 'generate_payslip', 'send_payslip', 'export'],
    projects: ['view', 'create_project', 'edit_project', 'delete_project', 'manage_tasks', 'export'],
    procurement: ['view', 'create_lpo', 'edit_lpo', 'approve_lpo', 'manage_suppliers', 'export'],
    reports: ['view', 'generate_report', 'schedule_report', 'share_report', 'export'],
    communications: ['view', 'send_message', 'bulk_actions', 'manage_templates', 'export'],
    ai_insights: ['view', 'export_insights', 'configure_alerts', 'export'],
    security: ['view', 'manage_users', 'audit_logs', 'export_logs'],
  };

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        // TODO: Call API to fetch permissions
        // const result = await trpc.multiTenancy.getUserPermissions.query({ organizationId, userId });

        // For now, initialize with some default permissions
        const defaultPerms: Record<string, boolean> = {};
        Object.entries(moduleActions).forEach(([module, actions]) => {
          actions.forEach((action) => {
            defaultPerms[`${module}:${action}`] = Math.random() > 0.5;
          });
        });

        setPermissions(defaultPerms);
        setLoading(false);
      } catch (error) {
        console.error('Error loading permissions:', error);
        setLoading(false);
      }
    };

    loadPermissions();
  }, [organizationId, userId]);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const togglePermission = (module: string, action: string, value: boolean) => {
    const key = `${module}:${action}`;
    const newPermissions = { ...permissions, [key]: value };
    setPermissions(newPermissions);
    setChanged(true);
  };

  const toggleModuleAll = (module: string, value: boolean) => {
    const newPermissions = { ...permissions };
    moduleActions[module].forEach((action) => {
      newPermissions[`${module}:${action}`] = value;
    });
    setPermissions(newPermissions);
    setChanged(true);
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      // TODO: Call API to save permissions
      // await trpc.multiTenancy.grantPermission.mutate({ organizationId, userId, ...permissions });

      console.log('Saving permissions:', permissions);
      setChanged(false);
      setSaving(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setSaving(false);
    }
  };

  const exportPermissions = () => {
    const data = {
      organizationId,
      role,
      userId,
      permissions,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permissions-${organizationId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getModuleStats = (module: string) => {
    const actions = moduleActions[module];
    const granted = actions.filter((a) => permissions[`${module}:${a}`]).length;
    return `${granted}/${actions.length}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Matrix</h2>
          <p className="text-gray-600 mt-1">
            {userId ? `Configure permissions for user` : `Configure permissions for role: ${role}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPermissions}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button
            disabled={!changed || saving}
            onClick={savePermissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-8 p-4 bg-blue-50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-green-600" />
          <span>Permission Granted</span>
        </div>
        <div className="flex items-center gap-2">
          <X size={18} className="text-gray-400" />
          <span>Permission Denied</span>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-4">
        {Object.entries(moduleActions).map(([module, actions]) => {
          const isExpanded = expandedModules.has(module);
          const stats = getModuleStats(module);

          return (
            <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between font-semibold text-gray-900 transition"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-600" />
                  )}
                  <div className="capitalize">{module.replace('_', ' ')}</div>
                  <span className="text-sm text-gray-600 ml-2">({stats} granted)</span>
                </div>

                {/* Toggle All Button */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModuleAll(
                        module,
                        !actions.every((a) => permissions[`${module}:${a}`])
                      );
                    }}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {actions.every((a) => permissions[`${module}:${a}`]) ? 'Revoke All' : 'Grant All'}
                  </button>
                </div>
              </button>

              {/* Actions */}
              {isExpanded && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 space-y-3">
                  {actions.map((action) => {
                    const key = `${module}:${action}`;
                    const isGranted = permissions[key];

                    return (
                      <div key={key} className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isGranted}
                            onChange={(e) => togglePermission(module, action, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {action.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="inline-block px-2 py-1 bg-gray-100 rounded mt-1">
                                {module}:{action}
                              </span>
                            </div>
                          </div>
                        </label>

                        {isGranted ? (
                          <Check size={20} className="text-green-600" />
                        ) : (
                          <X size={20} className="text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>
            {Object.values(permissions).filter(Boolean).length}
          </strong>
          {' '}of{' '}
          <strong>
            {Object.keys(permissions).length}
          </strong>
          {' '}permissions granted
        </p>
      </div>

      {/* Save Notice */}
      {changed && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <span className="text-yellow-800">You have unsaved changes</span>
          <button
            onClick={savePermissions}
            disabled={saving}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}
    </div>
  );
}
