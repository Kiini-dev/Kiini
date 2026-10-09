import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Briefcase,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  Tag,
  FileText,
  Star,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
import mutateAsync from "@/lib/mutationHelpers";
import UserSelector from "@/components/UserSelector";
import { KiiniTagSelector } from "@/components/KiiniTagSelector";

const projectColorOptions = [
  { value: "primary", swatch: "#1abb9c" },
  { value: "azure", swatch: "#3b82f6" },
  { value: "blue", swatch: "#2563eb" },
  { value: "purple", swatch: "#8b5cf6" },
  { value: "pink", swatch: "#ec4899" },
  { value: "red", swatch: "#ef4444" },
  { value: "orange", swatch: "#f97316" },
  { value: "yellow", swatch: "#f59e0b" },
  { value: "green", swatch: "#22c55e" },
  { value: "cyan", swatch: "#06b6d4" },
];

export default function EditProject() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    projectNumber: "",
    clientId: "",
    name: "",
    description: "",
    status: "planning" as "planning" | "active" | "on_hold" | "completed" | "cancelled",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    startDate: "",
    endDate: "",
    budget: "",
    progress: "0",
    assignedTo: "",
    projectManager: "",
    projectColor: "primary",
    teamSize: 6,
    projectRating: 4,
    coverImageUrl: "",
    tags: "",
    notes: "",
  });

  const projectId = params.id!;
  const { data: project, isLoading: isLoadingProject } = trpc.projects.getById.useQuery(projectId, {
    enabled: !!projectId,
  });

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      utils.projects.list.invalidate();
      utils.projects.getById.invalidate(projectId);
      navigate(`/projects/${projectId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  const deleteProjectMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully!");
      utils.projects.list.invalidate();
      navigate("/projects");
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectNumber: project.projectNumber || "",
        clientId: project.clientId || "",
        name: project.name || "",
        description: project.description || "",
        status: (project.status || "planning") as "planning" | "active" | "on_hold" | "completed" | "cancelled",
        priority: (project.priority || "medium") as "low" | "medium" | "high" | "urgent",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        budget: project.budget ? (project.budget / 100).toFixed(2) : "",
        progress: project.progress ? project.progress.toString() : "0",
        assignedTo: project.assignedTo || "",
        projectManager: project.projectManager || "",
        projectColor: project.projectColor || "primary",
        teamSize: Number(project.teamSize || 6),
        projectRating: Number(project.projectRating || 4),
        coverImageUrl: project.coverImageUrl || "",
        tags: project.tags || "",
        notes: project.notes || "",
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.name) {
      toast.error("Please fill in required fields (Client and Project Name)");
      return;
    }

    setIsLoading(true);
    try {
      await mutateAsync(updateProjectMutation, {
        id: projectId,
        clientId: formData.clientId,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString().split("T")[0] : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString().split("T")[0] : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        progress: formData.progress ? parseInt(formData.progress) : 0,
        assignedTo: formData.assignedTo || undefined,
        projectManager: formData.projectManager || undefined,
        projectColor: formData.projectColor,
        teamSize: formData.teamSize,
        projectRating: formData.projectRating,
        coverImageUrl: formData.coverImageUrl || undefined,
        tags: formData.tags || undefined,
        notes: formData.notes || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  if (isLoadingProject) {
    return (
      <ModuleLayout
        title="Edit Project"
        description="Update project information"
        icon={<Briefcase className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Projects", href: "/projects" },
          { label: "Edit Project" },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  if (!project) {
    return (
      <ModuleLayout
        title="Edit Project"
        description="Update project information"
        icon={<Briefcase className="w-6 h-6" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Projects", href: "/projects" },
          { label: "Edit Project" },
        ]}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Project not found</p>
          <Button variant="outline" onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Project"
      description={`Update project: ${project.projectNumber}`}
      icon={<Briefcase className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Projects", href: "/projects" },
        { label: project.name, href: `/projects/${projectId}` },
        { label: "Edit" },
      ]}
      backLink={{ label: "Projects", href: "/projects" }}
    >
      <div className="space-y-6 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="h-4 w-4" />Project Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <ClientSelector value={formData.clientId} onChange={(clientId) => setFormData({ ...formData, clientId })} required />
                </div>
                <div className="space-y-2">
                  <Label>Project Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Website Redesign Phase 2"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Number</Label>
                <Input
                  value={formData.projectNumber}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Project Description / Scope</Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="Describe the project scope, objectives, and key deliverables..."
                  minHeight="120px"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />Schedule & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">📋 Planning</SelectItem>
                      <SelectItem value="active">🟢 Active</SelectItem>
                      <SelectItem value="on_hold">⏸ On Hold</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                      <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="urgent">🔴 Critical / Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Date / Deadline</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2 lg:col-span-1">
                  <Label>Project color</Label>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/40">
                    {projectColorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-label={`Project color ${option.value}`}
                        onClick={() => setFormData({ ...formData, projectColor: option.value })}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${formData.projectColor === option.value ? "scale-110 border-slate-900 dark:border-white shadow-sm" : "border-white dark:border-slate-700"}`}
                        style={{ backgroundColor: option.swatch }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Team size</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData({ ...formData, teamSize: Math.max(1, formData.teamSize - 1) })} aria-label="Decrease team size">−</Button>
                    <Input
                      value={formData.teamSize}
                      onChange={(e) => setFormData({ ...formData, teamSize: Math.max(1, Number(e.target.value) || 1) })}
                      type="number"
                      min={1}
                      max={50}
                      className="text-center"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setFormData({ ...formData, teamSize: Math.min(50, formData.teamSize + 1) })} aria-label="Increase team size">+</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Project rating</Label>
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 dark:border-slate-700 dark:bg-slate-900/40">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, projectRating: star })}
                        className="p-1"
                        aria-label={`Rate ${star} out of 5`}
                      >
                        <Star className={`h-4 w-4 ${star <= formData.projectRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover image</Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-slate-500">
                  <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">Choose file</span>
                  <span className="truncate">{formData.coverImageUrl || "cover-redesign-final.jpg"}</span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.files?.[0]?.name || "" })}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />Budget & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Budget (KES)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Total approved budget for this project</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Initial Completion: {formData.progress}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  className="w-full accent-primary"
                  aria-label="Project completion percentage"
                  title="Project completion percentage"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0% – Not started</span><span>50% – Halfway</span><span>100% – Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />Team Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UserSelector value={formData.projectManager} onChange={(value) => setFormData({ ...formData, projectManager: value })} label="Project Manager" />
                <UserSelector value={formData.assignedTo} onChange={(value) => setFormData({ ...formData, assignedTo: value })} label="Account Manager" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Tag className="h-3 w-3" />Tags</Label>
                <KiiniTagSelector
                  value={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags: tags.join(", ") })}
                  placeholder="Add a tag and press Enter"
                />
                <p className="text-xs text-muted-foreground">Add tags with Enter or commas for easy filtering</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Project Notes</Label>
                <RichTextEditor
                  value={formData.notes}
                  onChange={(v) => setFormData({ ...formData, notes: v })}
                  placeholder="Special instructions, client requirements, technical notes, risks to watch out for..."
                  minHeight="140px"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-between pb-8">
            <Button type="button" variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Cancel
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteProjectMutation.isPending}
              >
                {deleteProjectMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" />Delete Project</>
                )}
              </Button>

              <Button type="submit" disabled={isLoading || updateProjectMutation.isPending} size="lg">
                <Save className="h-4 w-4 mr-2" />
                {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
