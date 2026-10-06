import React, { useEffect, useState } from "react";
import { FileText, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useUserLookup } from "@/hooks/useUserLookup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/ui/stats-card";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";

export default function AuditLogs() {
  const { getUserName } = useUserLookup();
  const [pageSize, setPageSize] = useState(100);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter, pageSize]);

  const { data: rawData, isLoading } = trpc.activityTrail.list.useQuery({
    limit: pageSize,
    page,
    search: search || undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
  });
  const { data: rawStats } = trpc.activityTrail.getStats.useQuery({});
  const { data: actions = [] } = trpc.activityTrail.getActions.useQuery({});

  const rawLogs = Array.isArray(rawData) ? rawData : (rawData as any)?.activities || [];
  const totalCount = (rawData as any)?.total ?? rawLogs.length;
  const logs: any[] = JSON.parse(JSON.stringify(rawLogs));
  const statsObj = rawStats as any;
  const stats: any[] = statsObj?.actions || (Array.isArray(rawStats) ? rawStats : []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const totalEvents = statsObj?.totalActivities ?? totalCount;
  const pageRangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageRangeEnd = Math.min(page * pageSize, totalCount);
  const topAction = stats.length > 0 ? `${stats[0]?.action}: ${stats[0]?.count}` : "N/A";

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      if (logs.length === 0) {
        toast.warning("No audit logs to export");
        return;
      }

      const csvData = logs.map((log: any) => ({
        Timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : "—",
        Action: log.action || "—",
        "Entity Type": log.entityType || "—",
        Description: log.description || "—",
        "User Name": getUserName(log.userId) || "—",
        "User ID": log.userId || "—",
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      exportToCsv(csvData, `audit-logs-${timestamp}`);
      toast.success(`Exported ${logs.length} audit logs`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export audit logs");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      setIsExporting(true);
      if (logs.length === 0) {
        toast.warning("No audit logs to export");
        return;
      }

      const jsonData = logs.map((log: any) => ({
        timestamp: log.timestamp,
        action: log.action,
        entityType: log.entityType,
        description: log.description,
        userId: log.userId,
        userName: getUserName(log.userId),
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${logs.length} audit logs as JSON`);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export audit logs");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ModuleLayout
      title="Audit Logs"
      description="Track all system activity and user actions"
      icon={<FileText className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Administration", href: "/admin" },
        { label: "Audit Logs" },
      ]}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard label="Total Events" value={totalEvents} description="Loaded" color="border-l-blue-500" />
          <StatsCard label="Top Action" value={topAction} description="Most frequent" color="border-l-purple-500" />
          <StatsCard label="Tracked Actions" value={actions.length} description="Event types" color="border-l-green-500" />
        </div>

        {/* Filters & Export */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Filters & Export</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isExporting || logs.length === 0}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                CSV Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={isExporting || logs.length === 0}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                JSON Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map((a: string) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Recent Audit Events</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing {pageRangeStart}-{pageRangeEnd} of {totalCount}
              </span>
              <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-9 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log: any, i: number) => (
                        <TableRow key={log.id || i}>
                          <TableCell className="text-sm">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action || "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.entityType || "—"}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate">{log.description || "—"}</TableCell>
                          <TableCell className="text-sm">{getUserName(log.userId) || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
