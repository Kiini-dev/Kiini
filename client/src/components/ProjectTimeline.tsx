import React, { useMemo } from "react";
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface GanttTask {
  id: string;
  name: string;
  projectId?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  status: "planning" | "active" | "completed" | "on_hold" | "cancelled";
  assignees?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
}

interface ProjectTimelineProps {
  projects: any[];
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  // Calculate timeline dimensions
  const allDates = projects.flatMap((p) => [
    p.startDate ? new Date(p.startDate) : new Date(),
    p.endDate ? new Date(p.endDate) : new Date(),
  ]);

  const minDate = useMemo(() => {
    const earliest = new Date(Math.min(...allDates.map((d) => d.getTime())));
    // Start from beginning of month
    earliest.setDate(1);
    return earliest;
  }, [allDates]);

  const maxDate = useMemo(() => {
    const latest = new Date(Math.max(...allDates.map((d) => d.getTime())));
    // End at last day of month
    latest.setMonth(latest.getMonth() + 1);
    latest.setDate(0);
    return latest;
  }, [allDates]);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = 300 / totalDays; // Total width divided by days

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const headers: { month: string; startDay: number; dayCount: number }[] = [];
    const current = new Date(minDate);

    while (current <= maxDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      const visibleStart = Math.max(monthStart.getTime(), minDate.getTime());
      const visibleEnd = Math.min(monthEnd.getTime(), maxDate.getTime());

      const startDay = Math.ceil((visibleStart - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const dayCount = Math.ceil((visibleEnd - visibleStart) / (1000 * 60 * 60 * 24)) + 1;

      headers.push({
        month: current.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        startDay,
        dayCount,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return headers;
  }, [minDate, maxDate]);

  const getTaskPosition = (startDate: Date | string | null, endDate: Date | string | null) => {
    const start = startDate ? new Date(startDate) : minDate;
    const end = endDate ? new Date(endDate) : maxDate;

    const left = Math.max(0, (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const width = Math.max(
      1,
      (end.getTime() - Math.max(start.getTime(), minDate.getTime())) / (1000 * 60 * 60 * 24)
    );

    return {
      left: left * pixelsPerDay,
      width: Math.max(width * pixelsPerDay, 20),
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "active":
        return "bg-blue-500";
      case "on_hold":
        return "bg-amber-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-4 border-red-500";
      case "high":
        return "border-l-4 border-orange-500";
      case "medium":
        return "border-l-4 border-blue-500";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Project Timeline</h2>
        </div>
        <p className="text-sm text-gray-600">
          {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
        </p>
      </div>

      {/* Timeline Container */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month Headers */}
          <div className="flex">
            <div className="w-64 flex-shrink-0" />
            <div className="flex">
              {monthHeaders.map((header, idx) => (
                <div
                  key={header.month || `month-${idx}`}
                  className="border-r border-gray-200 text-center py-2 text-xs font-semibold text-gray-700 bg-gray-50"
                  style={{ width: header.dayCount * pixelsPerDay }}
                >
                  {header.month}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Lines and Tasks */}
          <div className="relative">
            {/* Background Grid */}
            <div className="flex">
              <div className="w-64 flex-shrink-0" />
              <div className="flex">
                {Array.from({ length: totalDays }).map((_, idx) => (
                  <div
                    key={`day-${idx}`}
                    className="border-r border-gray-100"
                    style={{ width: pixelsPerDay }}
                  />
                ))}
              </div>
            </div>

            {/* Task Bars */}
            <div className="absolute inset-0">
              {projects.map((project, idx) => {
                const position = getTaskPosition(project.startDate, project.endDate);
                const isOverdue =
                  project.endDate &&
                  new Date(project.endDate) < new Date() &&
                  project.status !== "completed";

                return (
                  <div
                    key={project.id}
                    className="flex items-center h-12 border-b border-gray-100"
                    style={{ marginTop: idx * 48 }}
                  >
                    <div className="w-64 flex-shrink-0 px-2 text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </div>

                    <div className="relative flex-1" style={{ minWidth: 300 }}>
                      {/* Main task bar */}
                      <div
                        className={`absolute top-2 h-8 rounded-md shadow-sm transition-all ${getStatusColor(
                          project.status
                        )} ${getPriorityColor(project.priority)} opacity-90 hover:opacity-100 cursor-pointer group`}
                        style={{
                          left: position.left,
                          width: position.width,
                        }}
                        title={`${project.name} (${project.progress}% complete)`}
                      >
                        {/* Progress bar inside task */}
                        <div
                          className="h-full rounded-md bg-white opacity-30"
                          style={{
                            width: `${Math.max(project.progress || 0, 5)}%`,
                          }}
                        />

                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                          <div>{project.name}</div>
                          <div className="text-gray-300">
                            {project.progress || 0}% complete
                          </div>
                        </div>
                      </div>

                      {/* Milestone marker (end date) */}
                      {project.endDate && (
                        <div
                          className="absolute top-2 w-1 h-8 bg-gray-400 rounded-full opacity-70"
                          style={{
                            left: position.left + position.width,
                          }}
                        />
                      )}

                      {/* Overdue indicator */}
                      {isOverdue && (
                        <div className="absolute top-0 left-0 -translate-y-4">
                          <AlertCircle className="w-4 h-4 text-red-500" aria-label="Overdue" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right-side Info Panel */}
            <div className="absolute right-0 top-0 w-48 border-l border-gray-200 bg-gray-50">
              {projects.map((project, idx) => (
                <div
                  key={project.id}
                  className="flex items-center h-12 px-3 border-b border-gray-100 text-xs"
                  style={{ marginTop: idx * 48 }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {/* Status Icon */}
                    {project.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {project.status === "active" && (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}

                    {/* Progress */}
                    <div className="flex-1">
                      <div className="text-gray-700 font-semibold">{project.progress || 0}%</div>
                      <div className="w-full bg-gray-300 rounded-full h-1.5 mt-0.5">
                        <div
                          className={`h-full rounded-full ${getProgressColor(project.progress || 0)}`}
                          style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded" />
            <span>On Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
