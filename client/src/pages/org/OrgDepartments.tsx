import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableItemLink } from "@/components/TableItemLink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DepartmentForm } from "@/components/DepartmentForm";
import { Building2, Eye, Plus, Search, Edit, Trash2, Users, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatsCard } from "@/components/ui/stats-card";
import { getNextSortDirection, getSortIndicator } from "@/lib/tableSort";

export default function Departments() {
  const [, navigate] = useLocation();
  const { allowed, isLoading } = useRequireFeature("hr:departments:view");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"code" | "name" | "manager" | "employeeCount" | "budget">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);

  // Fetch real data from backend (must be before any early returns to satisfy React hooks rules)
  const { data: departmentsData = [], isLoading: departmentsLoading } = trpc.departments.list.useQuery({});
  const utils = trpc.useUtils();
  const deleteMutation = trpc.departments.delete.useMutation({
    onSuccess: () => { utils.departments.list.invalidate(); toast.success("Department deleted"); },
    onError: (err: any) => toast.error(err.message || "Failed to delete department"),
  });
  
  // Transform backend data to display format
  const departments = (departmentsData as any[]).map((dept: any) => ({
      id: String(dept.id),
      name: dept.name || "Unknown Department",
      code: dept.code || `DEPT-${dept.id.slice(0, 3).toUpperCase()}`,
      manager: dept.headName || dept.manager || "Unassigned",
      employeeCount: dept.employeeCount || 0,
      budget: dept.budget || 0,
      salaryRangeMin: dept.salaryRangeMin ?? "",
      salaryRangeMax: dept.salaryRangeMax ?? "",
      description: dept.description || "",
    }));

  const filteredDepartments = useMemo(() => (departments as any[])
    .filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const left = a[sortField] ?? "";
      const right = b[sortField] ?? "";
      const comparison = left < right ? -1 : left > right ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    }), [departments, searchTerm, sortField, sortOrder]);

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const toggleSort = (field: typeof sortField) => {
    setSortField(field);
    setSortOrder(getNextSortDirection(field, sortField, sortOrder));
  };

  const totalEmployees = (departments as any[]).reduce((sum: number, d: any) => sum + d.employeeCount, 0);
  const totalBudget = (departments as any[]).reduce((sum: number, d: any) => sum + d.budget, 0);

  return (
    <ModuleLayout
      title="Department Management"
      description="Manage organizational departments, teams, and resources"
      icon={<Building2 className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "HR", href: "/hr" },
        { label: "Departments" },
      ]}
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Department
        </Button>
      }
    >
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Edit Department" : "Create New Department"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment 
                ? "Update department details below"
                : "Add a new department to your organization"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DepartmentForm
              initialData={editingDepartment}
              isModal={true}
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                setEditingDepartment(null);
                utils.departments.list.invalidate();
              }}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setEditingDepartment(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            label="Total Departments"
            value={departments.length}
            description="Active departments"
            icon={<Building2 className="h-5 w-5" />}
            color="border-l-blue-500"
          />

          <StatsCard
            label="Total Employees"
            value={totalEmployees}
            description="Across all departments"
            icon={<Users className="h-5 w-5" />}
            color="border-l-green-500"
          />

          <StatsCard
            label="Total Budget"
            value={<>Ksh {(totalBudget || 0).toLocaleString()}</>}
            description="Annual allocation"
            icon={<Building2 className="h-5 w-5" />}
            color="border-l-purple-500"
          />

          <StatsCard
            label="Avg. Team Size"
            value={departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0}
            description="Employees per dept"
            icon={<Users className="h-5 w-5" />}
            color="border-l-orange-500"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>View and manage organizational departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("code")}>Code <span aria-hidden="true">{getSortIndicator("code", sortField, sortOrder)}</span></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>Department Name <span aria-hidden="true">{getSortIndicator("name", sortField, sortOrder)}</span></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("manager")}>Manager <span aria-hidden="true">{getSortIndicator("manager", sortField, sortOrder)}</span></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("employeeCount")}>Employees <span aria-hidden="true">{getSortIndicator("employeeCount", sortField, sortOrder)}</span></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("budget")}>Annual Budget <span aria-hidden="true">{getSortIndicator("budget", sortField, sortOrder)}</span></TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-mono font-medium">{dept.code}</TableCell>
                    <TableCell className="font-medium"><TableItemLink href={`/departments/${dept.id}`}>{dept.name}</TableItemLink></TableCell>
                    <TableCell>{dept.manager}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{dept.employeeCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>Ksh {(dept.budget || 0).toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{dept.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View"
                          onClick={() => navigate(`/departments/${dept.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Edit"
                          onClick={() => {
                            setEditingDepartment({
                              id: dept.id,
                              departmentName: dept.name,
                              description: dept.description,
                              budget: String(dept.budget ?? ""),
                              headId: dept.headId || "",
                              isActive: dept.isActive !== false,
                              salaryRangeMin: String(dept.salaryRangeMin ?? ""),
                              salaryRangeMax: String(dept.salaryRangeMax ?? ""),
                            });
                            setIsCreateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete"
                          onClick={() => { if (confirm(`Delete department "${dept.name}"?`)) deleteMutation.mutate(dept.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

