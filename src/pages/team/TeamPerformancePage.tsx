import React, { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Plus, Edit2, Trash2 } from 'lucide-react';

export function TeamPerformancePage() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [formData, setFormData] = useState({
    rating: 5,
    performance: 80,
    productivity: 8,
    collaboration: 8,
    communication: 8,
    technicalSkills: 8,
    leadership: 7,
    feedback: '',
  });

  const teamDashboardQuery = trpc.teamPerformance.getTeamDashboard.useQuery();
  const createReviewMutation = trpc.teamPerformance.createReview.useMutation();
  const addSkillMutation = trpc.teamPerformance.addSkill.useMutation();

  const employees = teamDashboardQuery.data || [];

  // Performance distribution
  const performanceDistribution = [
    { range: 'Excellent (90+)', count: employees.filter((e: any) => e.latestReview?.performance >= 90).length },
    { range: 'Good (70-89)', count: employees.filter((e: any) => e.latestReview?.performance >= 70 && e.latestReview?.performance < 90).length },
    { range: 'Average (50-69)', count: employees.filter((e: any) => e.latestReview?.performance >= 50 && e.latestReview?.performance < 70).length },
    { range: 'Below Avg (<50)', count: employees.filter((e: any) => e.latestReview?.performance < 50).length },
  ];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await createReviewMutation.mutateAsync({
        employeeId: selectedEmployee,
        rating: Math.round(formData.rating),
        performance: Math.round(formData.performance),
        productivity: Math.round(formData.productivity),
        collaboration: Math.round(formData.collaboration),
        communication: Math.round(formData.communication),
        technicalSkills: Math.round(formData.technicalSkills),
        leadership: Math.round(formData.leadership),
        feedback: formData.feedback,
        reviewPeriod: 'annual',
      });

      setShowReviewForm(false);
      setFormData({
        rating: 5,
        performance: 80,
        productivity: 8,
        collaboration: 8,
        communication: 8,
        technicalSkills: 8,
        leadership: 7,
        feedback: '',
      });
      teamDashboardQuery.refetch();
    } catch (error) {
      console.error('Failed to create review:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Performance</h1>
          <p className="text-gray-600">Reviews, skills, and team dashboard</p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} /> New Review
        </button>
      </div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Performance Distribution</h2>
          {performanceDistribution.some(p => p.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-20} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No review data</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Team Size & Skills</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">Total Team Members</span>
              <span className="text-2xl font-bold text-blue-600">{employees.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">Avg Skills per Employee</span>
              <span className="text-2xl font-bold text-green-600">
                {((employees.reduce((sum: number, e: any) => sum + (e.skillCount || 0), 0) / (employees.length || 1))).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <span className="font-medium">Reviewed This Period</span>
              <span className="text-2xl font-bold text-yellow-600">
                {employees.filter((e: any) => e.latestReview).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Create Performance Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Employee Select */}
                <div>
                  <label className="block text-sm font-medium mb-2">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RatingSlider
                    label="Overall Rating"
                    value={formData.rating}
                    min={1}
                    max={5}
                    onChange={(val) => setFormData({...formData, rating: val})}
                    unit="⭐"
                  />
                  <RatingSlider
                    label="Performance Score"
                    value={formData.performance}
                    min={0}
                    max={100}
                    onChange={(val) => setFormData({...formData, performance: val})}
                  />
                  <RatingSlider
                    label="Productivity"
                    value={formData.productivity}
                    min={0}
                    max={10}
                    onChange={(val) => setFormData({...formData, productivity: val})}
                  />
                  <RatingSlider
                    label="Collaboration"
                    value={formData.collaboration}
                    min={0}
                    max={10}
                    onChange={(val) => setFormData({...formData, collaboration: val})}
                  />
                  <RatingSlider
                    label="Communication"
                    value={formData.communication}
                    min={0}
                    max={10}
                    onChange={(val) => setFormData({...formData, communication: val})}
                  />
                  <RatingSlider
                    label="Technical Skills"
                    value={formData.technicalSkills}
                    min={0}
                    max={10}
                    onChange={(val) => setFormData({...formData, technicalSkills: val})}
                  />
                </div>

                <RatingSlider
                  label="Leadership"
                  value={formData.leadership}
                  min={0}
                  max={10}
                  onChange={(val) => setFormData({...formData, leadership: val})}
                />

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium mb-2">Feedback</label>
                  <textarea
                    value={formData.feedback}
                    onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Detailed feedback..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={!selectedEmployee || createReviewMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition"
                  >
                    {createReviewMutation.isPending ? 'Saving...' : 'Save Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-center">Position</th>
                <th className="px-4 py-3 text-center">Department</th>
                <th className="px-4 py-3 text-center">Latest Review</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-center">Skills</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee: any) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{employee.firstName} {employee.lastName}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{employee.position}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{employee.department}</td>
                  <td className="px-4 py-3 text-center text-sm">
                    {employee.latestReview ? new Date(employee.latestReview.createdAt).toLocaleDateString('en-KE') : 'No review'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {employee.latestReview && (
                      <div className="flex justify-center gap-0.5">
                        {[...Array(Math.round(employee.latestReview.rating || 0))].map((_, i) => (
                          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {employee.skillCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 hover:bg-blue-100 rounded transition" title="Edit">
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded transition" title="Delete">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">No employees found</div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingSlider({ label, value, min, max, onChange, unit }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}: <span className="text-blue-600 font-semibold">{value} {unit || '/10'}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
