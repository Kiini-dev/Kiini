import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Percent } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { EmployeeSelector } from "@/components/EmployeeSelector";
import mutateAsync from "@/lib/mutationHelpers";
import { PayrollComponentAllocationFields } from "@/components/PayrollComponentAllocationFields";
import { toMinorCurrencyAmount } from "../../../shared/currency";

const ALLOWANCE_TYPES = [
  "House Allowance",
  "Transport Allowance",
  "Meal Allowance",
  "Phone Allowance",
  "Internet Allowance",
  "Responsibility Allowance",
  "Special Allowance",
  "Other",
];

export default function CreateAllowance() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    employeeId: "",
    allowanceType: "",
    amount: "",
    frequency: "monthly" as "monthly" | "quarterly" | "annual" | "one_time",
    departmentIdOverride: "",
    glAccountId: "",
    notes: "",
  });


  const createMutation = trpc.payroll.allowances.create.useMutation({
    onSuccess: () => {
      toast.success("Allowance created successfully!");
      utils.payroll.allowances.list.invalidate();
      navigate("/payroll");
    },
    onError: (error) => {
      toast.error(`Failed to create allowance: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.allowanceType || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await mutateAsync(createMutation, {
        employeeId: formData.employeeId,
        allowanceType: formData.allowanceType,
        amount: toMinorCurrencyAmount(formData.amount),
        frequency: formData.frequency,
        departmentIdOverride: formData.departmentIdOverride || undefined,
        glAccountId: formData.glAccountId || undefined,
        notes: formData.notes || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Create Salary Allowance"
      description="Add a new salary allowance for an employee"
      icon={<Percent className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Payroll", href: "/payroll" },
        { label: "Create Allowance" },
      ]}
      actions={
        <Button variant="outline" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>
      }
    >
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Allowance Details</CardTitle>
            <CardDescription>
              Create a new salary allowance for an employee (house, transport, meals, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <EmployeeSelector
                  id="employeeId"
                  label=""
                  value={formData.employeeId}
                  onChange={(employeeId) => setFormData({ ...formData, employeeId })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowanceType">Allowance Type *</Label>
                <Select value={formData.allowanceType} onValueChange={(value) => setFormData({ ...formData, allowanceType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select allowance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOWANCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <PayrollComponentAllocationFields
                departmentIdOverride={formData.departmentIdOverride}
                glAccountId={formData.glAccountId}
                accountKind="expense"
                onDepartmentChange={(departmentIdOverride) => setFormData({ ...formData, departmentIdOverride })}
                onAccountChange={(glAccountId) => setFormData({ ...formData, glAccountId })}
              />

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this allowance"
                  rows={3}
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/payroll")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || createMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {(isLoading || createMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Allowance
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
