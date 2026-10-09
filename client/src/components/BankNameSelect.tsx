import { SearchableSelect } from "@/components/SearchableSelect";

export const BANK_NAME_OPTIONS = [
  "KCB Bank",
  "Equity Bank",
  "Co-operative Bank",
  "ABSA Bank",
  "Standard Chartered",
  "NCBA Bank",
  "I&M Bank",
  "Diamond Trust Bank",
  "Stanbic Bank",
  "Family Bank",
  "M-Pesa",
  "Other",
] as const;

type BankNameSelectProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  extraOptions?: string[];
};

export function BankNameSelect({
  id,
  value,
  onValueChange,
  placeholder = "Select bank",
  extraOptions = [],
}: BankNameSelectProps) {
  const options = [...new Set([...BANK_NAME_OPTIONS, ...extraOptions.filter(Boolean), ...(value ? [value] : [])])];

  return (
    <SearchableSelect
      id={id}
      value={value}
      options={options.map((bank) => ({ value: bank, label: bank }))}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search banks..."
      emptyMessage="No banks found."
    />
  );
}
