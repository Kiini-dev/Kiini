import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  isSystem?: boolean;
}

interface CustomRoleCreationUIProps {
  orgId?: string;
  onRoleCreated?: (role: CustomRole) => void;
}

const PERMISSION_CATEGORIES = {
  CRM: [
    { key: "org:crm:view", label: "View CRM" },
    { key: "org:crm:manage", label: "Manage CRM" },
    { key: "org:clients:view", label: "View Clients" },
    { key: "org:clients:create", label: "Create Clients" },
    { key: "org:contacts:view", label: "View Contacts" },
    { key: "org:leads:view", label: "View Leads" },
    { key: "org:pipeline:view", label: "View Sales Pipeline" },
  ],
  Finance: [
    { key: "org:invoicing:view", label: "View Invoices" },
    { key: "org:invoicing:create", label: "Create Invoices" },
    { key: "org:invoicing:approve", label: "Approve Invoices" },
    { key: "org:payments:view", label: "View Payments" },
    { key: "org:payments:record", label: "Record Payments" },
    { key: "org:expenses:view", label: "View Expenses" },
    { key: "org:expenses:create", label: "Create Expenses" },
    { key: "org:accounting:view", label: "View Accounting" },
  ],
  HR: [
    { key: "org:employees:view", label: "View Employees" },
    { key: "org:employees:manage", label: "Manage Employees" },
    { key: "org:attendance:view", label: "View Attendance" },
    { key: "org:attendance:create", label: "Record Attendance" },
    { key: "org:leave:view", label: "View Leave" },
    { key: "org:leave:request", label: "Request Leave" },
    { key: "org:payroll:view", label: "View Payroll" },
    { key: "org:payroll:manage", label: "Manage Payroll" },
  ],
  Projects: [
    { key: "org:projects:view", label: "View Projects" },
    { key: "org:projects:create", label: "Create Projects" },
    { key: "org:projects:manage", label: "Manage Projects" },
    { key: "org:tasks:view", label: "View Tasks" },
    { key: "org:tasks:create", label: "Create Tasks" },
  ],
  Procurement: [
    { key: "org:suppliers:view", label: "View Suppliers" },
    { key: "org:purchase_orders:view", label: "View Purchase Orders" },
    { key: "org:purchase_orders:create", label: "Create Purchase Orders" },
    { key: "org:orders:view", label: "View Orders" },
    { key: "org:orders:create", label: "Create Orders" },
  ],
};

/**
 * Custom Role Creation Component
 * Allows admins to create roles with custom permission combinations
 */
export function CustomRoleCreationUI({ orgId, onRoleCreated }: CustomRoleCreationUIProps) {
  const { hasAccess } = useOrgAccess();
  const [isOpen, setIsOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageRoles = hasAccess("org:settings:manage");

  const createMutation = trpc.roles.createCustomRole.useMutation({
    onSuccess: (role) => {
      toast.success("Role created", { description: `Role "${roleName}" created successfully.` });
      resetForm();
      setIsOpen(false);
      onRoleCreated?.(role);
    },
    onError: (err) => {
      toast.error("Failed to create role", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions(new Set());
  };

  const handlePermissionToggle = (permission: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSelectCategory = (category: string) => {
    const categoryPermissions = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const newPermissions = new Set(selectedPermissions);
    
    categoryPermissions.forEach((perm) => {
      newPermissions.add(perm.key);
    });
    
    setSelectedPermissions(newPermissions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canManageRoles) {
      toast.error("Access denied", { description: "You don't have permission to create roles." });
      return;
    }

    if (!roleName.trim()) {
      toast.error("Missing role name", { description: "Please enter a role name." });
      return;
    }

    if (selectedPermissions.size === 0) {
      toast.error("No permissions selected", { description: "Please select at least one permission." });
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      name: roleName,
      description: roleDescription,
      permissions: Array.from(selectedPermissions),
    });
  };

  if (!canManageRoles) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Create Custom Role
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-96">
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Define a new role with custom permission combinations for your organization.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g., Finance Manager, Project Lead"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                placeholder="Brief description of this role's responsibilities"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              
              <div className="flex gap-2 mb-4">
                {Object.keys(PERMISSION_CATEGORIES).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCategory(category)}
                    className="text-xs border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Select {category}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-48 border border-white/10 rounded-lg p-4 bg-white/5">
                <div className="space-y-3">
                  {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-sm font-semibold text-white/80">{category}</h4>
                      <div className="space-y-2 ml-2">
                        {permissions.map((perm) => (
                          <div key={perm.key} className="flex items-center gap-2">
                            <Checkbox
                              id={perm.key}
                              checked={selectedPermissions.has(perm.key)}
                              onCheckedChange={() => handlePermissionToggle(perm.key)}
                              className="border-white/20"
                            />
                            <label
                              htmlFor={perm.key}
                              className="text-sm text-white/70 cursor-pointer hover:text-white/90"
                            >
                              {perm.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <p className="text-xs text-white/50 mt-2">
                Selected: {selectedPermissions.size} permission{selectedPermissions.size !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-white/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !roleName.trim() || selectedPermissions.size === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Custom Roles List Component
 * Display and manage existing custom roles
 */
export function CustomRolesList() {
  const { hasAccess } = useOrgAccess();
  const { data: roles = [] } = trpc.roles.listCustomRoles.useQuery(undefined, {
    staleTime: 60_000,
  });

  const canManageRoles = hasAccess("org:settings:manage");

  if (!canManageRoles) return null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle>Custom Roles</CardTitle>
        <CardDescription>Roles created specifically for your organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {roles.length === 0 ? (
            <p className="text-sm text-white/50">No custom roles created yet.</p>
          ) : (
            roles.map((role: CustomRole) => (
              <div key={role.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-white">{role.name}</p>
                  <p className="text-xs text-white/60">{role.permissions.length} permissions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-white/50 hover:text-white">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/50 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
