import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Building2, Loader2 } from "lucide-react";

interface DepartmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isModal?: boolean;
}

export function DepartmentForm({ onSuccess, onCancel, initialData, isModal = false }: DepartmentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.departmentName || "",
    description: initialData?.description || "",
    headId: initialData?.headId || "",
    budget: initialData?.budget || "",
    salaryRangeMin: initialData?.salaryRangeMin ?? "",
    salaryRangeMax: initialData?.salaryRangeMax ?? "",
    isActive: initialData?.isActive !== false && initialData?.status !== "inactive",
  });

  const { data: employees = [] } = trpc.employees.list.useQuery({});

  const createDepartmentMutation = trpc.departments.create.useMutation({
    onSuccess: () => {
      toast.success("Department created successfully");
      setFormData({
        name: "",
        description: "",
        headId: "",
        budget: "",
        salaryRangeMin: "",
        salaryRangeMax: "",
        isActive: true,
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create department");
    },
  });

  const updateDepartmentMutation = trpc.departments.update.useMutation({
    onSuccess: () => {
      toast.success("Department updated successfully");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update department");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const departmentData = {
      name: formData.name,
      description: formData.description,
      headId: formData.headId && formData.headId !== "none" ? formData.headId : undefined,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
      salaryRangeMin: formData.salaryRangeMin === "" ? null : Number(formData.salaryRangeMin),
      salaryRangeMax: formData.salaryRangeMax === "" ? null : Number(formData.salaryRangeMax),
      isActive: formData.isActive,
    };

    if (initialData?.id) {
      updateDepartmentMutation.mutate({
        id: initialData.id,
        ...departmentData,
      });
    } else {
      createDepartmentMutation.mutate(departmentData);
    }
  };

  const isLoading = createDepartmentMutation.isPending || updateDepartmentMutation.isPending;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department Name */}
        <div className="space-y-2">
          <Label htmlFor="departmentName">Department Name *</Label>
          <Input
            id="departmentName"
            placeholder="e.g., Engineering, Sales, HR"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Department Head */}
        <div className="space-y-2">
          <Label htmlFor="headId">Department Head</Label>
          <Select value={formData.headId || "none"} onValueChange={(value) => setFormData({ ...formData, headId: value === "none" ? "" : value })}>
            <SelectTrigger id="headId">
              <SelectValue placeholder="Select department head" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {employees.map((emp: any) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget">Annual Budget (Ksh)</Label>
          <Input
            id="budget"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryRangeMin">Minimum Salary (Ksh)</Label>
          <Input
            id="salaryRangeMin"
            type="number"
            min="0"
            value={formData.salaryRangeMin}
            onChange={(e) => setFormData({ ...formData, salaryRangeMin: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salaryRangeMax">Maximum Salary (Ksh)</Label>
          <Input
            id="salaryRangeMax"
            type="number"
            min="0"
            value={formData.salaryRangeMax}
            onChange={(e) => setFormData({ ...formData, salaryRangeMax: e.target.value })}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, isActive: value === "active" })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add department details, responsibilities, etc..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Form Actions */}
      <div className={`flex gap-2 ${isModal ? "justify-end" : "justify-end pt-4 border-t"}`}>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? "Update Department" : "Create Department"}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {initialData ? "Edit Department" : "Create New Department"}
        </CardTitle>
        <CardDescription>
          {initialData ? "Update department details" : "Add a new department to your organization"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
