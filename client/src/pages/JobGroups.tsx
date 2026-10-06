import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrencySettings } from "@/lib/currency";
import { JobGroupPayrollItems, type JobGroupPayrollItem } from "@/components/JobGroupPayrollItems";
import { RichTextEditor } from "@/components/RichTextEditor";
import DataTable, { type Column } from "@/components/DataTable";

interface JobGroup {
  id: string;
  organizationId?: string | null;
  name: string;
  managerId?: string | null;
  description?: string;
  minimumGrossSalary?: number;
  maximumGrossSalary?: number;
  minSalary?: number;
  maxSalary?: number;
  defaultBasicSalary?: number;
  defaultAnnualLeaveDays?: number;
  defaultAllowances?: string | null;
  defaultDeductions?: string | null;
  defaultBenefits?: string | null;
  currency?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function JobGroups() {
  const { code: currencyCode } = useCurrencySettings();
  const { allowed, isLoading: permissionLoading } = useRequireFeature("jobGroups:read");
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJobGroup, setEditingJobGroup] = useState<JobGroup | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    minSalary: "",
    maxSalary: "",
    currency: currencyCode,
    managerId: "",
    isActive: true,
    defaultBasicSalary: "",
    defaultAnnualLeaveDays: "21",
    defaultAllowances: [] as JobGroupPayrollItem[],
    defaultDeductions: [] as JobGroupPayrollItem[],
    defaultBenefits: [] as JobGroupPayrollItem[],
  });

  const emptyPayrollItems = () => ({ defaultAllowances: [] as JobGroupPayrollItem[], defaultDeductions: [] as JobGroupPayrollItem[], defaultBenefits: [] as JobGroupPayrollItem[] });
  const serializePayrollItems = (items: JobGroupPayrollItem[], amountRequired = true) => items.filter((item) => item.type.trim()).map((item) => ({
    type: item.type.trim(),
    ...(item.percentage ? { percentage: Number(item.percentage) } : item.amount ? { amount: amountRequired ? Math.round(parseFloat(item.amount) * 100) : Math.round(parseFloat(item.amount) * 100) } : {}),
    frequency: item.frequency || "monthly" as const,
  }));
  const parsePayrollItems = (value: string | null | undefined, amountRequired = true): JobGroupPayrollItem[] => {
    if (!value) return [];
    try {
      return JSON.parse(value).map((item: any) => ({
        type: item.type || "",
        amount: amountRequired && item.amount ? (item.amount / 100).toString() : "",
        percentage: item.percentage !== undefined ? String(item.percentage) : "",
        frequency: item.frequency || "monthly",
      }));
    } catch { return []; }
  };

  // Queries
  const { data: jobGroupsData = [], isLoading: jobGroupsLoading, refetch } = trpc.jobGroups.list.useQuery({});
  const { data: employeesData = [] } = trpc.employees.list.useQuery({});
  const utils = trpc.useUtils();

  // Mutations
  const createMutation = trpc.jobGroups.create.useMutation({
    onSuccess: () => {
      toast.success("Job group created successfully");
      setCreateError(null);
      setFormData({ name: "", description: "", minSalary: "", maxSalary: "", currency: currencyCode, managerId: "", isActive: true, defaultBasicSalary: "", defaultAnnualLeaveDays: "21", ...emptyPayrollItems() });
      setIsCreateDialogOpen(false);
      utils.jobGroups.list.invalidate();
    },
    onError: (error) => {
      console.error("[JobGroups] Failed to create job group", error);
      setCreateError(error.message || "Failed to create job group");
      toast.error(error.message || "Failed to create job group");
    },
  });

  const updateMutation = trpc.jobGroups.update.useMutation({
    onSuccess: () => {
      toast.success("Job group updated successfully");
      setFormData({ name: "", description: "", minSalary: "", maxSalary: "", currency: currencyCode, managerId: "", isActive: true, defaultBasicSalary: "", defaultAnnualLeaveDays: "21", ...emptyPayrollItems() });
      setIsEditDialogOpen(false);
      setEditingJobGroup(null);
      utils.jobGroups.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job group");
    },
  });

  const deleteMutation = trpc.jobGroups.delete.useMutation({
    onSuccess: () => {
      toast.success("Job group deleted successfully");
      setDeleteConfirmId(null);
      utils.jobGroups.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job group");
    },
  });

  if (permissionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  const handleCreate = async () => {
    setCreateError(null);
    if (!formData.name.trim()) {
      setCreateError("Job group name is required");
      toast.error("Job group name is required");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      minimumGrossSalary: formData.minSalary ? Math.round(parseFloat(formData.minSalary)) : undefined,
      maximumGrossSalary: formData.maxSalary ? Math.round(parseFloat(formData.maxSalary)) : undefined,
      managerId: formData.managerId || null,
      defaultBasicSalary: formData.defaultBasicSalary ? Math.round(parseFloat(formData.defaultBasicSalary)) : undefined,
      defaultAnnualLeaveDays: parseInt(formData.defaultAnnualLeaveDays || "21", 10),
      defaultAllowances: serializePayrollItems(formData.defaultAllowances),
      defaultDeductions: serializePayrollItems(formData.defaultDeductions),
      defaultBenefits: serializePayrollItems(formData.defaultBenefits, false),
    };

    try {
      await createMutation.mutateAsync(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[JobGroups] Create request rejected", { message, payload });
      setCreateError(message || "Failed to create job group");
    }
  };

  const handleEdit = async () => {
    if (!editingJobGroup || !formData.name.trim()) {
      toast.error("Job group name is required");
      return;
    }

    await updateMutation.mutateAsync({
      id: editingJobGroup.id,
      name: formData.name,
      description: formData.description || undefined,
      minimumGrossSalary: formData.minSalary ? Math.round(parseFloat(formData.minSalary)) : undefined,
      maximumGrossSalary: formData.maxSalary ? Math.round(parseFloat(formData.maxSalary)) : undefined,
      managerId: formData.managerId || null,
      defaultBasicSalary: formData.defaultBasicSalary ? Math.round(parseFloat(formData.defaultBasicSalary)) : undefined,
      defaultAnnualLeaveDays: parseInt(formData.defaultAnnualLeaveDays || "21", 10),
      defaultAllowances: serializePayrollItems(formData.defaultAllowances),
      defaultDeductions: serializePayrollItems(formData.defaultDeductions),
      defaultBenefits: serializePayrollItems(formData.defaultBenefits, false),
    });
  };

  const openEditDialog = (jobGroup: JobGroup) => {
    const minimumGrossSalary = jobGroup.minimumGrossSalary ?? jobGroup.minSalary ?? 0;
    const maximumGrossSalary = jobGroup.maximumGrossSalary ?? jobGroup.maxSalary ?? 0;

    setEditingJobGroup(jobGroup);
    setFormData({
      name: jobGroup.name,
      description: jobGroup.description || "",
      minSalary: minimumGrossSalary ? minimumGrossSalary.toString() : "",
      maxSalary: maximumGrossSalary ? maximumGrossSalary.toString() : "",
      currency: jobGroup.currency || currencyCode,
      managerId: jobGroup.managerId || "",
      isActive: jobGroup.isActive !== false,
      defaultBasicSalary: jobGroup.defaultBasicSalary ? jobGroup.defaultBasicSalary.toString() : "",
      defaultAnnualLeaveDays: (jobGroup.defaultAnnualLeaveDays ?? 21).toString(),
      defaultAllowances: parsePayrollItems(jobGroup.defaultAllowances),
      defaultDeductions: parsePayrollItems(jobGroup.defaultDeductions),
      defaultBenefits: parsePayrollItems(jobGroup.defaultBenefits, false),
    });
    setIsEditDialogOpen(true);
  };

  const tableColumns: Column<JobGroup>[] = [
    {
      id: "name",
      label: "Name",
      sortable: true,
      filterable: true,
      getValue: (jobGroup) => jobGroup.name,
      accessor: (jobGroup) => (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-left justify-start"
          onClick={() => navigate(`/job-groups/${jobGroup.id}`)}
        >
          {jobGroup.name}
        </Button>
      ),
    },
    {
      id: "description",
      label: "Description",
      className: "text-sm text-muted-foreground",
      getValue: (jobGroup) => jobGroup.description || "N/A",
      accessor: (jobGroup) => jobGroup.description || "N/A",
    },
    {
      id: "salaryRange",
      label: "Salary Range",
      sortable: true,
      className: "text-sm",
      getValue: (jobGroup) => jobGroup.minimumGrossSalary ?? jobGroup.minSalary ?? 0,
      accessor: (jobGroup) =>
        (jobGroup.minimumGrossSalary ?? jobGroup.minSalary) &&
        (jobGroup.maximumGrossSalary ?? jobGroup.maxSalary)
          ? `${(jobGroup.minimumGrossSalary ?? jobGroup.minSalary)!.toLocaleString()} - ${(jobGroup.maximumGrossSalary ?? jobGroup.maxSalary)!.toLocaleString()} ${jobGroup.currency || currencyCode}`
          : "Not set",
    },
    {
      id: "manager",
      label: "Manager",
      filterable: true,
      getValue: (jobGroup) => {
        const manager = (employeesData as any[]).find((employee) => employee.id === jobGroup.managerId);
        return manager ? `${manager.firstName} ${manager.lastName}` : "Unassigned";
      },
    },
    {
      id: "status",
      label: "Status",
      filterable: true,
      getValue: (jobGroup) => (jobGroup.isActive ? "Active" : "Inactive"),
      accessor: (jobGroup) => (
        <Badge variant={jobGroup.isActive ? "default" : "secondary"}>
          {jobGroup.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "created",
      label: "Created",
      sortable: true,
      className: "text-sm text-muted-foreground",
      getValue: (jobGroup) => jobGroup.createdAt,
      accessor: (jobGroup) =>
        jobGroup.createdAt ? format(new Date(jobGroup.createdAt), "MMM dd, yyyy") : "N/A",
    },
  ];

  return (
    <ModuleLayout
      title="Job Groups"
      description="Manage job grades, salary structures, and employee classifications"
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "HR", href: "/hr" },
        { label: "Job Groups" },
      ]}
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Job Groups</h2>
            <p className="text-sm text-muted-foreground">
              Create and manage job grades for your organization
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) setCreateError(null); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Job Group</DialogTitle>
                <DialogDescription>
                  Add a new job grade or classification to your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {createError && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{createError}</div>}
                <div>
                  <label className="text-sm font-medium">Job Group Name *</label>
                  <Input
                    placeholder="e.g., Senior Developer, Manager"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <RichTextEditor value={formData.description} onChange={(description) => setFormData({ ...formData, description })} placeholder="Job group description or criteria" minHeight="120px" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Minimum Salary</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.minSalary}
                      onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    />
                  </div>
                <div>
                  <label className="text-sm font-medium">Manager</label>
                  <Select value={formData.managerId || "none"} onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}>
                    <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Unassigned</SelectItem>{(employeesData as any[]).map((employee: any) => <SelectItem key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Salary</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.maxSalary}
                      onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Default Basic Salary</label><Input type="number" placeholder="0.00" value={formData.defaultBasicSalary} onChange={(e) => setFormData({ ...formData, defaultBasicSalary: e.target.value })} /></div>
                  <div><label className="text-sm font-medium">Annual Leave Days</label><Input type="number" min="0" placeholder="21" value={formData.defaultAnnualLeaveDays} onChange={(e) => setFormData({ ...formData, defaultAnnualLeaveDays: e.target.value })} /></div>
                </div>
                <JobGroupPayrollItems label="Default Allowances" items={formData.defaultAllowances} onChange={(defaultAllowances) => setFormData({ ...formData, defaultAllowances })} />
                <JobGroupPayrollItems label="Default Deductions" items={formData.defaultDeductions} onChange={(defaultDeductions) => setFormData({ ...formData, defaultDeductions })} />
                <JobGroupPayrollItems label="Default Benefits" items={formData.defaultBenefits} onChange={(defaultBenefits) => setFormData({ ...formData, defaultBenefits })} amountOptional />
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Job Group"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Groups Table */}
        <Card>
          <CardHeader>
            <CardTitle>Job Groups List</CardTitle>
            <CardDescription>
              {jobGroupsData.length} job group{jobGroupsData.length !== 1 ? "s" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tableColumns}
              data={jobGroupsData}
              keyField="id"
              tableName="jobGroups"
              isLoading={jobGroupsLoading}
              searchFields={["name", "description"]}
              searchPlaceholder="Search job groups..."
              actions={(jobGroup) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="View job group"
                    aria-label={`View ${jobGroup.name}`}
                    onClick={() => navigate(`/job-groups/${jobGroup.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(jobGroup)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirmId(jobGroup.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Job Group</DialogTitle>
              <DialogDescription>
                Update the job group information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Group Name *</label>
                <Input
                  placeholder="e.g., Senior Developer, Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Default Basic Salary</label><Input type="number" placeholder="0.00" value={formData.defaultBasicSalary} onChange={(e) => setFormData({ ...formData, defaultBasicSalary: e.target.value })} /></div>
                <div><label className="text-sm font-medium">Annual Leave Days</label><Input type="number" min="0" placeholder="21" value={formData.defaultAnnualLeaveDays} onChange={(e) => setFormData({ ...formData, defaultAnnualLeaveDays: e.target.value })} /></div>
              </div>
              <JobGroupPayrollItems label="Default Allowances" items={formData.defaultAllowances} onChange={(defaultAllowances) => setFormData({ ...formData, defaultAllowances })} />
              <JobGroupPayrollItems label="Default Deductions" items={formData.defaultDeductions} onChange={(defaultDeductions) => setFormData({ ...formData, defaultDeductions })} />
              <JobGroupPayrollItems label="Default Benefits" items={formData.defaultBenefits} onChange={(defaultBenefits) => setFormData({ ...formData, defaultBenefits })} amountOptional />
              <div>
                <label className="text-sm font-medium">Description</label>
                <RichTextEditor value={formData.description} onChange={(description) => setFormData({ ...formData, description })} placeholder="Job group description or criteria" minHeight="120px" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum Salary</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Salary</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Manager</label>
                <Select value={formData.managerId || "none"} onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}>
                  <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Unassigned</SelectItem>{(employeesData as any[]).map((employee: any) => <SelectItem key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Job Group"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Delete Job Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job group? This action cannot be undone.
            </AlertDialogDescription>
            <div className="flex gap-3 pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirmId) {
                    deleteMutation.mutate(deleteConfirmId);
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ModuleLayout>
  );
}
