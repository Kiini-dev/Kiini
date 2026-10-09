import { SearchableSelect } from "@/components/SearchableSelect";
import type { SearchableSelectOption } from "@/components/SearchableSelect";

export interface ChartOfAccountOption {
  id: string | number;
  accountCode?: string | null;
  accountName?: string | null;
  name?: string | null;
  accountType?: string | null;
}

interface ChartOfAccountsSelectorProps {
  accounts: readonly ChartOfAccountOption[];
  value: string;
  onChange: (accountId: string) => void;
  placeholder?: string;
  noneLabel?: string;
  ariaLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const NONE_VALUE = "__no_chart_account__";

export function ChartOfAccountsSelector({
  accounts,
  value,
  onChange,
  placeholder = "Select an account...",
  noneLabel,
  ariaLabel = "Chart of accounts",
  disabled = false,
  isLoading = false,
}: ChartOfAccountsSelectorProps) {
  const options: SearchableSelectOption[] = accounts.map((account) => {
    const id = String(account.id);
    const code = account.accountCode?.trim();
    const name = account.accountName?.trim() || account.name?.trim() || "Unnamed account";
    return {
      value: id,
      label: code ? `${code} - ${name}` : name,
      keywords: `${account.accountType ?? ""} ${code ?? ""}`,
    };
  });
  if (noneLabel) options.unshift({ value: NONE_VALUE, label: noneLabel });

  const selectedValue = value || (noneLabel ? NONE_VALUE : "");
  if (value && !options.some((option) => option.value === value)) {
    options.push({ value, label: `Unavailable account (${value})` });
  }

  return (
    <SearchableSelect
      value={selectedValue}
      options={options}
      onValueChange={(accountId) => onChange(accountId === NONE_VALUE ? "" : accountId)}
      placeholder={placeholder}
      searchPlaceholder="Search accounts..."
      emptyMessage="No accounts found."
      disabled={disabled}
      isLoading={isLoading}
      ariaLabel={ariaLabel}
    />
  );
}
