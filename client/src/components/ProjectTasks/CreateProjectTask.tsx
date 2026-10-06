import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertCircle, CheckCircle } from "lucide-react";
import UserSelector from "../UserSelector";

interface CreateProjectTaskProps {
  projectId: string;
  teamMembers?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProjectTask({
  projectId,
  teamMembers: _teamMembers = [],
  onSuccess,
  onCancel,
}: CreateProjectTaskProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    assignedTo: "",
    dueDate: "",
    estimatedHours: "",
  });

  const createTaskMutation = trpc.projects.tasks.create.useMutation();
  const { data: taskStatusSettings } = trpc.settings.getByCategory.useQuery({ category: "task_statuses" }, { staleTime: 60_000 });
  const taskStatusOptions = (() => {
    try {
      const parsed = JSON.parse(taskStatusSettings?.list || "null");
      const configured = Array.isArray(parsed)
        ? parsed.map((status) => status?.id && status?.name ? { id: status.id, name: status.name } : null).filter(Boolean) as { id: string; name: string }[]
        : [];
      return configured.length > 0 ? configured : [
        { id: "todo", name: "To Do" },
        { id: "in_progress", name: "In Progress" },
        { id: "review", name: "Review" },
        { id: "completed", name: "Completed" },
        { id: "blocked", name: "Blocked" },
      ];
    } catch {
      return [{ id: "todo", name: "To Do" }, { id: "in_progress", name: "In Progress" }, { id: "review", name: "Review" }, { id: "completed", name: "Completed" }, { id: "blocked", name: "Blocked" }];
    }
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const submitData: any = {
        projectId,
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority as any,
        status: formData.status as any,
        assignedTo: formData.assignedTo && formData.assignedTo !== "__unassigned__" ? formData.assignedTo : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
      };

      await createTaskMutation.mutateAsync(submitData);
      
      setSubmitStatus("success");
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        assignedTo: "",
        dueDate: "",
        estimatedHours: "",
      });
      
      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (error: any) {
      setSubmitStatus("error");
      setErrorMessage(error?.message || "Failed to create task");
      console.error("Create task error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Create New Task</h2>

      {submitStatus === "success" && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Task created successfully!</p>
            <p className="text-sm text-green-700 mt-1">The task has been added to your project.</p>
          </div>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Failed to create task</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <Input
            name="title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            name="description"
            placeholder="Add task description..."
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <Select value={formData.priority} onValueChange={(v) => handleSelectChange("priority", v)} disabled={isSubmitting}>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskStatusOptions.map((status) => <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <UserSelector value={formData.assignedTo} onChange={(v) => handleSelectChange("assignedTo", v)} disabled={isSubmitting} placeholder="Select team member" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Hours
          </label>
          <Input
            type="number"
            name="estimatedHours"
            placeholder="0"
            value={formData.estimatedHours}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || submitStatus === "success"}
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
