import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Trash2,
  Download,
  Copy,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface BulkActionsBarProps {
  selectedCount: number;
  onSelectAll: (selected: boolean) => void;
  onDelete: () => Promise<void>;
  onExport?: (format: "csv" | "excel" | "pdf") => Promise<void>;
  onDuplicate?: () => Promise<void>;
  totalCount: number;
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onSelectAll,
  onDelete,
  onExport,
  onDuplicate,
  totalCount,
  isLoading = false,
}: BulkActionsBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      toast.success(`${selectedCount} item(s) deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    if (!onExport) return;
    
    setIsExporting(true);
    try {
      await onExport(format);
      toast.success(`Exported ${selectedCount} item(s) as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!onDuplicate) return;
    
    setIsDuplicating(true);
    try {
      await onDuplicate();
      toast.success(`Duplicated ${selectedCount} item(s)`);
    } catch (error) {
      toast.error("Failed to duplicate items");
    } finally {
      setIsDuplicating(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky bottom-0 left-0 right-0 z-20 bg-primary text-primary-foreground px-6 py-3 flex items-center justify-between gap-4 shadow-lg rounded-t-lg">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedCount === totalCount && totalCount > 0}
            onCheckedChange={(checked) => onSelectAll(checked as boolean)}
            className="border-primary-foreground"
          />
          <span className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isExporting || isLoading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  disabled={isExporting}
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  disabled={isExporting}
                >
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting}
                >
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Duplicate Button */}
          {onDuplicate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDuplicate}
              disabled={isDuplicating || isLoading}
              className="gap-2"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </>
              )}
            </Button>
          )}

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isDeleting || isLoading}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>

          {/* Clear Selection Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectAll(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete {selectedCount} item(s)?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All selected items will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
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
    </>
  );
}
