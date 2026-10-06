import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  entityName?: string;
  message?: string;
  isLoading?: boolean;
  onApprove?: (notes?: string) => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  requiresReason?: boolean;
  reason?: string;
  onReasonChange?: (value: string) => void;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}

export function ApprovalModal({
  isOpen,
  title,
  description,
  entityName = "this item",
  message,
  isLoading = false,
  onApprove,
  onCancel,
  onClose,
  requiresReason = false,
  reason,
  onReasonChange,
  onConfirm,
  loading,
}: ApprovalModalProps) {
  const [notes, setNotes] = useState(reason ?? "");

  useEffect(() => {
    setNotes(reason ?? "");
  }, [reason, isOpen]);

  const effectiveApprove = onApprove ?? onConfirm ?? (() => Promise.resolve());
  const effectiveCancel = onCancel ?? onClose ?? (() => undefined);
  const effectiveLoading = loading ?? isLoading;
  const resolvedDescription = description ?? message ?? "Please confirm this action.";

  const handleApprove = async () => {
    if (requiresReason && onReasonChange) {
      onReasonChange(notes);
    }
    await effectiveApprove(notes);
    setNotes("");
  };

  const handleCancel = () => {
    setNotes("");
    effectiveCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              You are about to approve <strong>{entityName}</strong>. This action will update its status and cannot be easily reverted.
            </p>
          </div>

          {(requiresReason || onReasonChange) && (
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  onReasonChange?.(e.target.value);
                }}
                rows={3}
                disabled={effectiveLoading}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={effectiveLoading} onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={effectiveLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {effectiveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {effectiveLoading ? "Approving..." : "Approve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
