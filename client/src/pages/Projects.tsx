import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type ProjectFilters } from "@/components/SearchAndFilter";
import { trpc } from "@/lib/trpc";
import {
  Briefcase,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ExternalLink,
  Copy,
  Users,
  FileText,
  Receipt,
  Download,
  Grid2X2,
  KanbanSquare,
  List,
  Star,
} from "lucide-react";
import { PaginationControls, usePagination } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction, bulkEmailAction } from "@/components/list-page/EnhancedBulkActions";
import { RowActionsMenu, actionIcons } from "@/components/list-page/RowActionsMenu";
import { ProjectCoverImage } from "@/components/ProjectCoverImage";
import { getNextSortDirection, getSortIndicator } from "@/lib/tableSort";

const COLUMNS: ColumnConfig[] = [
  { key: "projectNumber", label: "Project #", defaultVisible: true },
  { key: "name", label: "Name", defaultVisible: true },
  { key: "tags", label: "Tags", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "priority", label: "Priority", defaultVisible: true },
  { key: "progress", label: "Progress", defaultVisible: true },
  { key: "ratingTeam", label: "Rating / Team", defaultVisible: true },
  { key: "endDate", label: "End Date", defaultVisible: true },
];

const PROJECT_EXPORT_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "projectNumber", label: "Project #" },
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "clientId", label: "Client ID" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "tags", label: "Tags" },
  { key: "progress", label: "Progress" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "budget", label: "Budget" },
  { key: "projectRating", label: "Rating" },
  { key: "teamSize", label: "Team Size" },
];

export default function Projects() {
  const { allowed, isLoading } = useRequireFeature("projects:view");
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProjectFilters>({
    status: "all",
    priority: "all",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grid" | "kanban">("list");
  const { visibleColumns, toggleColumn, isVisible, pageSize: colPageSize, updatePageSize, reset } = useColumnVisibility(COLUMNS, "projects-v2");
  const { page, pageSize, setPage, setPageSize, paginate } = usePagination(25);
  useEffect(() => {
    const validPageSize: 25 | 50 | 100 | 250 = colPageSize === 25 || colPageSize === 50 || colPageSize === 100 || colPageSize === 250
      ? colPageSize as 25 | 50 | 100 | 250
      : 25;
    setPageSize(validPageSize as 25 | 50 | 100 | 250);
  }, [colPageSize, setPageSize]);

  const handleSort = (field: ProjectFilters["sortBy"] | string) => {
    const safeField = field as ProjectFilters["sortBy"];
    setFilters((prev) => ({
      ...prev,
      sortBy: safeField,
      sortOrder: getNextSortDirection(safeField, prev.sortBy, prev.sortOrder),
    }));
  };
  
  // always initialize queries to maintain hook order
  const { data: projects = [], isLoading: isLoadingProjects } = trpc.projects.list.useQuery({}, { enabled: allowed });
  const utils = trpc.useUtils();
  
  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully");
      utils.projects.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
  
  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planning":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planning</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case "on_hold":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">On Hold</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getProjectTagColors = (tag: string) => {
    const palette = [
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-violet-100 text-violet-700 border-violet-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-rose-100 text-rose-700 border-rose-200",
      "bg-sky-100 text-sky-700 border-sky-200",
    ];
    const hash = tag.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  const renderProjectTags = (project: any) => {
    const rawTags = Array.isArray(project?.tags)
      ? project.tags
      : typeof project?.tags === "string"
        ? project.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [];

    if (!rawTags.length) {
      return <span className="text-xs text-slate-400">No tags</span>;
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {rawTags.slice(0, 3).map((tag: string, index: number) => (
          <span
            key={`${project?.id ?? "project"}-${tag}-${index}`}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getProjectTagColors(tag)}`}
          >
            {tag}
          </span>
        ))}
        {rawTags.length > 3 && (
          <span className="text-[10px] text-slate-500">+{rawTags.length - 3}</span>
        )}
      </div>
    );
  };

  const renderProjectRating = (rating: number) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-3.5 w-3.5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </div>
  );

  const filteredProjects = (projects as any[])
    .filter(
      (project) =>
        String(project.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(project.projectNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any = a[filters.sortBy as keyof typeof a];
      let bVal: any = b[filters.sortBy as keyof typeof b];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

  const pagedProjects = paginate(filteredProjects);
  const tableColumnCount = COLUMNS.filter((column) => isVisible(column.key)).length + 2;

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  return (
    <ModuleLayout
      title="Projects"
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={[
        { label: "App", href: "/crm-home" },
        { label: "Projects", href: "/projects" },
      ]}
      actions={
        <ListPageToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search projects..."
          onCreateClick={() => navigate("/projects/create")}
          createLabel="New Project"
        />
      }
    >
      <div className="space-y-6">
        {/* Summary Stat Cards */}
        <SummaryStatCards
          cards={[
            {
              label: "All Projects",
              value: projects.length,
              color: "blue",
              progress: 100,
            },
            {
              label: "In Progress",
              value: projects.filter((p) => p.status === "active").length,
              color: "green",
              progress: projects.length ? (projects.filter((p) => p.status === "active").length / projects.length) * 100 : 0,
            },
            {
              label: "On Hold",
              value: projects.filter((p) => p.status === "on_hold").length,
              color: "orange",
              progress: projects.length ? (projects.filter((p) => p.status === "on_hold").length / projects.length) * 100 : 0,
            },
            {
              label: "Completed",
              value: projects.filter((p) => p.status === "completed").length,
              color: "green",
              progress: projects.length ? (projects.filter((p) => p.status === "completed").length / projects.length) * 100 : 0,
            },
          ] satisfies SummaryCard[]}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Project workspace</p>
            <p className="text-xs text-muted-foreground">Choose the view that fits the way you plan work.</p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {([
              ["list", List, "List"],
              ["grid", Grid2X2, "Grid"],
              ["kanban", KanbanSquare, "Kanban"],
            ] as const).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-3 py-2 text-sm transition ${viewMode === mode ? "bg-teal-50 font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedProjects.map((project) => (
              <button key={project.id} type="button" onClick={() => navigate(`/projects/${project.id}`)} className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <ProjectCoverImage src={project.coverImageUrl} alt={`${project.name} cover`} color={project.projectColor} className="h-12 w-12 shrink-0 rounded-lg object-cover" fallbackClassName="h-12 w-2 shrink-0 rounded-full" />
                    <div className="min-w-0"><p className="truncate text-base font-semibold text-slate-900 dark:text-white">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.projectNumber}</p></div>
                  </div>
                  {getStatusBadge(project.status || "planning")}
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-slate-500"><span>Progress</span><span className="font-semibold text-slate-800 dark:text-slate-200">{project.progress || 0}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${project.progress || 0}%` }} /></div>
                <div className="mt-4 flex items-center justify-between"><span>{getPriorityBadge(project.priority || "medium")}</span><span className="text-xs text-slate-500">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "No due date"}</span></div>
                <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-slate-500"><span>{renderProjectRating(Number(project.projectRating || 0))}</span><span>{Number(project.teamSize || 0)} team members</span></div>
              </button>
            ))}
          </div>
        )}

        {viewMode === "kanban" && (
          <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-4">
            {[
              ["planning", "To do", "bg-slate-100", "border-slate-200"],
              ["active", "In progress", "bg-blue-50", "border-blue-100"],
              ["on_hold", "On hold", "bg-amber-50", "border-amber-100"],
              ["completed", "Completed", "bg-emerald-50", "border-emerald-100"],
            ].map(([status, label, background, border]) => (
              <section key={status} className={`min-h-[300px] rounded-xl border p-3 ${background} ${border}`}>
                <div className="mb-3 flex items-center justify-between px-1"><h3 className="text-sm font-semibold text-slate-800">{label}</h3><span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-500">{filteredProjects.filter((project) => project.status === status).length}</span></div>
                <div className="space-y-3">
                  {filteredProjects.filter((project) => project.status === status).map((project) => (
                    <button key={project.id} type="button" onClick={() => navigate(`/projects/${project.id}`)} className="w-full rounded-lg border border-white/80 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.projectNumber}</p>
                      <div className="mt-3 flex items-center justify-between text-xs"><span className="text-slate-500">{project.progress || 0}% complete</span>{getPriorityBadge(project.priority || "medium")}</div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${project.progress || 0}%` }} /></div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Projects Table */}
        {viewMode === "list" && <Card>
          <CardContent className="p-0 space-y-0">
            {/* Bulk actions bar */}
            <EnhancedBulkActions
              selectedCount={selectedProjects.size}
              onClear={() => setSelectedProjects(new Set())}
              actions={[
                bulkExportAction(selectedProjects, projects, PROJECT_EXPORT_COLUMNS, "projects"),
                bulkCopyIdsAction(selectedProjects),
                bulkEmailAction(navigate),
                bulkDeleteAction(selectedProjects, (ids) => { ids.forEach((id) => deleteProjectMutation.mutate(id)); setSelectedProjects(new Set()); }),
              ]}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  {isVisible("projectNumber") && <TableHead className="cursor-pointer" onClick={() => handleSort("projectNumber")}>Project # <span aria-hidden="true">{getSortIndicator("projectNumber", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  {isVisible("name") && <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Name <span aria-hidden="true">{getSortIndicator("name", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  {isVisible("tags") && <TableHead className="min-w-[180px]">Tags</TableHead>}
                  {isVisible("status") && <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Status <span aria-hidden="true">{getSortIndicator("status", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  {isVisible("priority") && <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("priority")}>Priority <span aria-hidden="true">{getSortIndicator("priority", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  {isVisible("progress") && <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("progress")}>Progress <span aria-hidden="true">{getSortIndicator("progress", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  {isVisible("ratingTeam") && <TableHead className="hidden lg:table-cell">Rating / Team</TableHead>}
                  {isVisible("endDate") && <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort("endDate")}>End Date <span aria-hidden="true">{getSortIndicator("endDate", filters.sortBy, filters.sortOrder)}</span></TableHead>}
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Actions
                      <TableColumnSettings
                        columns={COLUMNS}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                        onReset={reset}
                        pageSize={colPageSize}
                        onPageSizeChange={updatePageSize}
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProjects ? (
                  <TableRow>
                      <TableCell colSpan={tableColumnCount} className="text-center py-8 text-muted-foreground">
                      Loading projects...
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={tableColumnCount} className="text-center py-8 text-muted-foreground">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedProjects.map((project) => (
                    <TableRow key={project.id} className={selectedProjects.has(project.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProjects.has(project.id)}
                          onChange={() => {
                            const next = new Set(selectedProjects);
                            if (next.has(project.id)) next.delete(project.id);
                            else next.add(project.id);
                            setSelectedProjects(next);
                          }}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                      </TableCell>
                      {isVisible("projectNumber") && <TableCell className="font-medium">{project.projectNumber}</TableCell>}
                      {isVisible("name") && <TableCell>
                        <a
                          href={`/projects/${project.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            navigate(`/projects/${project.id}`);
                          }}
                          className="flex min-w-0 items-center gap-2 text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                        >
                          <span
                            className="h-6 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: project.projectColor || "#1abb9c" }}
                            aria-label={`${project.name} color`}
                          />
                          <span className="min-w-0 truncate font-medium">{project.name}</span>
                        </a>
                      </TableCell>}
                      {isVisible("tags") && <TableCell>{renderProjectTags(project)}</TableCell>}
                      {isVisible("status") && <TableCell>{getStatusBadge(project.status || "planning")}</TableCell>}
                      {isVisible("priority") && <TableCell className="hidden md:table-cell">{getPriorityBadge(project.priority || "medium")}</TableCell>}
                      {isVisible("progress") && <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{project.progress || 0}%</span>
                        </div>
                      </TableCell>}
                      {isVisible("ratingTeam") && <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">{renderProjectRating(Number(project.projectRating || 0))}<span className="text-xs text-muted-foreground">{Number(project.teamSize || 0)} members</span></div>
                      </TableCell>}
                      {isVisible("endDate") && <TableCell className="hidden lg:table-cell">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
                      </TableCell>}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/projects/${project.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProject(project.id, project.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <PaginationControls
              total={filteredProjects.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              className="px-2"
            />
          </CardContent>
        </Card>}
      </div>
    </ModuleLayout>
  );
}
