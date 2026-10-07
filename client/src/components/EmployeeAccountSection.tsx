import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type EmployeeAccountForm = {
  accountMode: string;
  existingUserId: string;
  role: string;
  customRoleId: string;
  permissionsText: string;
  password: string;
};

type EmployeeAccountSectionProps<T extends EmployeeAccountForm> = {
  formData: T;
  setFormData: (update: (current: T) => T) => void;
  usersData: any[];
  roleOptions: any[];
  includePassword?: boolean;
};

export function EmployeeAccountSection<T extends EmployeeAccountForm>({
  formData,
  setFormData,
  usersData,
  roleOptions,
  includePassword = true,
}: EmployeeAccountSectionProps<T>) {
  const hasAccount = formData.accountMode !== "none";
  const updateRole = (value: string) => {
    const custom = roleOptions.find((role: any) => role.value === value && role.isCustom);
    setFormData((current) => ({
      ...current,
      role: custom ? (custom.baseRole || "staff") : value,
      customRoleId: custom ? value : "",
    }));
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="permissions" disabled={!hasAccount}>Permissions</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Account setup</Label>
            <Select value={formData.accountMode} onValueChange={(value) => setFormData((current) => ({ ...current, accountMode: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No login account</SelectItem>
                <SelectItem value="existing">Link existing user</SelectItem>
                <SelectItem value="create">Create new user account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.accountMode === "existing" ? (
            <div className="space-y-2">
              <Label>Existing user</Label>
              <Select value={formData.existingUserId} onValueChange={(value) => setFormData((current) => ({ ...current, existingUserId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {usersData.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>{user.name} ({user.email}) - {user.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Login role</Label>
              <Select value={formData.customRoleId || formData.role} onValueChange={updateRole} disabled={!hasAccount}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role: any) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {includePassword && formData.accountMode === "create" && (
          <div className="space-y-2">
            <Label>Password (optional)</Label>
            <Input type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} placeholder="Generate temporary password" />
          </div>
        )}
      </TabsContent>
      <TabsContent value="permissions" className="space-y-2 pt-4">
        <Label>Additional permissions</Label>
        <Input
          value={formData.permissionsText}
          onChange={(event) => setFormData((current) => ({ ...current, permissionsText: event.target.value }))}
          placeholder="e.g. reports:view, chat:send"
          disabled={!hasAccount}
        />
        <p className="text-xs text-muted-foreground">Use permission keys separated by commas. Custom roles can add permissions without changing the account role.</p>
      </TabsContent>
    </Tabs>
  );
}
