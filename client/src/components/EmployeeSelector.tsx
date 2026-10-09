import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { SearchableSelect } from "@/components/SearchableSelect";

interface EmployeeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  filter?: (employee: any) => boolean;
  label?: string;
  required?: boolean;
  id?: string;
}

/**
 * Reusable Employee Selector Component
 * Fetches employees from database and provides a searchable select dropdown
 */
export function EmployeeSelector({
  value,
  onChange,
  placeholder = "Select employee...",
  disabled = false,
  filter,
  label,
  required = false,
  id,
}: EmployeeSelectorProps) {
  // Fetch employees from backend
  const { data: employees = [], isLoading } = trpc.employees.list.useQuery({});

  // Filter employees based on provided filter function
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return filter ? employees.filter(filter) : employees;
  }, [employees, filter]);
  const options = filteredEmployees.map((employee: any) => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
    keywords: [employee.department, employee.email, employee.employeeNumber].filter(Boolean).join(" "),
  }));

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <SearchableSelect
        value={value}
        id={id}
        options={options}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search employees..."
        emptyMessage="No employees found."
        disabled={disabled}
        isLoading={isLoading}
        required={required}
      />
    </div>
  );
}

export default EmployeeSelector;
