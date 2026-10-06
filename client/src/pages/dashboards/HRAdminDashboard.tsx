import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  TrendingUp,
  Loader2,
  AlertCircle,
  Plus,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { StatsCard } from "@/components/ui/stats-card";

/**
 * HRAdminDashboard component
 * 
 * Features:
 * - Departmental heads management
 * - P9 forms generation and distribution
 * - Payroll administration
 * - Employee records management
 */
export default function HRAdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [generatingP9, setGeneratingP9] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [assigningHead, setAssigningHead] = useState(false);

  // Fetch departmental heads
  const { data: departmentalHeads, isLoading: headsLoading, refetch: refetchHeads } = trpc.departmentalHeads.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: !!user }
  );

  // Fetch departments
  const { data: departments } = trpc.departments.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!user }
  );

  // Fetch employees
  const { data: employees } = trpc.employees.list.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!user }
  );

  // Fetch P9 forms
  const { data: p9Forms, isLoading: p9Loading } = trpc.p9Forms.list.useQuery(
    { taxYear, limit: 50, offset: 0 },
    { enabled: !!user }
  );

  // Mutations
  const assignHeadMutation = trpc.departmentalHeads.assign.useMutation();
  const generateP9Mutation = trpc.p9Forms.generateForTaxYear.useMutation();

  useEffect(() => {
    if (!loading && isAuthenticated && !["admin", "super_admin", "hr"].includes(user?.role || "") && !user?.permissions?.includes("hr:manage")) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading || headsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (!(["admin", "super_admin", "hr"].includes(user?.role || "")) && !user?.permissions?.includes("hr:manage"))) {
    return null;
  }

  const handleAssignHead = async () => {
    if (!selectedDepartment || !selectedEmployee) {
      alert("Please select both department and employee");
      return;
    }

    try {
      setAssigningHead(true);
      await assignHeadMutation.mutateAsync({
        departmentId: selectedDepartment,
        employeeId: selectedEmployee,
      });
      alert("Department head assigned successfully");
      setSelectedDepartment("");
      setSelectedEmployee("");
      refetchHeads();
    } catch (error: any) {
      console.error("Failed to assign head:", error);
      alert(error.message || "Failed to assign department head");
    } finally {
      setAssigningHead(false);
    }
  };

  const handleGenerateP9 = async () => {
    try {
      setGeneratingP9(true);
      await generateP9Mutation.mutateAsync({ taxYear });
      alert(`P9 forms generated for tax year ${taxYear}`);
    } catch (error: any) {
      console.error("Failed to generate P9:", error);
      alert(error.message || "Failed to generate P9 forms");
    } finally {
      setGeneratingP9(false);
    }
  };

  const headsData = departmentalHeads || [];
  const p9Data = p9Forms?.p9Forms || [];
  const departmentsData = departments || [];
  const employeesData = employees || [];

  const sentP9 = p9Data.filter((p: any) => p.status === "sent").length;
  const draftP9 = p9Data.filter((p: any) => p.status === "draft").length;
  const totalHeads = headsData.length;

  return (
    <ModuleLayout title="HR Administration">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard 
            label="Department Heads" 
            value={totalHeads} 
            description="Active assignments" 
            color="border-l-blue-500" 
          />
          <StatsCard 
            label="P9 Forms - Sent" 
            value={sentP9} 
            description={`Tax year ${taxYear}`}
            color="border-l-green-500" 
          />
          <StatsCard 
            label="P9 Forms - Draft" 
            value={draftP9} 
            description={`To be sent`}
            color="border-l-orange-500" 
          />
          <StatsCard 
            label="Employees" 
            value={employeesData.length} 
            description="Active records" 
            color="border-l-purple-500" 
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="heads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="heads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Department Heads
            </TabsTrigger>
            <TabsTrigger value="p9" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              P9 Forms
            </TabsTrigger>
          </TabsList>

          {/* Department Heads Tab */}
          <TabsContent value="heads" className="space-y-4">
            {/* Assign New Head */}
            <Card>
              <CardHeader>
                <CardTitle>Assign Department Head</CardTitle>
                <CardDescription>Assign an employee as department head</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Select a department</option>
                        {departmentsData.map((dept: any) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-1">Employee</label>
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Select an employee</option>
                        {employeesData.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleAssignHead}
                    disabled={assigningHead || !selectedDepartment || !selectedEmployee}
                    className="w-full"
                  >
                    {assigningHead ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Assign Department Head
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Department Heads List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Department Heads</CardTitle>
                <CardDescription>Active department head assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {headsData.length > 0 ? (
                  <div className="space-y-3">
                    {headsData.map((head: any) => (
                      <div key={head.id} className="p-3 border rounded-lg flex items-start justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{head.firstName} {head.lastName}</p>
                          <p className="text-xs text-gray-500">{head.departmentName}</p>
                          <p className="text-xs text-gray-500">{head.position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {head.createdAt ? new Date(head.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                          <Button variant="ghost" size="sm" className="text-xs mt-1 h-6">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No department heads assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* P9 Forms Tab */}
          <TabsContent value="p9" className="space-y-4">
            {/* Generate P9 Forms */}
            <Card>
              <CardHeader>
                <CardTitle>Generate P9 Forms</CardTitle>
                <CardDescription>Generate annual tax forms for all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Tax Year</label>
                    <input
                      type="number"
                      value={taxYear}
                      onChange={(e) => setTaxYear(parseInt(e.target.value))}
                      min={2000}
                      max={2100}
                      className="w-full md:w-32 p-2 border rounded text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateP9}
                    disabled={generatingP9}
                    className="w-full md:w-auto"
                  >
                    {generatingP9 ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Generate P9 Forms for {taxYear}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* P9 Forms List */}
            <Card>
              <CardHeader>
                <CardTitle>P9 Forms</CardTitle>
                <CardDescription>Tax year {taxYear}</CardDescription>
              </CardHeader>
              <CardContent>
                {p9Loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : p9Data.length > 0 ? (
                  <div className="space-y-2">
                    {p9Data.map((p9: any) => (
                      <div key={p9.id} className="p-3 border rounded-lg flex items-start justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{p9.firstName} {p9.lastName}</p>
                          <p className="text-xs text-gray-500">{p9.email}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-1">
                            <span>Gross: KES {(p9.grossIncome || 0).toLocaleString()}</span>
                            <span>Tax: KES {(p9.netTaxPayable || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            {p9.status === "sent" ? (
                              <div className="flex items-center gap-1 text-green-600 text-xs">
                                <CheckCircle2 className="w-3 h-3" />
                                Sent
                              </div>
                            ) : p9.status === "draft" ? (
                              <div className="text-xs text-orange-600">Draft</div>
                            ) : (
                              <div className="text-xs text-gray-500">{p9.status}</div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs h-8">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No P9 forms generated for {taxYear}</p>
                    <p className="text-xs mt-1">Use the form above to generate P9 forms for this tax year</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
}
