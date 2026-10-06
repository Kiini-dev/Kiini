import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Trash2 } from "lucide-react";

interface BulkPayrollActionsProps {
  selectedIds: string[];
  filteredIds: string[];
  onExport: (ids: string[]) => void;
  onMarkPaid: () => void;
  onDelete: () => void;
}

export function BulkPayrollActions({
  selectedIds,
  filteredIds,
  onExport,
  onMarkPaid,
  onDelete,
}: BulkPayrollActionsProps) {
  // nothing to show if there are no records at all
  if (selectedIds.length === 0 && filteredIds.length === 0) return null;

  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardContent className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-sm font-medium text-yellow-900">
              {selectedIds.length} record{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 && (
            <Button size="sm" onClick={() => onExport(selectedIds)}>
              <Download className="mr-1 h-4 w-4" /> Export Selected
            </Button>
          )}
          {filteredIds.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExport(filteredIds)}
            >
              <Download className="mr-1 h-4 w-4" /> Export Filtered ({filteredIds.length})
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button size="sm" onClick={onMarkPaid}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Paid
            </Button>
          )}
          {selectedIds.length > 0 && (
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
