import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupplierSelector } from "@/components/SupplierSelector";

interface ContractPartyFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}

export function ContractPartyField({ value, onChange, inputClassName }: ContractPartyFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="contract-party-name">Counterparty / Party Name *</Label>
      <Input
        id="contract-party-name"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type any person or organization name"
        className={inputClassName}
        required
      />
      <p className="text-xs text-muted-foreground">Enter a custom name, or select an existing supplier below.</p>
      <SupplierSelector
        label="Select an existing supplier (optional)"
        value={value}
        onChange={onChange}
        placeholder="Search suppliers..."
      />
    </div>
  );
}
