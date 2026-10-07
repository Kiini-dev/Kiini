import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

interface EmployeeNameSelectorProps {
  label?: string;
  value: string;
  onChange: (employeeName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function EmployeeNameSelector({
  label,
  value,
  onChange,
  placeholder = "Enter or select an employee",
  disabled = false,
  required = false,
}: EmployeeNameSelectorProps) {
  const inputId = useId();
  const employeeListId = useId();
  const { data: employees = [] } = trpc.employees.list.useQuery({});

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label ?? "Employee"}
        {required ? " *" : null}
      </Label>
      <Input
        id={inputId}
        aria-label={label ?? "Employee"}
        list={employeeListId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
      <datalist id={employeeListId}>
        {employees.map((employee) => {
          const name = [employee.firstName, employee.lastName].filter(Boolean).join(" ");
          return name ? <option key={employee.id} value={name} /> : null;
        })}
      </datalist>
    </div>
  );
}
