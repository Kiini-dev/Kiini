import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { Plus, Download, Check, X, Eye } from 'lucide-react';

export function ExpenseManagementPage() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    expenses: [{ description: '', amount: '', category: '', vendor: '' }],
  });

  const reportsQuery = trpc.expenses.getReports.useQuery();
  const submitReportMutation = trpc.expenses.submitExpenseReport.useMutation();
  const approveReportMutation = trpc.expenses.approveReport.useMutation();
  const processReimburseMutation = trpc.expenses.processReimbursement.useMutation();

  const reports = reportsQuery.data || [];

  // Summary stats
  const stats = {
    pending: reports.filter((r: any) => r.status === 'submitted').length,
    approved: reports.filter((r: any) => r.status === 'approved').length,
    reimbursed: reports.filter((r: any) => r.status === 'reimbursed').length,
    totalPending: reports
      .filter((r: any) => r.status !== 'reimbursed')
      .reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0) / 100,
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitReportMutation.mutateAsync({
        expenses: formData.expenses
          .filter(exp => exp.description && exp.amount)
          .map(exp => ({
            description: exp.description,
            amount: Math.round(Number(exp.amount) * 100),
            categoryId: exp.category,
            vendor: exp.vendor,
          })),
      });

      setShowReportForm(false);
      setFormData({ expenses: [{ description: '', amount: '', category: '', vendor: '' }] });
      reportsQuery.refetch();
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await approveReportMutation.mutateAsync({ reportId });
      reportsQuery.refetch();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleProcess = async (reportId: string) => {
    try {
      await processReimburseMutation.mutateAsync({
        reportId,
        paymentMethod: 'bank_transfer',
      });
      reportsQuery.refetch();
    } catch (error) {
      console.error('Failed to process:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Submit, approve, and track expense reports</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} /> New Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBox label="Pending Approval" value={stats.pending} color="yellow" />
        <StatBox label="Approved" value={stats.approved} color="blue" />
        <StatBox label="Reimbursed" value={stats.reimbursed} color="green" />
        <StatBox label="Total Pending" value={`Ksh ${stats.totalPending.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`} color="purple" />
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full m-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Submit Expense Report</h2>
              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* Expense Items */}
                <div className="space-y-3">
                  {formData.expenses.map((expense, idx) => (
                    <div key={expense.id || `exp-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded bg-gray-50">
                      <input
                        type="text"
                        placeholder="Description"
                        value={expense.description}
                        onChange={(e) => {
                          const newExpenses = [...formData.expenses];
                          newExpenses[idx].description = e.target.value;
                          setFormData({ expenses: newExpenses });
                        }}
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount (Ksh)"
                        step="0.01"
                        value={expense.amount}
                        onChange={(e) => {
                          const newExpenses = [...formData.expenses];
                          newExpenses[idx].amount = e.target.value;
                          setFormData({ expenses: newExpenses });
                        }}
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={expense.category}
                        onChange={(e) => {
                          const newExpenses = [...formData.expenses];
                          newExpenses[idx].category = e.target.value;
                          setFormData({ expenses: newExpenses });
                        }}
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Category</option>
                        <option value="travel">Travel</option>
                        <option value="meals">Meals</option>
                        <option value="office">Office Supplies</option>
                        <option value="software">Software</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Vendor (optional)"
                        value={expense.vendor}
                        onChange={(e) => {
                          const newExpenses = [...formData.expenses];
                          newExpenses[idx].vendor = e.target.value;
                          setFormData({ expenses: newExpenses });
                        }}
                        className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        expenses: [...formData.expenses, { description: '', amount: '', category: '', vendor: '' }],
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Plus size={16} /> Add Item
                  </button>
                  <button
                    type="submit"
                    disabled={submitReportMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
                  >
                    {submitReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Expense Reports</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Report #</th>
                <th className="px-4 py-3 text-center">Amount</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-center">Submitted</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report: any) => (
                <tr key={report.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{report.reportNumber}</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    Ksh {(report.totalAmount / 100).toLocaleString('en-KE')}
                  </td>
                  <td className="px-4 py-3 text-center">{report.itemCount || 0}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {new Date(report.createdAt).toLocaleDateString('en-KE')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 hover:bg-blue-100 rounded transition" title="View">
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      {report.status === 'submitted' && (
                        <button
                          onClick={() => handleApprove(report.id)}
                          disabled={approveReportMutation.isPending}
                          className="p-1 hover:bg-green-100 rounded transition"
                          title="Approve"
                        >
                          <Check size={16} className="text-green-600" />
                        </button>
                      )}
                      {report.status === 'approved' && (
                        <button
                          onClick={() => handleProcess(report.id)}
                          disabled={processReimburseMutation.isPending}
                          className="p-1 hover:bg-purple-100 rounded transition"
                          title="Process Reimbursement"
                        >
                          <Download size={16} className="text-purple-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <div className="text-center py-8 text-gray-500">No reports found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: any) {
  const colors = {
    yellow: 'bg-yellow-100 border-yellow-300',
    blue: 'bg-blue-100 border-blue-300',
    green: 'bg-green-100 border-green-300',
    purple: 'bg-purple-100 border-purple-300',
  };

  return (
    <div className={`p-4 border rounded-lg ${colors[color as keyof typeof colors]}`}>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const colors: any = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    reimbursed: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
