/**
 * Location Select Components
 * Provides scrollable dropdown selects for Country, County, and City/Town
 */

import { SearchableSelect } from "@/components/SearchableSelect";

import { Label } from "@/components/ui/label";
import {
  COUNTRIES,
  KENYAN_COUNTIES_NAMES,
  KENYAN_CITIES,
  getCitiesByCounty,
  INDUSTRIES,
} from "@/data/locations";

interface LocationSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function CountrySelect({
  id,
  value,
  onChange,
  placeholder = "Select a country",
  label,
  required,
}: LocationSelectProps) {
  const options = [...new Set([...COUNTRIES, ...(value && !COUNTRIES.includes(value) ? [value] : [])])]
    .map((country) => ({ value: country, label: country }));

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value}
        options={options}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search countries..."
        emptyMessage="No countries found."
        required={required}
      />
    </div>
  );
}

export function CountySelect({
  id,
  value,
  onChange,
  placeholder = "Select a county",
  label,
  required,
}: LocationSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value}
        options={[...new Set([...KENYAN_COUNTIES_NAMES, ...(value && !KENYAN_COUNTIES_NAMES.includes(value) ? [value] : [])])]
          .map((county) => ({ value: county, label: county }))}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search counties..."
        emptyMessage="No counties found."
        required={required}
      />
    </div>
  );
}

interface CitySelectProps extends LocationSelectProps {
  county?: string;
}

export function CitySelect({
  id,
  value,
  onChange,
  county,
  placeholder = "Select a city/town",
  label,
  required,
}: CitySelectProps) {
  const cities = county ? getCitiesByCounty(county) : [];
  const availableCities = cities.length > 0 ? cities : KENYAN_CITIES;
  const options = [...new Set([...availableCities, ...(value && !availableCities.includes(value) ? [value] : [])])]
    .map((city) => ({ value: city, label: city }));

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value}
        options={options}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search cities and towns..."
        emptyMessage="No cities or towns found."
        required={required}
      />
    </div>
  );
}

interface IndustrySelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function IndustrySelect({
  id,
  value,
  onChange,
  placeholder = "Select industry",
  label,
  required,
}: IndustrySelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value || ""}
        options={[...new Set([...INDUSTRIES, ...(value && !INDUSTRIES.includes(value) ? [value] : [])])]
          .map((industry) => ({ value: industry, label: industry }))}
        onValueChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Search industries..."
        emptyMessage="No industries found."
        required={required}
      />
    </div>
  );
}
