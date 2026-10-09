import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/SearchableSelect";
import { trpc } from "@/lib/trpc";

interface SupplierSelectorProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (supplierName: string, supplierId?: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  valueMode?: "name" | "id";
}

export function SupplierSelector({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = "Enter or select a supplier",
  disabled = false,
  valueMode = "name",
}: SupplierSelectorProps) {
  const { data: suppliersData = [], isLoading } = trpc.suppliers.list.useQuery({ limit: 500 });
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];
  const matchedSupplier = suppliers.find(
    (item: any) => (item.companyName || item.name)?.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase(),
  );
  const options = suppliers.map((supplier: any) => ({
    value: supplier.id,
    label: supplier.companyName || supplier.name || supplier.email || "Unnamed supplier",
    keywords: supplier.email || "",
  }));
  const handleChange = (selectedValue: string) => {
    const supplier = suppliers.find((item: any) => item.id === selectedValue);
    if (supplier) {
      onChange(valueMode === "id" ? supplier.id : supplier.companyName || supplier.name || "", supplier.id);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label ?? "Supplier"}
        {required ? " *" : null}
      </Label>
      <SearchableSelect
        id={id}
        value={valueMode === "id" ? value : matchedSupplier?.id ?? value}
        options={options}
        onValueChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        isLoading={isLoading}
        searchPlaceholder="Search suppliers..."
        emptyMessage="No suppliers found."
        allowCustomValue={valueMode === "name"}
        customValueLabel={(name) => `Use "${name}" as the supplier`}
        required={required}
      />
    </div>
  );
}
