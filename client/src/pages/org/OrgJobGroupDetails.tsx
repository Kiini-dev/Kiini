import { useParams, useLocation } from "wouter";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Loader2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  ArrowLeft,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings, formatAmount } from "@/lib/currency";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { JobGroupPayrollItems, type JobGroupPayrollItem } from "@/components/JobGroupPayrollItems";
import { RichTextDisplay, RichTextEditor } from "@/components/RichTextEditor";

export default function JobGroupDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { code: currencyCode, symbol, position } = useCurrencySettings();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", minimumGrossSalary: 0, maximumGrossSalary: 0, defaultBasicSalary: 0, defaultAnnualLeaveDays: 21, defaultAllowances: [] as JobGroupPayrollItem[], defaultDeductions: [] as JobGroupPayrollItem[], defaultBenefits: [] as JobGroupPayrollItem[] });

  const parsePayrollItems = (value: string | null | undefined, amountRequired = true): JobGroupPayrollItem[] => {
    if (!value) return [];
    try { return JSON.parse(value).map((item: any) => ({ type: item.type || "", amount: amountRequired && item.amount ? (item.amount / 100).toString() : "", frequency: item.frequency || "monthly" })); } catch { return []; }
  };
  const serializePayrollItems = (items: JobGroupPayrollItem[], amountRequired = true) => items.filter((item) => item.type.trim()).map((item) => ({ type: item.type.trim(), amount: amountRequired ? Math.round(parseFloat(item.amount || "0") * 100) : (item.amount ? Math.round(parseFloat(item.amount) * 100) : 0), frequency: item.frequency || "monthly" as const }));

  const { data: jobGroup, isLoading } = trpc.jobGroups.getById.useQuery(id || "");
  const { data: employeesData = [] } = trpc.employees.byJobGroup.useQuery(
    { jobGroupId: id || "" },
    { enabled: !!id }
  );
  const utils = trpc.useUtils();

  // Mutations for CRUD
  const updateJobGroupMutation = trpc.jobGroups.update.useMutation({
    onSuccess: () => {
      utils.jobGroups.getById.invalidate(id);
      utils.jobGroups.list.invalidate();
      toast.success("Job group updated successfully");
      setShowEditModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job group");
    },
  });

  const deleteJobGroupMutation = trpc.jobGroups.delete.useMutation({
    onSuccess: () => {
      utils.jobGroups.list.invalidate();
      toast.success("Job group deleted successfully");
      navigate("/job-groups");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job group");
    },
  });

  const allEmployees = employeesData as any[];
  const groupEmployees = allEmployees; // Already filtered by byJobGroup query

  // Calculate salary statistics
  const salaries = groupEmployees
    .map((emp: any) => emp.salary)
    .filter((salary: any) => salary && salary > 0) as number[];

  const salaryStats = salaries.length > 0 ? {
    min: Math.min(...salaries),
    max: Math.max(...salaries),
    avg: salaries.reduce((a, b) => a + b, 0) / salaries.length,
    median: salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)],
  } : null;

  // Department distribution
  const departmentStats = groupEmployees.reduce((acc: Record<string, number>, emp: any) => {
    const dept = emp.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentChartData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value,
  }));

  // Employment type distribution
  const employmentTypeStats = groupEmployees.reduce((acc: Record<string, number>, emp: any) => {
    const type = emp.employmentType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const employmentTypeChartData = Object.entries(employmentTypeStats).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "HR", href: "/hr" },
    { label: "Job Groups", href: "/job-groups" },
    { label: (jobGroup as any)?.name || "Details" },
  ];

  const handleEdit = () => {
    const jg = jobGroup as any;
    setFormData({
      name: jg.name || "",
      description: jg.description || "",
      minimumGrossSalary: Number(jg.minimumGrossSalary || 0),
      maximumGrossSalary: Number(jg.maximumGrossSalary || 0),
      defaultBasicSalary: Number(jg.defaultBasicSalary || 0),
      defaultAnnualLeaveDays: Number(jg.defaultAnnualLeaveDays || 21),
      defaultAllowances: parsePayrollItems(jg.defaultAllowances),
      defaultDeductions: parsePayrollItems(jg.defaultDeductions),
      defaultBenefits: parsePayrollItems(jg.defaultBenefits, false),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setIsSubmitting(true);
    try {
      await updateJobGroupMutation.mutateAsync({
        id: id || "",
        name: formData.name,
        description: formData.description || undefined,
        minimumGrossSalary: formData.minimumGrossSalary || undefined,
        maximumGrossSalary: formData.maximumGrossSalary || undefined,
        defaultBasicSalary: formData.defaultBasicSalary || undefined,
        defaultAnnualLeaveDays: formData.defaultAnnualLeaveDays,
        defaultAllowances: serializePayrollItems(formData.defaultAllowances),
        defaultDeductions: serializePayrollItems(formData.defaultDeductions),
        defaultBenefits: serializePayrollItems(formData.defaultBenefits, false),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteJobGroupMutation.mutateAsync(id || "");
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Job Group Details"
        icon={<Building2 className="h-5 w-5" />}
        breadcrumbs={breadcrumbs}
        backLink={{ label: "Job Groups", href: "/job-groups" }}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ModuleLayout>
    );
  }

  if (!jobGroup) {
    return (
      <ModuleLayout
        title="Job Group Details"
        icon={<Building2 className="h-5 w-5" />}
        breadcrumbs={breadcrumbs}
        backLink={{ label: "Job Groups", href: "/job-groups" }}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Job group not found.</p>
          <Button onClick={() => navigate("/job-groups")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Job Groups
          </Button>
        </div>
      </ModuleLayout>
    );
  }

  const jg = jobGroup as any;
  const isActive = jg.isActive !== false && jg.isActive !== 0;
  const minSalary = Number(jg.minimumGrossSalary || 0);
  const maxSalary = Number(jg.maximumGrossSalary || 0);
  const defaultBasicSalary = Number(jg.defaultBasicSalary || 0);
  const defaultAnnualLeaveDays = Number(jg.defaultAnnualLeaveDays || 21);
  const defaultAllowances = parsePayrollItems(jg.defaultAllowances);
  const defaultDeductions = parsePayrollItems(jg.defaultDeductions);
  const defaultBenefits = parsePayrollItems(jg.defaultBenefits, false);

  return (
    <ModuleLayout
      title={jg.name || "Job Group Details"}
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={breadcrumbs}
      backLink={{ label: "Job Groups", href: "/job-groups" }}
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Employees</p>
                  <p className="text-2xl font-bold">{groupEmployees.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div>
                <p className="text-xs text-muted-foreground">Min Salary</p>
                <p className="text-lg font-bold text-green-600">{formatAmount(minSalary, symbol, position)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div>
                <p className="text-xs text-muted-foreground">Max Salary</p>
                <p className="text-lg font-bold text-blue-600">{formatAmount(maxSalary, symbol, position)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Analytics */}
        {salaryStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Salary Analytics
              </CardTitle>
              <CardDescription>
                Salary distribution and statistics for employees in this job group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(salaryStats.min, symbol, position)}
                  </div>
                  <div className="text-sm text-muted-foreground">Minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatAmount(salaryStats.avg, symbol, position)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatAmount(salaryStats.median, symbol, position)}
                  </div>
                  <div className="text-sm text-muted-foreground">Median</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatAmount(salaryStats.max, symbol, position)}
                  </div>
                  <div className="text-sm text-muted-foreground">Maximum</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Department Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-4">Employment Type Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={employmentTypeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Group Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {jg.name}
              </CardTitle>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? (
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Active</span>
                ) : (
                  <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Inactive</span>
                )}
              </Badge>
            </div>
            {jg.description && (
              <CardDescription><RichTextDisplay html={jg.description} /></CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Salary Range
                </p>
                <p className="font-semibold">
                  {minSalary > 0 || maxSalary > 0
                    ? `${formatAmount(minSalary, symbol, position)} – ${formatAmount(maxSalary, symbol, position)}`
                    : "Not set"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">Currency</p>
                <p className="font-semibold">{jg.currency || "KES"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payroll Defaults</CardTitle><CardDescription>Applied when an employee is assigned to this job group.</CardDescription></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Basic Salary</p><p className="font-semibold">{defaultBasicSalary ? formatAmount(defaultBasicSalary, symbol, position) : "Not set"}</p></div>
              <div><p className="text-xs text-muted-foreground">Annual Leave</p><p className="font-semibold">{defaultAnnualLeaveDays} days</p></div>
              {[{ label: "Allowances", items: defaultAllowances }, { label: "Deductions", items: defaultDeductions }, { label: "Benefits", items: defaultBenefits }].map(({ label, items }) => (
                <div key={label}><p className="text-xs text-muted-foreground">{label}</p>{items.length ? <ul className="text-sm">{items.map((item, index) => <li key={`${label}-${index}`}>{item.type}{item.amount ? `: ${formatAmount(Number(item.amount), symbol, position)}` : ""} ({item.frequency || "monthly"})</li>)}</ul> : <p className="text-sm">Not set</p>}</div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employees in this Job Group */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees in this Job Group
              <Badge variant="secondary" className="ml-1">{groupEmployees.length}</Badge>
            </CardTitle>
            <CardDescription>All employees assigned to the {jg.name} job group</CardDescription>
          </CardHeader>
          <CardContent>
            {groupEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No employees assigned to this job group yet.</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupEmployees.map((emp: any) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
                              {(emp.firstName?.[0] || emp.name?.[0] || "?").toUpperCase()}
                            </div>
                            <span className="whitespace-nowrap">
                              {emp.firstName && emp.lastName
                                ? `${emp.firstName} ${emp.lastName}`
                                : emp.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {emp.position || emp.jobTitle || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {emp.department || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {emp.salary ? formatAmount(emp.salary, symbol, position) : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline">{emp.employmentType || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {emp.email ? (
                            <a href={`mailto:${emp.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                              <Mail className="h-3 w-3" /> {emp.email}
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={(emp.status || "active") === "active" ? "default" : "secondary"}
                            className="capitalize text-xs"
                          >
                            {emp.status || "active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Job Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Job group name"
                    className="mt-1"
                  />
                </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <RichTextEditor value={formData.description} onChange={(description) => setFormData({ ...formData, description })} placeholder="Job group description" minHeight="120px" className="mt-1" />
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Min Salary</label>
                    <Input
                      type="number"
                      value={formData.minimumGrossSalary || ""}
                      onChange={(e) => setFormData({ ...formData, minimumGrossSalary: Math.round(Number(e.target.value)) })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Salary</label>
                    <Input
                      type="number"
                      value={formData.maximumGrossSalary || ""}
                      onChange={(e) => setFormData({ ...formData, maximumGrossSalary: Math.round(Number(e.target.value)) })}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Default Basic Salary</label><Input type="number" value={formData.defaultBasicSalary || ""} onChange={(e) => setFormData({ ...formData, defaultBasicSalary: Math.round(Number(e.target.value)) })} placeholder="0.00" className="mt-1" /></div>
                  <div><label className="text-sm font-medium">Annual Leave Days</label><Input type="number" min="0" value={formData.defaultAnnualLeaveDays} onChange={(e) => setFormData({ ...formData, defaultAnnualLeaveDays: Number(e.target.value) })} placeholder="21" className="mt-1" /></div>
                </div>
                <JobGroupPayrollItems label="Default Allowances" items={formData.defaultAllowances} onChange={(defaultAllowances) => setFormData({ ...formData, defaultAllowances })} />
                <JobGroupPayrollItems label="Default Deductions" items={formData.defaultDeductions} onChange={(defaultDeductions) => setFormData({ ...formData, defaultDeductions })} />
                <JobGroupPayrollItems label="Default Benefits" items={formData.defaultBenefits} onChange={(defaultBenefits) => setFormData({ ...formData, defaultBenefits })} amountOptional />
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

        {/* Delete Modal */}
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Job Group"
          description={`Are you sure you want to delete "${jg.name}"? This action cannot be undone.`}
          isLoading={isSubmitting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </div>
    </ModuleLayout>
  );
}

