import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/PhoneInput";
import { CountrySelect } from "@/components/LocationSelects";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ArrowLeft, Loader2, Trash2, Edit } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function EditUser() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff",
    customRoleId: "",
    isActive: true,
    position: "",
    department: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    employeeId: "",
    clientId: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user data, roles, departments, and employees
  const { data: userData, isLoading } = trpc.users.getById.useQuery(id || "");
  const { data: workflowOptions } = trpc.departments.getWorkflowOptions.useQuery();
  const roles = workflowOptions?.roles || [];
  const departments = workflowOptions?.departments || [];
  const { data: employees = [] } = trpc.employees.list.useQuery({});

  // Update user mutation
  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setLocation("/crm/super-admin");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
      setIsSubmitting(false);
    },
  });

  // Delete user mutation
  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      setLocation("/crm/super-admin");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
      setIsDeleting(false);
    },
  });

  // Populate form when user data loads
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "staff",
        customRoleId: userData.customRoleId || "",
        isActive: userData.isActive !== false,
        position: (userData as any).position || "",
        department: (userData as any).department || "",
        phone: (userData as any).phone || "",
        address: (userData as any).address || "",
        city: (userData as any).city || "",
        country: (userData as any).country || "",
        employeeId: (userData as any).employeeId || "",
        clientId: (userData as any).clientId || "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Password validation if changing password
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await mutateAsync(updateUserMutation, {
        id: id || "",
        name: formData.name,
        email: formData.email,
        role: formData.role as "super_admin" | "admin" | "hr" | "accountant" | "project_manager" | "ict_manager" | "procurement_manager" | "staff" | "client",
        customRoleId: formData.customRoleId || undefined,
        isActive: formData.isActive,
        position: formData.position || undefined,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        password: formData.newPassword || undefined,
        clientId: formData.clientId || undefined,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteUserMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Edit User"
        icon={<Edit className="w-5 h-5" />}
        backLink={{ label: "Users", href: "/admin/management" }}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/management" },
          { label: "Edit" },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading user...</p>
          </div>
        </div>
      </ModuleLayout>
    );
  }

  if (!userData) {
    return (
      <ModuleLayout
        title="Edit User"
        icon={<Edit className="w-5 h-5" />}
        backLink={{ label: "Users", href: "/admin/management" }}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/management" },
          { label: "Edit" },
        ]}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>User not found</p>
          <Button onClick={() => setLocation("/crm/super-admin")}>
            Back to Dashboard
          </Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit User"
      description="Update user details"
      icon={<Edit className="w-5 h-5" />}
      backLink={{ label: "Users", href: "/admin/management" }}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Admin", href: "/admin" },
        { label: "Users", href: "/admin/management" },
        { label: "Edit" },
      ]}
    >
      <div className="space-y-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update the user details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.customRoleId || formData.role} onValueChange={(value) => {
                  if (value.startsWith('custom_')) {
                    setFormData({ ...formData, customRoleId: value, role: "staff" });
                  } else {
                    setFormData({ ...formData, customRoleId: "", role: value });
                  }
                }}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">System Roles</div>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="ict_manager">ICT Manager</SelectItem>
                    <SelectItem value="procurement_manager">Procurement Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    {roles.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Custom Roles</div>
                        {roles
                          .filter((role: any) => role.isCustom)
                          .map((role: any) => (
                            <SelectItem key={role.id} value={`custom_${role.id}`}>
                              {role.displayName} {role.isAdvanced && "(Advanced)"}
                            </SelectItem>
                          ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {formData.customRoleId && (
                  <p className="text-xs text-blue-600">
                    Custom role selected: {roles.find((r: any) => r.id === formData.customRoleId)?.displayName}
                  </p>
                )}
              </div>

              {/* Department Field */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Field */}
              <div className="space-y-2">
                <Label htmlFor="position">Position/Job Title</Label>
                <Input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="e.g., Senior Manager"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput id="phone" value={formData.phone} onChange={(phone) => setFormData({ ...formData, phone })} placeholder="700 000 000" />
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* City Field */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Nairobi"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Country Field */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <CountrySelect value={formData.country} onChange={(country) => setFormData({ ...formData, country })} />
              </div>

              {/* Employee Linking */}
              <div className="space-y-2">
                <ClientSelector id="clientId" label="Link Client" value={formData.clientId} onChange={(clientId) => setFormData({ ...formData, clientId })} includeUnassigned placeholder="Select a client (optional)" />
              </div>

              {/* Employee Linking */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">Link Employee</Label>
                <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                  <SelectTrigger id="employeeId">
                    <SelectValue placeholder="Select an employee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password (optional)</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  User is active
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/crm/super-admin")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2 ml-auto"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isSubmitting || isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </ModuleLayout>
  );
}
