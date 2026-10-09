import { SearchableSelect } from "@/components/SearchableSelect";

export interface ContractTypeOption {
  value: string;
  label: string;
}

interface ContractTypeSelectorProps {
  options: readonly ContractTypeOption[];
  value: string;
  onChange: (contractType: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContractTypeSelector({
  options,
  value,
  onChange,
  placeholder = "Select contract type...",
  disabled = false,
}: ContractTypeSelectorProps) {
  const choices = options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  if (value && !choices.some((option) => option.value === value)) {
    choices.push({ value, label: value });
  }

  return (
    <SearchableSelect
      value={value}
      options={choices}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search contract types..."
      emptyMessage="No contract types found."
      disabled={disabled}
      ariaLabel="Contract type"
    />
  );
}
