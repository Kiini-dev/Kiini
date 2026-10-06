import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { format } from "date-fns";

interface WarrantyRecord {
  id: string;
  warrantyNumber: string;
  product: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function OrgWarranty() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  const canViewAssets = hasAccess('org:assets:view');

  const [, navigate] = useLocation();
  const { hasPermission } = useOrgPermission();
  const canCreate = hasPermission("warranty");
  const canEdit = hasPermission("warranty");
  const canDelete = hasPermission("warranty");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch warranty data
  const { data: warrantyData = [], isLoading: isLoadingWarranty } = trpc.warranty.list.useQuery(undefined);

  const utils = trpc.useUtils();

  const deleteWarrantyMutation = trpc.warranty.delete.useMutation({
    onSuccess: () => {
      utils.warranty.list.invalidate?.();
      toast.success("Warranty deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete warranty");
    },
  });

  // Transform data
  const plainWarrantyData = Array.isArray(warrantyData)
    ? warrantyData.map((w: any) => JSON.parse(JSON.stringify(w)))
    : [];

  const warranties: WarrantyRecord[] = useMemo(() => {
    return (plainWarrantyData as any[]).map((w: any) => ({
      id: w.id,
      warrantyNumber: w.warrantyNumber || `WRN-${w.id.slice(0, 8)}`,
      product: w.product || w.productName || "Unknown",
      status: w.status || "active",
      startDate: w.startDate ? format(new Date(w.startDate), "yyyy-MM-dd") : "",
      endDate: w.endDate ? format(new Date(w.endDate), "yyyy-MM-dd") : "",
    }));
  }, [plainWarrantyData]);

  const filtered = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch =
        warranty.warrantyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warranty.product.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || warranty.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warranties, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = warranties.filter((w) => w.status === "active").length;
    const expired = warranties.filter((w) => w.status === "expired").length;
    const voided = warranties.filter((w) => w.status === "voided").length;
    return { active, expired, voided, count: warranties.length };
  }, [warranties]);

  const handleView = (id: string) => {
    navigate(`/org/${slug}/warranty/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/org/${slug}/warranty/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this warranty?")) {
      deleteWarrantyMutation.mutate(id);
    }
  };

  const handleNewWarranty = () => {
    navigate(`/org/${slug}/warranty/new`);
  };

  return (
    <OrgLayout>
      <OrgBreadcrumb
        items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: "Warranty", href: `/org/${slug}/warranty` },
        ]}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warranty Management</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage product warranties
            </p>
          </div>
          {canCreate && (
            <Button onClick={handleNewWarranty}>
              <Plus className="h-4 w-4 mr-2" />
              New Warranty
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Warranties"
            value={stats.count}
            icon={<Shield className="h-4 w-4 text-blue-500" />}
            color="border-l-blue-500"
          />
          <StatsCard
            label="Active"
            value={stats.active}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            color="border-l-emerald-500"
          />
          <StatsCard
            label="Expired"
            value={stats.expired}
            icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
            color="border-l-amber-500"
          />
          <StatsCard
            label="Voided"
            value={stats.voided}
            icon={<AlertCircle className="h-4 w-4 text-red-500" />}
            color="border-l-red-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by warranty # or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="voided">Voided</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Warranties List</CardTitle>
            <CardDescription>{filtered.length} warranties</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWarranty ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                <p>No warranties found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warranty #</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((warranty) => (
                      <TableRow key={warranty.id}>
                        <TableCell className="font-mono text-sm">{warranty.warrantyNumber}</TableCell>
                        <TableCell>{warranty.product}</TableCell>
                        <TableCell>{warranty.startDate}</TableCell>
                        <TableCell>{warranty.endDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              warranty.status === "active"
                                ? "default"
                                : warranty.status === "expired"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {warranty.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(warranty.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(warranty.id)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(warranty.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </OrgLayout>
  );
}
