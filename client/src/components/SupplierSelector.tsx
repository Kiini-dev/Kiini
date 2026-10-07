import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

interface SupplierSelectorProps {
  label?: string;
  value: string;
  onChange: (supplierName: string, supplierId?: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function SupplierSelector({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Enter or select a supplier",
  disabled = false,
}: SupplierSelectorProps) {
  const inputId = useId();
  const supplierListId = useId();
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery({ limit: 500 });

  const handleChange = (supplierName: string) => {
    const normalizedName = supplierName.trim().toLocaleLowerCase();
    const supplier = suppliers.find(
      (item) => item.companyName?.trim().toLocaleLowerCase() === normalizedName,
    );
    onChange(supplierName, supplier?.id);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label ?? "Supplier"}
        {required ? " *" : null}
      </Label>
      <Input
        id={inputId}
        aria-label={label ?? "Supplier"}
        list={supplierListId}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      <datalist id={supplierListId}>
        {suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.companyName} />
        ))}
      </datalist>
    </div>
  );
}
