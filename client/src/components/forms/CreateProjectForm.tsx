import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const utils = trpc.useUtils();
  const { data: clients = [] } = trpc.clients.list.useQuery({});
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
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
  const [formData, setFormData] = useState({
    name: "",
    projectNumber: `PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    clientId: "",
    category: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    budget: "",
    status: "planning",
    priority: "medium",
    progressPercentage: "0",
    projectColor: "primary",
    teamSize: 6,
    projectRating: 4,
    coverImageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.clientId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createProjectMutation.mutate({
      name: formData.name,
      clientId: formData.clientId,
      category: formData.category || undefined,
      description: formData.description,
      status: formData.status as any,
      priority: formData.priority as any,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      progressPercentage: formData.progressPercentage ? parseInt(formData.progressPercentage) : 0,
      projectColor: formData.projectColor,
      teamSize: formData.teamSize,
      projectRating: formData.projectRating,
      coverImageUrl: formData.coverImageUrl || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectNumber">Project Number</Label>
          <Input
            id="projectNumber"
            value={formData.projectNumber}
            onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
            placeholder="Auto-generated"
            disabled
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">Client *</Label>
        <Select
          value={formData.clientId}
          onValueChange={(value) => setFormData({ ...formData, clientId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(clients) && clients.map((client: any) => (
              <SelectItem key={client.id} value={client.id}>
                {client.companyName || client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Project description and objectives"
          rows={3}
        />
      </div>

      {projectCategories.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="category">Project Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category"><SelectValue placeholder="Select project category" /></SelectTrigger>
            <SelectContent>
              {projectCategories.map((category) => <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <DatePicker
            date={formData.startDate}
            onDateChange={(date) => date && setFormData({ ...formData, startDate: date })}
          />
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <DatePicker
            date={formData.endDate}
            onDateChange={(date) => date && setFormData({ ...formData, endDate: date })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget (Ksh)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2 md:col-span-1">
          <Label>Project color</Label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/40">
            {projectColorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={`Project color ${option.value}`}
                onClick={() => setFormData({ ...formData, projectColor: option.value })}
                className={`h-7 w-7 rounded-full border-2 transition-all ${formData.projectColor === option.value ? "scale-110 border-slate-900 dark:border-white" : "border-white dark:border-slate-700"}`}
                style={{ backgroundColor: option.swatch }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Team size</Label>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={() => setFormData({ ...formData, teamSize: Math.max(1, formData.teamSize - 1) })}>−</Button>
            <Input
              value={formData.teamSize}
              onChange={(e) => setFormData({ ...formData, teamSize: Math.max(1, Number(e.target.value) || 1) })}
              type="number"
              min={1}
              max={50}
              className="text-center"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setFormData({ ...formData, teamSize: Math.min(50, formData.teamSize + 1) })}>+</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progressPercentage">Progress (%)</Label>
          <Input
            id="progressPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.progressPercentage}
            onChange={(e) => setFormData({ ...formData, progressPercentage: e.target.value })}
            placeholder="0"
          />
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
              <svg viewBox="0 0 24 24" className={`h-4 w-4 ${star <= formData.projectRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`} fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" /></svg>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cover image</Label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-slate-500">
          <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">Choose file</span>
          <span className="truncate">{formData.coverImageUrl || "cover-redesign-final.jpg"}</span>
          <Input type="file" accept="image/*" className="hidden" onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.files?.[0]?.name || "" })} />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={createProjectMutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={createProjectMutation.isPending}>
          {createProjectMutation.isPending ? "Creating..." : "Create Project"}
        </Button>
      </div>
    </form>
  );
}


