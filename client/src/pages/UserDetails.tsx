import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ArrowLeft, Edit2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function UserDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const {
    data: user,
    isLoading,
    error,
  } = trpc.users.getById.useQuery(id || "");
  const { data: linkedEmployee, isLoading: employeeLoading } = trpc.employees.byUserId.useQuery(
    { userId: id || "" },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <ModuleLayout
        title="User Details"
        description="Loading user information"
        backLink={{ label: "Users", href: "/admin/management" }}
      >
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ModuleLayout>
    );
  }

  if (!user || error) {
    return (
      <ModuleLayout
        title="User Details"
        description="Unable to load this user"
        backLink={{ label: "Users", href: "/admin/management" }}
      >
        <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">User not found</p>
          <p className="text-sm text-slate-600">This user may have been removed or you no longer have access.</p>
          <Button onClick={() => setLocation("/admin/management")}>Back to Users</Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="User Details"
      description="Review the full user profile and account settings"
      backLink={{ label: "Users", href: "/admin/management" }}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Admin", href: "/admin/management" },
        { label: "Users", href: "/admin/management" },
        { label: "Details" },
      ]}
    >
      <div className="space-y-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={(user as any).photoUrl || undefined} alt={user.name || user.email || "User"} />
                    <AvatarFallback className="text-lg">
                      {(user.name || user.email || "U")
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Detailed account information for {user.name || user.email}</CardDescription>
                  </div>
                </div>
              </div>
              <code className="w-fit rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">system:{user.id}</code>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setLocation("/admin/management")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setLocation(`/users/${user.id}/edit`)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">Full Name</p>
                <p className="text-base font-medium text-slate-900">{user.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Email</p>
                <p className="text-base font-medium text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Role</p>
                <p className="text-base font-medium text-slate-900">{user.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Status</p>
                <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">Organization</p>
                <p className="text-base font-medium text-slate-900">{user.organizationId || "Global"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Department</p>
                <p className="text-base font-medium text-slate-900">{user.department || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Position</p>
                <p className="text-base font-medium text-slate-900">{(user as any).position || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Phone</p>
                <p className="text-base font-medium text-slate-900">{(user as any).phone || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Contact & Location Details</CardTitle>
            <CardDescription>Address and location information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-gray-500">Address</p>
                <p className="text-base font-medium text-slate-900">{(user as any).address || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">City</p>
                <p className="text-base font-medium text-slate-900">{(user as any).city || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Country</p>
                <p className="text-base font-medium text-slate-900">{(user as any).country || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Linked Employee</p>
                {employeeLoading ? (
                  <p className="text-base font-medium text-slate-500">Loading...</p>
                ) : linkedEmployee ? (
                  <div className="space-y-1">
                    <p className="text-base font-medium text-slate-900">{linkedEmployee.firstName} {linkedEmployee.lastName}</p>
                    <p className="text-sm text-slate-600">{linkedEmployee.employeeNumber || linkedEmployee.id}</p>
                    <Button variant="link" className="h-auto p-0" onClick={() => setLocation(`/employees/${linkedEmployee.id}`)}>Open employee profile</Button>
                  </div>
                ) : (
                  <p className="text-base font-medium text-slate-500">Not linked</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Additional metadata and login information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">Created At</p>
                <p className="text-base font-medium text-slate-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Last Updated</p>
                <p className="text-base font-medium text-slate-900">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Requires Password Change</p>
                <p className="text-base font-medium text-slate-900">{user.requiresPasswordChange ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}

