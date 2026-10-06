import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Building2, Users, Wallet, BriefcaseBusiness, ListChecks, BarChart3, FileText, ArrowUpRight, UserRound, CalendarDays, ChevronRight, CircleDollarSign } from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function DepartmentDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [movingEmployee, setMovingEmployee] = useState<any | null>(null);
  const [targetDepartmentId, setTargetDepartmentId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: 0,
    salaryRangeMin: "",
    salaryRangeMax: "",
    headId: "",
    isActive: true,
  });

  // Fetch department from backend
  const { data: departmentData, isLoading } = trpc.departments.getById.useQuery(id || "");
  const { data: detailsData, isLoading: isDetailsLoading } = trpc.departments.details.useQuery(id || "");
  const { data: employeesData = [] } = trpc.employees.list.useQuery({});
  const { data: allDepartments = [] } = trpc.departments.list.useQuery({});
  const utils = trpc.useUtils();

  const updateDepartmentMutation = trpc.departments.update.useMutation({
    onSuccess: () => {
      toast.success("Department updated successfully");
      utils.departments.getById.invalidate(id);
      utils.departments.details.invalidate(id);
      utils.departments.list.invalidate();
      setShowEditModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update department");
    },
  });

  const deleteDepartmentMutation = trpc.departments.delete.useMutation({
    onSuccess: () => {
      toast.success("Department deleted successfully");
      utils.departments.list.invalidate();
      navigate("/departments");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete department");
    },
  });

  const moveEmployeeMutation = trpc.departments.moveEmployee.useMutation({
    onSuccess: (result) => {
      toast.success(`Employee moved to ${result.department}`);
      utils.departments.details.invalidate(id);
      utils.departments.getById.invalidate(id);
      utils.employees.list.invalidate();
      setMovingEmployee(null);
      setTargetDepartmentId("");
    },
    onError: (error) => toast.error(error.message || "Failed to move employee"),
  });

  const refreshDepartmentSpendMutation = trpc.budget.departmentBudgets.updateSpent.useMutation({
    onSuccess: (result) => {
      toast.success(`Department expenditure refreshed: ${money(result.spent)}`);
      utils.departments.details.invalidate(id);
    },
    onError: (error) => toast.error(error.message || "Failed to refresh department expenditure"),
  });

  // Count employees in this department
  const employeeCount = (employeesData as any[]).filter((e: any) => {
    const matchesName = e.department === (departmentData as any)?.name;
    const matchesDepartmentId = e.departmentId === (departmentData as any)?.id;
    return matchesName || matchesDepartmentId;
  }).length;

  const department = departmentData ? {
    id: id || "1",
    name: (departmentData as any).name || "Unknown Department",
    code: (departmentData as any).code || `DEPT-${id?.slice(0, 4)}`,
    manager: (departmentData as any).headId || "Not assigned",
    headName: (employeesData as any[]).find((e: any) => e.id === (departmentData as any)?.headId)
      ? `${(employeesData as any[]).find((e: any) => e.id === (departmentData as any)?.headId)?.firstName || ""} ${(employeesData as any[]).find((e: any) => e.id === (departmentData as any)?.headId)?.lastName || ""}`.trim() || "Not assigned"
      : "Not assigned",
    employeeCount,
    budget: (departmentData as any).budget || 0,
    status: (departmentData as any).status || "active",
    description: (departmentData as any).description || "",
    salaryRangeMin: (departmentData as any).salaryRangeMin ?? "",
    salaryRangeMax: (departmentData as any).salaryRangeMax ?? "",
    headId: (departmentData as any).headId || "",
    isActive: (departmentData as any).isActive !== false && (departmentData as any).status !== "inactive",
  } : null;
  const details = detailsData as any;
  const analytics = details?.analytics || {};
  const accounting = details?.accounting || {};
  const money = (value: number | null | undefined) => `Ksh ${Number(value || 0).toLocaleString()}`;

  const handleEdit = () => {
    if (department) {
      setFormData({
        name: department.name,
        description: department.description,
        budget: department.budget,
        salaryRangeMin: department.salaryRangeMin,
        salaryRangeMax: department.salaryRangeMax,
        headId: department.headId,
        isActive: department.isActive,
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      await updateDepartmentMutation.mutateAsync({
        id: id || "",
        name: formData.name,
        description: formData.description,
        budget: Number(formData.budget || 0),
        salaryRangeMin: formData.salaryRangeMin === "" ? null : Number(formData.salaryRangeMin),
        salaryRangeMax: formData.salaryRangeMax === "" ? null : Number(formData.salaryRangeMax),
        headId: formData.headId || undefined,
        isActive: formData.isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteDepartmentMutation.mutateAsync(id || "");
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Department Details"
        icon={<Building2 className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Departments", href: "/departments" },
          { label: "Details" },
        ]}
        backLink={{ label: "Departments", href: "/departments" }}
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading department...</p>
        </div>
      </ModuleLayout>
    );
  }

  if (!department) {
    return (
      <ModuleLayout
        title="Department Details"
        icon={<Building2 className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "HR", href: "/hr" },
          { label: "Departments", href: "/departments" },
          { label: "Details" },
        ]}
        backLink={{ label: "Departments", href: "/departments" }}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Department not found</p>
          <Button onClick={() => navigate("/departments")}>Back to Departments</Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Department Details"
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Departments", href: "/departments" },
        { label: "Details" },
      ]}
      backLink={{ label: "Departments", href: "/departments" }}
    >
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-slate-900 text-white shadow-lg dark:bg-slate-950">
          <CardContent className="p-0">
            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Building2 className="h-8 w-8" /></div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2"><Badge className="border-0 bg-emerald-400/15 text-emerald-200">{department.status}</Badge><span className="text-sm text-slate-300">{department.code}</span></div>
                  <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{department.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{department.description || "No department description has been added yet."}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={handleEdit}><Edit className="mr-2 h-4 w-4" />Edit department</Button>
                <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => setShowDeleteModal(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
              </div>
            </div>
            <div className="grid border-t border-white/10 sm:grid-cols-3">
              <div className="flex items-center gap-3 border-white/10 p-4 sm:border-r"><UserRound className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Department head</p><p className="mt-1 text-sm font-medium">{department.headName}</p></div></div>
              <div className="flex items-center gap-3 border-white/10 p-4 sm:border-r"><CalendarDays className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Created</p><p className="mt-1 text-sm font-medium">{departmentData?.createdAt ? new Date(departmentData.createdAt).toLocaleDateString() : "Not recorded"}</p></div></div>
              <div className="flex items-center gap-3 p-4"><CircleDollarSign className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-400">Annual budget</p><p className="mt-1 text-sm font-medium">{money(department.budget)}</p></div></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-1 overflow-x-auto border-b">
          {[['overview', 'Overview'], ['people', 'People'], ['work', 'Work and projects'], ['finance', 'Finance and reports']].map(([value, label]) => <button key={value} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab(value)}>{label}</button>)}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "People", value: analytics.employeeCount ?? department.employeeCount, detail: `${analytics.activeEmployees ?? 0} active`, icon: Users },
            { label: "Committed budget", value: money(accounting.committed), detail: `of ${money(accounting.budgetTotal)}`, icon: Wallet },
            { label: "Projects", value: analytics.projectCount ?? 0, detail: `${analytics.activeProjects ?? 0} active`, icon: BriefcaseBusiness },
            { label: "Tasks completed", value: `${analytics.completedTasks ?? 0}/${analytics.taskCount ?? 0}`, detail: `${analytics.completedProjectTasks ?? 0}/${analytics.projectTaskCount ?? 0} project tasks`, icon: ListChecks },
          ].map(({ label, value, detail, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-start justify-between p-5">
                <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        {isDetailsLoading ? <p className="text-sm text-muted-foreground">Loading department operations...</p> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-4 w-4" />Budget and accounting</CardTitle><CardDescription>Budget position and project cost visibility for this department.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {[['Annual department budget', accounting.budgetTotal], ['Remaining budget', accounting.budgetRemaining], ['Committed', accounting.committed], ['Project budget', accounting.projectBudget], ['Project expenditure', accounting.projectActual], ['Project variance', accounting.variance]].map(([label, value]) => <div className="flex justify-between border-b py-2 last:border-0" key={label as string}><span className="text-sm text-muted-foreground">{label}</span><span className="font-medium">{money(value as number)}</span></div>)}
              </CardContent>
            </Card>
            {activeTab !== "finance" && <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Analytics and reports</CardTitle><CardDescription>Operational indicators generated from department records.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${analytics.taskCount ? Math.round((analytics.completedTasks / analytics.taskCount) * 100) : 0}%` }} /></div>
                <p className="text-sm text-muted-foreground">Task completion: {analytics.taskCount ? Math.round((analytics.completedTasks / analytics.taskCount) * 100) : 0}%</p>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/payroll/department-reports?departmentId=${department.id}`)}><FileText className="mr-2 h-4 w-4" />Open department reports<ArrowUpRight className="ml-auto h-4 w-4" /></Button>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/budgets/expense-report?departmentId=${encodeURIComponent(department.id)}`)}><Wallet className="mr-2 h-4 w-4" />Open expense report<ArrowUpRight className="ml-auto h-4 w-4" /></Button>
                <Button variant="outline" className="w-full" disabled={refreshDepartmentSpendMutation.isPending} onClick={() => refreshDepartmentSpendMutation.mutate({ departmentId: department.id, year: new Date().getFullYear() })}><CircleDollarSign className="mr-2 h-4 w-4" />{refreshDepartmentSpendMutation.isPending ? "Refreshing expenditure..." : "Refresh expenditure"}</Button>
              </CardContent>
            </Card>}
            {activeTab !== "work" && <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" />Managers and team</CardTitle><CardDescription>Manage reporting roles and department membership.</CardDescription></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">{details?.managers?.length ? details.managers.map((person: any) => <div className="flex items-center justify-between" key={person.id}><div><p className="font-medium">{person.firstName} {person.lastName}</p><p className="text-sm text-muted-foreground">{person.position || 'Department manager'}</p></div><Badge variant={person.id === department.headId ? 'default' : 'secondary'}>{person.id === department.headId ? 'Head' : 'Manager'}</Badge></div>) : <p className="text-sm text-muted-foreground">No managers assigned.</p>}</div>
                <div className="border-t pt-4"><p className="mb-3 text-sm font-medium">Team roster</p>{details?.employees?.length ? <div className="space-y-2">{details.employees.slice(0, 8).map((person: any) => <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={person.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{person.firstName} {person.lastName}</p><p className="truncate text-xs text-muted-foreground">{person.position || person.employeeNumber}</p></div><Button variant="outline" size="sm" onClick={() => setMovingEmployee(person)}>Move</Button></div>)}</div> : <p className="text-sm text-muted-foreground">No employees assigned.</p>}</div>
              </CardContent>
            </Card>}
            {activeTab !== "people" && <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4" />Tasks and projects</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="mb-2 text-sm font-medium">Department tasks</p>{details?.tasks?.length ? details.tasks.slice(0, 5).map((task: any) => <div className="flex justify-between border-b py-2 text-sm" key={task.id}><span>{task.title}</span><Badge variant="outline">{task.status}</Badge></div>) : <p className="text-sm text-muted-foreground">No department tasks.</p>}</div>
                <div><p className="mb-2 text-sm font-medium">Projects</p>{details?.projects?.length ? details.projects.slice(0, 5).map((project: any) => <div className="flex justify-between border-b py-2 text-sm" key={project.id}><span>{project.name}</span><Badge variant="outline">{project.status}</Badge></div>) : <p className="text-sm text-muted-foreground">No projects assigned through department staff.</p>}</div>
              </CardContent>
            </Card>}
          </div>
        )}

        {movingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Move employee</CardTitle>
                <CardDescription>Move {movingEmployee.firstName} {movingEmployee.lastName} to another department.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target department</Label>
                  <Select value={targetDepartmentId} onValueChange={setTargetDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>{(allDepartments as any[]).filter((candidate: any) => candidate.id !== department.id).map((candidate: any) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setMovingEmployee(null); setTargetDepartmentId(""); }}>Cancel</Button>
                  <Button disabled={!targetDepartmentId || moveEmployeeMutation.isPending} onClick={() => moveEmployeeMutation.mutate({ employeeId: movingEmployee.id, targetDepartmentId })}>{moveEmployeeMutation.isPending ? "Moving..." : "Move employee"}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Department name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Department description"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department head</Label>
                  <Select value={formData.headId || "unassigned"} onValueChange={(value) => setFormData({ ...formData, headId: value === "unassigned" ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="Select department head" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {(employeesData as any[]).map((employee: any) => <SelectItem key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Min Salary</label>
                  <Input
                    type="number"
                    value={formData.salaryRangeMin}
                    onChange={(e) => setFormData({ ...formData, salaryRangeMin: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Salary</label>
                  <Input
                    type="number"
                    value={formData.salaryRangeMax}
                    onChange={(e) => setFormData({ ...formData, salaryRangeMax: Number(e.target.value) })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
      />
    </ModuleLayout>
  );
}
