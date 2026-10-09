import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/SearchableSelect";
import { trpc } from "@/lib/trpc";

interface EmployeeNameSelectorProps {
  label?: string;
  value: string;
  onChange: (employeeName: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export function EmployeeNameSelector({
  label,
  value,
  onChange,
  placeholder = "Enter or select an employee",
  disabled = false,
  required = false,
  id,
}: EmployeeNameSelectorProps) {
  const { data: employeesData = [], isLoading } = trpc.employees.list.useQuery({});
  const employees = Array.isArray(employeesData) ? employeesData : [];
  const options = employees.flatMap((employee: any) => {
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(" ");
    return name ? [{ value: employee.id, label: name, keywords: employee.email || employee.employeeNumber || "" }] : [];
  });
  const selectedEmployee = options.find((option) => option.label === value);
  const legacyValue = value && !selectedEmployee ? `__legacy_employee__${value}` : "";

  const handleChange = (selectedValue: string) => {
    if (selectedValue.startsWith("__legacy_employee__")) {
      onChange(selectedValue.slice("__legacy_employee__".length));
      return;
    }
    const employee = options.find((option) => option.value === selectedValue);
    if (employee) onChange(employee.label);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label ?? "Employee"}
        {required ? " *" : null}
      </Label>
      <SearchableSelect
        id={id}
        value={selectedEmployee?.value ?? legacyValue}
        options={[...options, ...(legacyValue ? [{ value: legacyValue, label: value }] : [])]}
        onValueChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        isLoading={isLoading}
        searchPlaceholder="Search employees..."
        emptyMessage="No employees found."
        required={required}
      />
    </div>
  );
}
