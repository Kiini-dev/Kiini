import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface UserSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  includeUnassigned?: boolean;
}

export function UserSelector({ value, onChange, placeholder = "Select user...", disabled = false, label, includeUnassigned = true }: UserSelectorProps) {
  const { data: usersData = [], isLoading } = trpc.users.list.useQuery({});
  const users = useMemo(() => Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? [], [usersData]);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select value={value || "__unassigned__"} onValueChange={(nextValue) => onChange(nextValue === "__unassigned__" ? "" : nextValue)} disabled={disabled || isLoading}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4"><Spinner className="h-4 w-4" /></div>
          ) : (
            <>
              {includeUnassigned && <SelectItem value="__unassigned__">Unassigned</SelectItem>}
              {users.map((user: any) => <SelectItem key={user.id} value={user.id}>{user.name || user.email || user.id}</SelectItem>)}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export default UserSelector;