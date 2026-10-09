import { SearchableSelect } from "@/components/SearchableSelect";
import { PHONE_COUNTRY_CODES } from "@/data/locations";

interface CountryCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

const countryCodeOptions = Array.from(
  new Map(PHONE_COUNTRY_CODES.map((phoneCode) => [phoneCode.code, phoneCode])).values(),
).map((phoneCode) => ({
  value: phoneCode.code,
  label: `${phoneCode.flag} ${phoneCode.code}`,
  keywords: phoneCode.country,
}));

export function CountryCodeSelect({ value, onValueChange, disabled, id }: CountryCodeSelectProps) {
  const options = value && !countryCodeOptions.some((option) => option.value === value)
    ? [{ value, label: value }, ...countryCodeOptions]
    : countryCodeOptions;

  return (
    <SearchableSelect
      id={id}
      value={value}
      options={options}
      onValueChange={onValueChange}
      placeholder="+254"
      searchPlaceholder="Search country or code..."
      emptyMessage="No country codes found."
      disabled={disabled}
      ariaLabel="Country calling code"
    />
  );
}
