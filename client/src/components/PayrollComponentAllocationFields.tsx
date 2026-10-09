import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";

type Props = {
  departmentIdOverride: string;
  glAccountId: string;
  accountKind: "expense" | "liability";
  onDepartmentChange: (value: string) => void;
  onAccountChange: (value: string) => void;
};

export function PayrollComponentAllocationFields({
  departmentIdOverride,
  glAccountId,
  accountKind,
  onDepartmentChange,
  onAccountChange,
}: Props) {
  const { data: departments = [] } = trpc.departments.list.useQuery({});
  const { data: allAccounts = [] } = trpc.chartOfAccounts.list.useQuery({ limit: 500 });
  const accounts = allAccounts.filter((account: any) => accountKind === "liability"
    ? account.accountType === "liability"
    : ["expense", "operating expense", "cost of goods sold", "other expense"].includes(account.accountType));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Department override (optional)</Label>
        <Select value={departmentIdOverride || "employee"} onValueChange={(value) => onDepartmentChange(value === "employee" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Use employee department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Use employee department</SelectItem>
            {departments.map((department: any) => (
              <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>GL Account Code (optional)</Label>
        <ChartOfAccountsSelector
          accounts={accounts}
          value={glAccountId}
          onChange={onAccountChange}
          placeholder="Use payroll GL mapping"
          noneLabel="Use payroll GL mapping"
        />
      </div>
    </div>
  );
}
