import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/SearchableSelect";
import { trpc } from "@/lib/trpc";

interface ClientSelectorProps {
  id?: string;
  value: string;
  onChange: (clientId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  includeUnassigned?: boolean;
}

interface ClientOptionRecord {
  id: string | number;
  companyName?: string | null;
  name?: string | null;
  businessName?: string | null;
  contactPerson?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export function ClientSelector({
  id,
  value,
  onChange,
  label = "Client",
  placeholder = "Select a client...",
  required = false,
  disabled = false,
  includeUnassigned = false,
}: ClientSelectorProps) {
  const { data: clientsData = [], isLoading } = trpc.clients.list.useQuery({});
  const clientPayload = clientsData as
    | ClientOptionRecord[]
    | { items?: ClientOptionRecord[]; clients?: ClientOptionRecord[] };
  const clients = Array.isArray(clientPayload)
    ? clientPayload
    : clientPayload.items ?? clientPayload.clients ?? [];
  const options = useMemo(() => {
    const choices = clients.map((client) => ({
      value: String(client.id),
      label: client.companyName || client.name || client.businessName || client.contactPerson
        || [client.firstName, client.lastName].filter(Boolean).join(" ")
        || client.email || "Unnamed client",
      keywords: [client.email, client.contactPerson, client.firstName, client.lastName, client.businessName]
        .filter(Boolean)
        .join(" "),
    }));
    if (includeUnassigned) choices.unshift({ value: "__unassigned__", label: "No client link", keywords: "" });
    if (value && value !== "__unassigned__" && !choices.some((client) => client.value === value)) {
      choices.push({ value, label: `Unavailable client (${value})`, keywords: "" });
    }
    return choices;
  }, [clients, includeUnassigned, value]);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value || (includeUnassigned ? "__unassigned__" : "")}
        options={options}
        onValueChange={(clientId) => onChange(clientId === "__unassigned__" ? "" : clientId)}
        placeholder={placeholder}
        searchPlaceholder="Search clients..."
        emptyMessage="No clients found."
        isLoading={isLoading}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
