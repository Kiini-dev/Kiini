/**
 * Enhanced Role Management Component
 * Displays permissions with clear labels, categories, and organized UI
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import {
  PERMISSIONS,
  PERMISSION_CATEGORIES,
  getPermissionsByCategory,
  getAllCategories,
  type PermissionDefinition,
} from "@/lib/permissionDefinitions";

interface EnhancedRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
}

interface EnhancedRoleManagementProps {
  roles: EnhancedRole[];
  onRoleUpdate: (role: EnhancedRole) => void;
  onRoleCreate: (role: Omit<EnhancedRole, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}

export function EnhancedRoleManagement({
  roles,
  onRoleUpdate,
  onRoleCreate,
  isLoading = false,
}: EnhancedRoleManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<EnhancedRole | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.values(PERMISSION_CATEGORIES)[0]
  );

  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    permissions: [] as string[],
  });

  const categories = getAllCategories();
  const selectedPermissions = useMemo(
    () => getPermissionsByCategory(selectedCategory),
    [selectedCategory]
  );

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const search = searchQuery.toLowerCase();
      return (
        role.name.toLowerCase().includes(search) ||
        role.displayName.toLowerCase().includes(search) ||
        (role.description?.toLowerCase() || "").includes(search)
      );
    });
  }, [roles, searchQuery]);

  const handleEditRole = (role: EnhancedRole) => {
    setSelectedRole(role);
    setFormData({
      displayName: role.displayName,
      description: role.description || "",
      permissions: role.permissions,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRole) return;
    if (!formData.displayName.trim()) {
      toast.error("Role display name is required");
      return;
    }

    const updatedRole: EnhancedRole = {
      ...selectedRole,
      displayName: formData.displayName,
      description: formData.description,
      permissions: formData.permissions,
    };

    onRoleUpdate(updatedRole);
    setIsEditOpen(false);
    setSelectedRole(null);
    resetForm();
  };

  const handleCreateRole = () => {
    if (!formData.displayName.trim()) {
      toast.error("Role display name is required");
      return;
    }

    onRoleCreate({
      name: formData.displayName.toLowerCase().replace(/\s+/g, "_"),
      displayName: formData.displayName,
      description: formData.description,
      permissions: formData.permissions,
      isSystem: false,
    });

    setIsCreateOpen(false);
    resetForm();
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const resetForm = () => {
    setFormData({
      displayName: "",
      description: "",
      permissions: [],
    });
  };

  const getPermissionStats = (role: EnhancedRole) => {
    const total = Object.keys(PERMISSIONS).length;
    const assigned = role.permissions.length;
    return { assigned, total };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage roles with granular permission controls
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by role name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => {
          const stats = getPermissionStats(role);
          return (
            <Card
              key={role.id}
              className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleEditRole(role)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {role.isSystem ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-green-500" />
                      )}
                      {role.displayName}
                    </CardTitle>
                    {role.description && (
                      <CardDescription className="mt-1">
                        {role.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">{role.isSystem ? "System" : "Custom"}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Permissions Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissions</span>
                    <span className="font-semibold">
                      {stats.assigned} of {stats.total}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(stats.assigned / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* User Count */}
                {role.userCount !== undefined && role.userCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>{role.userCount}</strong> user{role.userCount !== 1 ? "s" : ""} assigned
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRole(role);
                      setIsEditOpen(true);
                    }}
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {!role.isSystem && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isEditOpen || isCreateOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditOpen(false);
          setIsCreateOpen(false);
          setSelectedRole(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Update role details and permissions"
                : "Set up a new role with specific permissions"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Role Details */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role Details
              </h3>

              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name *</Label>
                <Input
                  id="display-name"
                  placeholder="e.g., Senior Manager"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this role's purpose"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Permissions</h3>

              <Tabs
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="space-y-3 mt-4">
                    {getPermissionsByCategory(category).map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={perm.id}
                          checked={formData.permissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={perm.id}
                            className="text-sm font-medium cursor-pointer leading-tight"
                          >
                            {perm.label}
                          </label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {formData.permissions.includes(perm.id) ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>

              {/* Permission Summary */}
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Total Permissions Selected:
                  </span>
                  <Badge>
                    {formData.permissions.length} / {Object.keys(PERMISSIONS).length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setIsCreateOpen(false);
                setSelectedRole(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRole) {
                  handleSaveEdit();
                } else {
                  handleCreateRole();
                }
              }}
              disabled={isLoading}
            >
              {selectedRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
