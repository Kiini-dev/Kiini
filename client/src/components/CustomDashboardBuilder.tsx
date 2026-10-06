/**
 * Custom Dashboard Builder Component
 * Allows users to drag & drop widgets and create custom dashboard layouts
 */

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  GripVertical,
  Trash2,
  Save,
  RotateCcw,
  Layout,
  Maximize2,
  X,
  Zap,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  type DashboardWidget,
  type DashboardLayout,
  AVAILABLE_WIDGETS,
  DEFAULT_GRID_COLUMNS,
  findNextAvailablePosition,
  getWidgetDimensions,
} from "@/lib/dashboardWidgets";

interface CustomDashboardBuilderProps {
  layout: DashboardLayout | null;
  onSave: (layout: DashboardLayout) => void;
  isLoading?: boolean;
}

export function CustomDashboardBuilder({
  layout,
  onSave,
  isLoading = false,
}: CustomDashboardBuilderProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(layout?.widgets || []);
  const [gridColumns, setGridColumns] = useState(layout?.gridColumns || DEFAULT_GRID_COLUMNS);
  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [selectedWidgetCategory, setSelectedWidgetCategory] = useState<string>("finance");

  const categories = useMemo(() => {
    return {
      finance: {
        title: "Finance",
        icon: DollarSign,
        widgets: [
          AVAILABLE_WIDGETS.revenue,
          AVAILABLE_WIDGETS.expenses,
          AVAILABLE_WIDGETS.revenue_trend,
          AVAILABLE_WIDGETS.expense_trend,
        ],
      },
      sales: {
        title: "Sales & Quotas",
        icon: TrendingUp,
        widgets: [
          AVAILABLE_WIDGETS.invoices,
          AVAILABLE_WIDGETS.estimates,
          AVAILABLE_WIDGETS.payments,
          AVAILABLE_WIDGETS.clients,
        ],
      },
      operations: {
        title: "HR & Operations",
        icon: Users,
        widgets: [
          AVAILABLE_WIDGETS.employees,
          AVAILABLE_WIDGETS.projects,
          AVAILABLE_WIDGETS.tasks,
        ],
      },
      kpi: {
        title: "KPI & Summary",
        icon: BarChart3,
        widgets: [AVAILABLE_WIDGETS.kpi, AVAILABLE_WIDGETS.summary],
      },
    };
  }, []);

  const handleAddWidget = (widgetKey: keyof typeof AVAILABLE_WIDGETS) => {
    const widgetTemplate = AVAILABLE_WIDGETS[widgetKey];
    const pos = findNextAvailablePosition(widgets, widgetTemplate.size, gridColumns);

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...widgetTemplate,
      row: pos.row,
      col: pos.col,
    };

    setWidgets((prev) => [...prev, newWidget]);
    setIsAddWidgetOpen(false);
    toast.success("Widget added successfully");
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    toast.success("Widget removed");
  };

  const handleSave = () => {
    if (!layout) {
      toast.error("Layout not found");
      return;
    }

    const updatedLayout: DashboardLayout = {
      ...layout,
      widgets,
      gridColumns,
      updatedAt: new Date(),
    };

    onSave(updatedLayout);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default layout?")) {
      setWidgets(layout?.widgets || []);
      setGridColumns(layout?.gridColumns || DEFAULT_GRID_COLUMNS);
      setEditMode(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (!layout) return false;
    return (
      JSON.stringify(widgets) !== JSON.stringify(layout.widgets) ||
      gridColumns !== layout.gridColumns
    );
  }, [widgets, gridColumns, layout]);

  if (!layout) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No dashboard layout found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layout className="w-8 h-8" />
            Custom Dashboard Builder
          </h2>
          <p className="text-muted-foreground mt-1">
            Drag & drop widgets to create your perfect dashboard layout
          </p>
        </div>
        <div className="flex gap-2">
          {editMode && (
            <>
              {hasChanges && (
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </Button>
            </>
          )}
          <Button
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? "default" : "outline"}
            className="gap-2"
          >
            {editMode ? "Done Editing" : "Edit Layout"}
          </Button>
        </div>
      </div>

      {/* Grid Settings */}
      {editMode && (
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Layout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Grid Columns</label>
              <Select value={gridColumns.toString()} onValueChange={(v) => setGridColumns(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Columns</SelectItem>
                  <SelectItem value="6">6 Columns (Default)</SelectItem>
                  <SelectItem value="8">8 Columns</SelectItem>
                  <SelectItem value="12">12 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Widget Dialog */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Select a widget to add to your dashboard
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={selectedWidgetCategory}
            onValueChange={setSelectedWidgetCategory}
          >
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(categories).map(([key, cat]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {cat.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categories).map(([key, cat]) => (
              <TabsContent key={key} value={key} className="space-y-3 mt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {cat.widgets.map((widget, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const widgetKey = Object.keys(AVAILABLE_WIDGETS).find(
                          (k) => AVAILABLE_WIDGETS[k as keyof typeof AVAILABLE_WIDGETS] === widget
                        ) as keyof typeof AVAILABLE_WIDGETS;
                        handleAddWidget(widgetKey);
                      }}
                      className="text-left p-3 border rounded-lg hover:bg-accent hover:border-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm leading-tight">
                        {widget.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {widget.description}
                      </p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {widget.size === "small" ? "1 col" : widget.size === "medium" ? "2 cols" : "3 cols"}
                      </Badge>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dashboard Preview</span>
            {editMode && (
              <Button
                onClick={() => setIsAddWidgetOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <div className="text-center py-12">
              <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No widgets added yet. 
                {editMode && " Click 'Add Widget' to get started."}
              </p>
            </div>
          ) : (
            <div
              className="space-y-4 overflow-x-auto"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                gap: "1rem",
              }}
            >
              {widgets.map((widget) => {
                const dims = getWidgetDimensions(widget.size);
                return (
                  <div
                    key={widget.id}
                    style={{
                      gridColumn: `span ${dims.width}`,
                      gridRow: `span ${dims.minHeight}`,
                    }}
                    className={
                      editMode
                        ? "cursor-move border-2 border-dashed border-primary/50 rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
                        : "border rounded-lg p-4 bg-card"
                    }
                    draggable={editMode}
                    onDragStart={() => setDraggedWidget(widget)}
                    onDragEnd={() => setDraggedWidget(null)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      {editMode && (
                        <GripVertical className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{widget.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {widget.description}
                        </p>
                      </div>
                      {editMode && (
                        <button
                          onClick={() => handleRemoveWidget(widget.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Widget Placeholder */}
                    <div className="mt-4 h-32 sm:h-48 bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        {widget.type.includes("trend") && (
                          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        )}
                        {(widget.type === "revenue" ||
                          widget.type === "expenses") && (
                          <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        )}
                        {(widget.type === "invoices" ||
                          widget.type === "estimates" ||
                          widget.type === "payments") && (
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        )}
                        <p className="text-xs">{widget.type.toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Widget Info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {widget.size}
                        </Badge>
                        {widget.refreshInterval && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            {widget.refreshInterval}s
                          </Badge>
                        )}
                      </div>
                      {editMode && (
                        <span className="text-xs text-muted-foreground">
                          Row {widget.row}, Col {widget.col}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Info */}
      {editMode && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Drag widgets to reposition them (not yet implemented in preview).
              Click the X to remove widgets. Your changes will be saved when you click "Save Layout".
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
