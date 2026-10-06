import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";
import { StatsCard } from "@/components/ui/stats-card";
import { formatCurrency } from "@/utils/format";

interface SalaryStructure {
  id: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxRate: number;
  notes?: string;
}

export default function SalaryStructures() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    basicSalary: "",
    allowances: "0",
    deductions: "0",
    taxRate: "0",
    notes: "",
  });

  // Fetch salary structures
  const { data: structures = [], isLoading } = trpc.payroll.salaryStructures.list.useQuery({});
  const { data: employees = [] } = trpc.employees.list.useQuery({});

  // Mutations
  const createMut = trpc.payroll.salaryStructures.create.useMutation();
  const updateMut = trpc.payroll.salaryStructures.update.useMutation();
  const deleteMut = trpc.payroll.salaryStructures.delete.useMutation();
  const utils = trpc.useUtils();

  const filteredStructures = structures.filter((s: any) => {
    const employee = (employees as any[]).find((item: any) => item.id === s.employeeId);
    const name = employee ? `${employee.firstName || ""} ${employee.lastName || ""}` : s.employeeId;
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSave = async () => {
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (Number(formData.basicSalary) <= 0) {
      toast.error("Basic salary must be greater than 0");
      return;
    }

    try {
      if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          basicSalary: Math.round(Number(formData.basicSalary) * 100),
          allowances: Math.round(Number(formData.allowances || 0) * 100),
          deductions: Math.round(Number(formData.deductions || 0) * 100),
          taxRate: Math.round(Number(formData.taxRate || 0) * 100),
          notes: formData.notes || undefined,
        });
        toast.success("Salary structure updated");
      } else {
        await createMut.mutateAsync({
          employeeId: formData.employeeId,
          basicSalary: Math.round(Number(formData.basicSalary) * 100),
          allowances: Math.round(Number(formData.allowances || 0) * 100),
          deductions: Math.round(Number(formData.deductions || 0) * 100),
          taxRate: Math.round(Number(formData.taxRate || 0)),
          notes: formData.notes || undefined,
        });
        toast.success("Salary structure created");
      }
      setIsDialogOpen(false);
      setFormData({ employeeId: "", basicSalary: "", allowances: "0", deductions: "0", taxRate: "0", notes: "" });
      setEditingId(null);
      utils.payroll.salaryStructures.list.refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save structure");
    }
  };

  const handleEdit = (structure: SalaryStructure) => {
    setFormData({
      employeeId: structure.employeeId,
      basicSalary: String(Number(structure.basicSalary || 0) / 100),
      allowances: String(Number(structure.allowances || 0) / 100),
      deductions: String(Number(structure.deductions || 0) / 100),
      taxRate: String(Number(structure.taxRate || 0) / 100),
      notes: structure.notes || "",
    });
    setEditingId(structure.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this salary structure?")) return;
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Salary structure deleted");
      utils.payroll.salaryStructures.list.refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete structure");
    }
  };

  const totalStructures = structures.length;
  const averageBasicSalary =
    structures.length > 0
      ? structures.reduce((sum: number, s: any) => sum + Number(s.basicSalary || 0), 0) / structures.length / 100
      : 0;

  return (
    <ModuleLayout
      title="Salary Structures"
      description="Manage salary grades and structures for employees"
      icon={<DollarSign className="h-6 w-6" />}
      breadcrumbs={[
        { label: "HR", href: "/hr" },
        { label: "Payroll", href: "/payroll" },
        { label: "Salary Structures" },
      ]}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Structures"
            value={totalStructures}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Avg Basic Salary"
            value={formatCurrency(averageBasicSalary)}
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Input
              placeholder="Search structures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Salary Structure" : "Create Salary Structure"}
                </DialogTitle>
                <DialogDescription>
                  Define salary grade levels and basic compensation
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee</label>
                  <select className="w-full rounded-md border px-3 py-2 text-sm" value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} disabled={!!editingId}>
                    <option value="">Select employee</option>
                    {(employees as any[]).map((employee: any) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Basic Salary (KES)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  />
                </div>

                <div><label className="block text-sm font-medium mb-1">Allowances (KES)</label><Input type="number" step="0.01" value={formData.allowances} onChange={(e) => setFormData({ ...formData, allowances: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Deductions (KES)</label><Input type="number" step="0.01" value={formData.deductions} onChange={(e) => setFormData({ ...formData, deductions: e.target.value })} /></div>
                <div><label className="block text-sm font-medium mb-1">Tax Rate (%)</label><Input type="number" step="0.01" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })} /></div>

                <Button
                  onClick={handleSave}
                  disabled={createMut.isPending || updateMut.isPending}
                  className="w-full"
                >
                  {editingId ? "Update Structure" : "Create Structure"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Salary Structures</CardTitle>
            <CardDescription>{filteredStructures.length} structures configured</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading structures...</div>
            ) : filteredStructures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No salary structures found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden md:table-cell">Effective Date</TableHead>
                      <TableHead className="text-right">Basic Salary</TableHead>
                        <TableHead className="text-center">Tax Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStructures.map((structure: SalaryStructure) => (
                      <TableRow key={structure.id}>
                        <TableCell className="font-medium">{(employees as any[]).find((employee: any) => employee.id === structure.employeeId)?.firstName} {(employees as any[]).find((employee: any) => employee.id === structure.employeeId)?.lastName}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {structure.effectiveDate ? new Date(structure.effectiveDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(structure.basicSalary)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{(Number(structure.taxRate || 0) / 100).toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(structure)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setLocation(`/salary-structures/${structure.id}`)}><Eye className="h-4 w-4" /></Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(structure.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
