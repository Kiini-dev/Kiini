import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Save, FolderOpen, Calendar, DollarSign, Users, Tag, FileText, ArrowLeft, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ClientSelector } from "@/components/ClientSelector";
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

export default function CreateProject() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    category: "",
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

  const { data: categorySettings } = trpc.settings.getByCategory.useQuery({ category: "projects_categories" }, { staleTime: 60_000 });
  const projectCategories = (() => {
    try {
      const parsed = JSON.parse(categorySettings?.list || "null");
      return Array.isArray(parsed)
        ? parsed.filter((category): category is { id: string; name: string } => Boolean(category?.id && category?.name))
        : [];
    } catch {
      return [];
    }
  })();

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully!");
      utils.projects.list.invalidate();
      navigate("/projects");
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.name) {
      toast.error("Client and Project Name are required");
      return;
    }
    createProjectMutation.mutate({
      clientId: formData.clientId,
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category || undefined,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
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
  };

  return (
    <ModuleLayout
      title="Create Project"
      description="Set up a new project and assign it to a client"
      icon={<Plus className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Projects", href: "/projects" },
        { label: "Create" },
      ]}
      backLink={{ label: "Projects", href: "/projects" }}
    >
      <div className="space-y-6 max-w-5xl">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Project Identity */}
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
                {projectCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Project Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {projectCategories.map((category) => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Project Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={set("name")}
                    placeholder="e.g., Website Redesign Phase 2"
                  />
                </div>
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

          {/* Section 2: Schedule & Priority */}
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
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
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
                  <Select value={formData.priority} onValueChange={(v: any) => setFormData({ ...formData, priority: v })}>
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
                  <Input type="date" value={formData.startDate} onChange={set("startDate")} />
                </div>
                <div className="space-y-2">
                  <Label>End Date / Deadline</Label>
                  <Input type="date" value={formData.endDate} onChange={set("endDate")} />
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
                    {[1,2,3,4,5].map((star) => (
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

          {/* Section 3: Budget & Progress */}
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
                  onChange={set("budget")}
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
                  onChange={set("progress")}
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

          {/* Section 4: Team Assignment */}
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

          {/* Section 5: Additional Notes */}
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

          {/* Actions */}
          <div className="flex gap-3 justify-between pb-8">
            <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
