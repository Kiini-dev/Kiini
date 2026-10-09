import { useState } from "react";
import { useLocation } from "wouter";
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
import { UserPlus, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";
import { resolveInitialPassword } from "../../../utils/accountSecurity";

// Simple password generator for client-side use
function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()';
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export default function CreateUser() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAutoPassword, setUseAutoPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  // Fetch departments, employees, and roles
  const { data: workflowOptions } = trpc.departments.getWorkflowOptions.useQuery();
  const departments = workflowOptions?.departments || [];
  const { data: employees = [] } = trpc.employees.list.useQuery({});
  const roles = workflowOptions?.roles || [];
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
  });

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      setLocation("/admin/management");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
      setIsSubmitting(false);
    },
  });

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

  const handleDepartmentChange = (value: string) => {
    setFormData({ ...formData, department: value });
  };

  const handleEmployeeChange = (value: string) => {
    setFormData({ ...formData, employeeId: value });
  };

  const handleAutoGeneratePassword = () => {
    const generated = generatePassword(14);
    setFormData({
      ...formData,
      password: generated,
      confirmPassword: generated,
    });
    setUseAutoPassword(true);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(formData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
      toast.success("Password copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy password");
    }
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

    const finalPassword = resolveInitialPassword(formData.password);

    if (!formData.password && !formData.confirmPassword) {
      setFormData({ ...formData, password: finalPassword, confirmPassword: finalPassword });
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const normalizedPassword = formData.password || finalPassword;
    if (normalizedPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!formData.password) {
      setFormData({ ...formData, password: normalizedPassword, confirmPassword: normalizedPassword });
    }

    setIsSubmitting(true);

    try {
      await mutateAsync(createUserMutation, {
        name: formData.name,
        email: formData.email,
        password: normalizedPassword,
        role: formData.role as "super_admin" | "admin" | "hr" | "accountant" | "project_manager" | "ict_manager" | "procurement_manager" | "staff" | "client",
        customRoleId: formData.customRoleId || undefined,
        isActive: formData.isActive,
        position: formData.position || undefined,
        department: formData.department || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        employeeId: formData.employeeId || undefined,
        clientId: formData.clientId || undefined,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const selectedCustomRole = (roles as unknown as any[]).find((role: any) => role.id === formData.customRoleId) as any;

  return (
    <ModuleLayout
      title="Create User"
      description="Fill in the details below to create a new system user"
      icon={<UserPlus className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Admin", href: "/admin/management" },
        { label: "Users", href: "/admin/management" },
        { label: "Create" },
      ]}
      backLink={{ label: "Users", href: "/admin/management" }}
    >
      <div className="space-y-6">

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new system user
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
                    Custom role selected: {selectedCustomRole?.displayName}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAutoGeneratePassword}
                    className="gap-1 text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Auto-Generate
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password (min. 8 characters) or leave blank to auto-generate"
                    value={formData.password}
                    onChange={handleChange}
                    required={false}
                  />
                  {formData.password && useAutoPassword && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPassword}
                      className="flex-shrink-0"
                    >
                      {passwordCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                {useAutoPassword && (
                  <p className="text-xs text-blue-600">
                    Auto-generated password ready to copy
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* User Details Section */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold mb-4">User Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Position */}
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Job Title</Label>
                    <Input
                      id="position"
                      name="position"
                      type="text"
                      placeholder="e.g., Senior Developer"
                      value={formData.position}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={handleDepartmentChange}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.name || dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <PhoneInput id="phone" value={formData.phone} onChange={(phone) => setFormData({ ...formData, phone })} placeholder="700 000 000" />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <CountrySelect value={formData.country} onChange={(country) => setFormData({ ...formData, country })} />
                  </div>

                  {/* Link to Employee */}
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Link to Employee (Optional)</Label>
                    <Select value={formData.employeeId} onValueChange={handleEmployeeChange}>
                      <SelectTrigger id="employeeId">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No employee link</SelectItem>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <ClientSelector id="clientId" label="Link to Client (Optional)" value={formData.clientId} onChange={(clientId) => setFormData({ ...formData, clientId })} includeUnassigned placeholder="Select client" />
                  </div>
                </div>
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
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/crm/super-admin")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
