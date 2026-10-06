import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export interface ImportProgress {
  batchId: string;
  entityType: string;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  skippedRows: number;
  errorRows: number;
  status: "pending" | "processing" | "completed" | "failed" | "rolled_back";
  startTime: Date;
  endTime?: Date;
  errorDetails: Array<{
    rowIndex: number;
    row: Record<string, any>;
    error: string;
  }>;
  warnings: Array<{
    rowIndex: number;
    message: string;
  }>;
}

interface ImportProgressMonitorProps {
  progress: ImportProgress | null;
  onRollback?: (batchId: string) => Promise<void>;
  onDismiss?: () => void;
}

export const ImportProgressMonitor: React.FC<ImportProgressMonitorProps> = ({
  progress,
  onRollback,
  onDismiss,
}) => {
  if (!progress) return null;

  const percentComplete =
    progress.totalRows > 0
      ? Math.round((progress.processedRows / progress.totalRows) * 100)
      : 0;

  const isProcessing = progress.status === "processing" || progress.status === "pending";
  const isCompleted = progress.status === "completed";
  const isFailed = progress.status === "failed";

  const hasErrors = progress.errorDetails.length > 0;
  const hasWarnings = progress.warnings.length > 0;

  const durationSeconds = progress.endTime
    ? Math.round(
        (progress.endTime.getTime() - progress.startTime.getTime()) / 1000
      )
    : null;

  return (
    <Card className={`mb-6 border-2 ${isFailed ? "border-red-300" : "border-blue-300"}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isProcessing && <Clock className="h-5 w-5 text-blue-500" />}
            {isCompleted && !hasErrors && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {isFailed && <AlertCircle className="h-5 w-5 text-red-500" />}
            Import Progress: {progress.entityType}
          </CardTitle>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>
              Processing: {progress.processedRows} / {progress.totalRows} rows
            </span>
            <span className="font-semibold">{percentComplete}%</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <div className="text-gray-600">Imported</div>
            <div className="text-lg font-bold text-green-600">
              {progress.importedRows}
            </div>
          </div>
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
            <div className="text-gray-600">Skipped</div>
            <div className="text-lg font-bold text-yellow-600">
              {progress.skippedRows}
            </div>
          </div>
          <div className="p-2 bg-red-50 rounded border border-red-200">
            <div className="text-gray-600">Errors</div>
            <div className="text-lg font-bold text-red-600">
              {progress.errorRows}
            </div>
          </div>
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-gray-600">Duration</div>
            <div className="text-lg font-bold text-blue-600">
              {durationSeconds ? `${durationSeconds}s` : "―"}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {hasWarnings && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="font-semibold mb-1">
                {progress.warnings.length} Warning{progress.warnings.length !== 1 ? "s" : ""}
              </div>
              <ul className="text-xs space-y-1">
                {progress.warnings.slice(0, 3).map((w, i) => (
                  <li key={`warn-${i}`}>
                    Row {w.rowIndex + 1}: {w.message}
                  </li>
                ))}
                {progress.warnings.length > 3 && (
                  <li className="text-yellow-600 italic">
                    ... and {progress.warnings.length - 3} more
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Details */}
        {hasErrors && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-2">
                {progress.errorDetails.length} Error{progress.errorDetails.length !== 1 ? "s" : ""}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {progress.errorDetails.slice(0, 5).map((err, i) => (
                  <div
                    key={i}
                    className="text-xs p-2 bg-white rounded border border-red-100"
                  >
                    <div className="font-semibold text-red-700">
                      Row {err.rowIndex + 1}
                    </div>
                    <div className="text-red-600">{err.error}</div>
                    {Object.keys(err.row).length > 0 && (
                      <details className="mt-1 cursor-pointer">
                        <summary className="text-gray-600 hover:text-gray-800">
                          View row data
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                          {JSON.stringify(err.row, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
                {progress.errorDetails.length > 5 && (
                  <div className="text-xs text-red-600 italic">
                    ... and {progress.errorDetails.length - 5} more errors
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Message */}
        {isProcessing && (
          <div className="text-sm text-gray-600 animate-pulse">
            Processing... Please wait
          </div>
        )}

        {isCompleted && (
          <div className="text-sm">
            {hasErrors ? (
              <div className="text-amber-700 font-semibold">
                Import completed with {progress.errorRows} error(s). Please review and retry
                failed rows.
              </div>
            ) : (
              <div className="text-green-700 font-semibold">
                ✓ All records imported successfully!
              </div>
            )}
          </div>
        )}

        {isFailed && (
          <div className="text-sm text-red-700 font-semibold">
            Import failed. {progress.errorDetails.length} row(s) could not be processed.
          </div>
        )}

        {/* Rollback Button */}
        {isCompleted && hasErrors && onRollback && (
          <div className="pt-2 border-t">
            <button
              onClick={() => onRollback(progress.batchId)}
              className="text-sm px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Rollback This Import
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Undo this import and remove all {progress.importedRows} imported records
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
