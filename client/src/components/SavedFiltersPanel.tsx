import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Bookmark,
  Trash2,
  Star,
  ChevronDown,
  Loader2,
} from "lucide-react";

export interface SavedFilter {
  id: string;
  moduleName: string;
  filterName: string;
  description?: string;
  filterConfig: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedFiltersPanelProps {
  moduleName: string;
  currentFilters: Record<string, any>;
  onLoadFilter: (filterConfig: Record<string, any>) => void;
  isLoading?: boolean;
}

export function SavedFiltersPanel({
  moduleName,
  currentFilters,
  onLoadFilter,
  isLoading = false,
}: SavedFiltersPanelProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Fetch saved filters
  const { data: savedFilters = [], refetch: refetchFilters } = trpc.savedFilters.listByModule.useQuery(
    { moduleName },
    { enabled: true }
  );

  // Mutations
  const createFilterMutation = trpc.savedFilters.create.useMutation({
    onSuccess: () => {
      toast.success("Filter saved successfully");
      setFilterName("");
      setFilterDescription("");
      setIsSaveDialogOpen(false);
      refetchFilters();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save filter");
    },
  });

  const deleteFilterMutation = trpc.savedFilters.delete.useMutation({
    onSuccess: () => {
      toast.success("Filter deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedFilterId(null);
      refetchFilters();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete filter");
    },
  });

  const setDefaultMutation = trpc.savedFilters.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default filter updated");
      refetchFilters();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default filter");
    },
  });

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      toast.error("Filter name is required");
      return;
    }

    createFilterMutation.mutate({
      moduleName,
      filterName: filterName.trim(),
      description: filterDescription.trim() || undefined,
      filterConfig: currentFilters,
    });
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    onLoadFilter(filter.filterConfig);
    toast.success(`Loaded filter: ${filter.filterName}`);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSelectedFilterId(filterId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFilterId) {
      deleteFilterMutation.mutate({ id: selectedFilterId });
    }
  };

  const handleSetDefault = (filterId: string) => {
    setDefaultMutation.mutate({ id: filterId, moduleName });
  };

  const hasFilters = Object.values(currentFilters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return (
    <div className="flex items-center gap-2">
      {/* Save Filter Button */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasFilters || isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Filter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Filter</DialogTitle>
            <DialogDescription>
              Give your filter a name and optional description for easy access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name *</Label>
              <Input
                id="filter-name"
                placeholder="e.g., High-value invoices"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                disabled={createFilterMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description</Label>
              <Textarea
                id="filter-description"
                placeholder="Optional description of this filter..."
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                disabled={createFilterMutation.isPending}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSaveDialogOpen(false)}
                disabled={createFilterMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFilter}
                disabled={createFilterMutation.isPending}
              >
                {createFilterMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Filter"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Filter Dropdown */}
      {savedFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Load Filter
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {savedFilters.map((filter) => (
              <div key={filter.id}>
                <DropdownMenuItem
                  onClick={() => handleLoadFilter(filter)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{filter.filterName}</span>
                      {filter.isDefault && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {filter.description}
                      </p>
                    )}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
            ))}
            <DropdownMenuItem
              onClick={() => {
                // Show filter management options
              }}
              className="text-xs text-muted-foreground"
            >
              {savedFilters.length} saved filter{savedFilters.length !== 1 ? "s" : ""}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Filter Management */}
      {savedFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="p-2 text-sm font-semibold">Manage Filters</div>
            <DropdownMenuSeparator />
            {savedFilters.map((filter) => (
              <div key={filter.id} className="p-2 space-y-2 border-b last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{filter.filterName}</span>
                      {filter.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {filter.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={() => handleLoadFilter(filter)}
                  >
                    Load
                  </Button>
                  {!filter.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => handleSetDefault(filter.id)}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteFilter(filter.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Filter</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this saved filter? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteFilterMutation.isPending}
            >
              {deleteFilterMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
