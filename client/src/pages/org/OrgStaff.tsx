import React, { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { OrgModuleLayout } from "@/components/OrgModuleLayout";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Search, Eye, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useOrgAccess } from "@/hooks/useOrgAccess";

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  admin: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  manager: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  accountant: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  hr: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  staff: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  project_manager: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  sales_manager: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  ict_manager: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  procurement_manager: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export default function OrgStaff() {
  const params = useParams();
  const slug = params.slug as string;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { hasAccess } = useOrgAccess();

  const canViewStaff = hasAccess("org:employees:view");
  const canManageStaff = hasAccess("org:employees:create");

  const { data, isLoading, refetch } = trpc.multiTenancy.getMyOrgUsers.useQuery(undefined, {
    enabled: !!user?.organizationId && canViewStaff,
  });

  const removeMutation = trpc.multiTenancy.removeOrgUser.useMutation({
    onSuccess: () => {
      toast.success("User removed");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const staff = data?.users ?? [];

  const filtered = useMemo(() => {
    return staff.filter((member: any) => {
      const searchLower = search.toLowerCase();
      return (
        member.name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.role?.toLowerCase().includes(searchLower)
      );
    });
  }, [staff, search]);

  const summaryStats: SummaryCard[] = [
    { label: "Total Staff", value: String(staff.length), trend: undefined },
    { label: "Active", value: String(staff.filter((s: any) => s.isActive).length), trend: undefined },
    { label: "Inactive", value: String(staff.filter((s: any) => !s.isActive).length), trend: undefined },
    { label: "Admins", value: String(staff.filter((s: any) => s.role === "admin" || s.role === "super_admin").length), trend: undefined },
  ];

  const handleView = (id: string) => {
    navigate(`/org/${slug}/staff/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/org/${slug}/staff/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    const member = staff.find((s: any) => s.id === id);
    if (confirm(`Are you sure you want to remove ${member?.name} from the organization?`)) {
      removeMutation.mutate({ userId: id });
    }
  };

  const handleNewStaff = () => {
    navigate(`/org/${slug}/staff/new`);
  };

  const isOrgAdmin = canManageStaff && canViewStaff;

  return (
    <OrgModuleLayout
      title="Staff Management"
      description="Manage organization staff members and their roles"
      icon={Users}
      breadcrumbs={[
        { label: "Dashboard", href: `/org/${slug}/dashboard` },
        { label: "Staff" },
      ]}
      actions={
        isOrgAdmin && (
          <Button size="sm" onClick={handleNewStaff}>
            <Plus className="h-4 w-4 mr-1" /> Add Staff
          </Button>
        )
      }
      backLink={`/org/${slug}/dashboard`}
      hasAccess={isOrgAdmin}
      accessDeniedMessage="Only organization administrators can manage staff. Please contact your administrator."
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <SummaryStatCards cards={summaryStats} isLoading={isLoading} />

        {/* Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Staff Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{search ? "No staff match your search" : "No staff members yet"}</p>
                {isOrgAdmin && (
                  <Button className="mt-4" size="sm" onClick={handleNewStaff}>
                    <Plus className="h-4 w-4 mr-1" /> Add First Staff Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((member: any) => (
                      <TableRow key={member.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold">{member.name}</TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={ROLE_COLORS[member.role] ?? "bg-muted text-muted-foreground"}>
                            {member.role?.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-500">
                              <XCircle className="h-3.5 w-3.5" /> Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(member.id)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isOrgAdmin && member.id !== user?.id && member.role !== "super_admin" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(member.id)} title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} title="Remove">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrgModuleLayout>
  );
}
