import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Copy, Download, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "secondary" | "ghost";
  onClick: (selectedIds: string[]) => Promise<void> | void;
}

export interface BulkActionsToolbarProps {
  selectedIds: string[];
  totalCount: number;
  isSelectAllChecked: boolean;
  onSelectAll: (checked: boolean) => void;
  onToggleId: (id: string, checked: boolean) => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  isLoading?: boolean;
}

export function BulkActionsToolbar({
  selectedIds,
  totalCount,
  isSelectAllChecked,
  onSelectAll,
  onClearSelection,
  actions,
  isLoading = false,
}: BulkActionsToolbarProps) {
  const selectedCount = selectedIds.length;
  const [confirmAction, setConfirmAction] = React.useState<BulkAction | null>(
    null
  );
  const [isExecuting, setIsExecuting] = React.useState(false);

  const handleActionClick = (action: BulkAction) => {
    if (action.id === "delete") {
      setConfirmAction(action);
    } else {
      handleExecuteAction(action);
    }
  };

  const handleExecuteAction = async (action: BulkAction) => {
    try {
      setIsExecuting(true);
      await action.onClick(selectedIds);
      onClearSelection();
    } catch (error) {
      console.error(`Error executing action ${action.id}:`, error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelectAllChecked}
            onCheckedChange={onSelectAll}
            disabled={isLoading}
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedCount} selected
            {selectedCount < totalCount && (
              <button
                onClick={() => onSelectAll(true)}
                className="ml-2 text-blue-600 hover:text-blue-700 underline text-xs"
              >
                (Select all {totalCount})
              </button>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              size="sm"
              variant={action.variant || "outline"}
              onClick={() => handleActionClick(action)}
              disabled={isLoading || isExecuting}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive Actions */}
      {confirmAction && (
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Confirm {confirmAction.label}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {confirmAction.label.toLowerCase()} {selectedCount} item
                {selectedCount > 1 ? "s" : ""}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleExecuteAction(confirmAction);
                  setConfirmAction(null);
                }}
              >
                {confirmAction.label}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

/**
 * Hook for managing bulk actions state
 */
export function useBulkActions(items: any[], idField = "id") {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const itemIds = items.map((item) => item[idField]);
  const isSelectAllChecked =
    itemIds.length > 0 && itemIds.every((id) => selectedIds.includes(id));

  const toggleId = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sid) => sid !== id)
    );
  };

  const selectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(itemIds);
    } else {
      setSelectedIds([]);
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return {
    selectedIds,
    isSelectAllChecked,
    toggleId,
    selectAll,
    clearSelection,
  };
}

/**
 * Checkbox component for list items
 */
export function BulkActionCheckbox({
  id,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className="mr-2"
    />
  );
}
