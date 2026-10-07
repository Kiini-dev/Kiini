import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Eye,
} from 'lucide-react';
import { parseCSV } from '@/utils/csvGenerator';

interface PreviewRow {
  rowNum: number;
  data: Record<string, any>;
  hasErrors: boolean;
  errors: string[];
}

async function readImportFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) return file.text();
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(firstSheet);
}

export default function CSVImportExport() {
  const [selectedModule, setSelectedModule] = useState<string>('clients');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validatedFor, setValidatedFor] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const utils = trpc.useUtils();
  const { data: schemaTables = [] } = trpc.csvImportExport.listSchemaTables.useQuery();
  const modules = schemaTables.map((table) => ({
    id: table.key,
    name: table.label || table.key,
    description: `${table.columns.length} schema columns`,
    iconComponent: FileText,
    color: 'blue',
    fields: table.columns.map((column) => column.name),
  }));
  
  const importTableMutation = trpc.csvImportExport.importTable.useMutation();
  const validationKey = uploadedFile
    ? `${uploadedFile.name}:${uploadedFile.size}:${uploadedFile.lastModified}:${selectedModule}:${skipDuplicates}`
    : null;
  const isCurrentFileValidated = Boolean(validationKey && validationKey === validatedFor);

  /**
   * Download template for selected module
   */
  const handleDownloadTemplate = async (tableId = selectedModule) => {
    try {
      const template = await utils.csvImportExport.generateTableTemplate.fetch({ table: tableId });
      const templateContent = template.content || '';
      const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableId}_template.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${tableId} template downloaded`);
    } catch (error) {
      toast.error(`Failed to download template: ${error}`);
    }
  };

  const handleExport = async () => {
    try {
      const result = await utils.csvImportExport.exportTable.fetch({ table: selectedModule, limit: 100000 });
      const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedModule}_export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${selectedModule} data exported (${result.rowCount} records)`);
    } catch (error) {
      toast.error(`Failed to export data: ${error}`);
    }
  };

  /**
   * Handle file selection and preview
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error('Please select a CSV or XLSX file');
      return;
    }

    setUploadedFile(file);
    setValidationResult(null);
    setValidatedFor(null);
    setImportResult(null);

    try {
      const content = await readImportFile(file);
      const rows = parseCSV(content);

      // Convert first 5 rows for preview
      const preview: PreviewRow[] = rows.slice(0, 5).map((row, idx) => ({
        rowNum: idx + 2, // Start from row 2 (row 1 is headers)
        data: row,
        hasErrors: false,
        errors: [],
      }));

      setPreviewData(preview);
      setShowPreview(true);
      toast.success(`Loaded ${rows.length} records from CSV`);
    } catch (error) {
      toast.error(`Failed to parse CSV: ${error}`);
      setUploadedFile(null);
    }
  };

  /**
   * Validate against the live database, then roll the validation transaction back.
   */
  const handleValidateImport = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsValidating(true);
    try {
      const content = await readImportFile(uploadedFile);
      const rows = parseCSV(content);

      if (rows.length === 0) {
        toast.error('CSV file has no data rows');
        return;
      }

      const result = await importTableMutation.mutateAsync({
        table: selectedModule,
        content,
        skipDuplicates,
        validateOnly: true,
      });

      setValidationResult(result);
      setValidatedFor(validationKey);
      const readyCount = result.ready || 0;
      if (result.errors.length === 0) {
        toast.success(`Validation passed: ${readyCount} rows ready to import`);
      } else {
        toast.warning(`Validation found ${result.errors.length} row errors`);
      }
    } catch (error) {
      setValidationResult(null);
      setValidatedFor(null);
      toast.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsValidating(false);
    }
  };

  const executeImport = async (content: string) => {
    setIsImporting(true);
    try {
      const result = await importTableMutation.mutateAsync({ table: selectedModule, content, skipDuplicates });
      setImportResult(result);
      toast.success(`Import completed: ${result.imported} records imported`);

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors occurred during import`);
      }

      setUploadedFile(null);
      setPreviewData([]);
      setValidationResult(null);
      setValidatedFor(null);
      setShowPreview(false);
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile || !isCurrentFileValidated || !validationResult) {
      toast.error('Validate this file before importing');
      return;
    }

    const readyCount = validationResult.ready || 0;
    if (readyCount === 0) {
      toast.error('There are no valid rows to import');
      return;
    }

    try {
      const content = await readImportFile(uploadedFile);
      await executeImport(content);
    } catch (error) {
      toast.error(`Failed to read import file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handlePreviewProceed = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      const content = await readImportFile(uploadedFile);
      let currentValidation = validationResult;

      if (!isCurrentFileValidated || !currentValidation) {
        const rows = parseCSV(content);
        if (rows.length === 0) {
          toast.error('CSV file has no data rows');
          return;
        }

        setIsValidating(true);
        try {
          currentValidation = await importTableMutation.mutateAsync({
            table: selectedModule,
            content,
            skipDuplicates,
            validateOnly: true,
          });
          setValidationResult(currentValidation);
          setValidatedFor(validationKey);

          if (currentValidation.errors.length > 0) {
            toast.warning(`Validation found ${currentValidation.errors.length} row errors`);
          }
        } catch (error) {
          setValidationResult(null);
          setValidatedFor(null);
          toast.error(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
          return;
        } finally {
          setIsValidating(false);
        }
      }

      if ((currentValidation?.ready || 0) === 0) {
        toast.error('There are no valid rows to import');
        return;
      }

      await executeImport(content);
    } catch (error) {
      toast.error(`Failed to read import file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const currentModuleInfo = modules.find(m => m.id === selectedModule);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CSV Import/Export</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Bulk import data using CSV templates
        </p>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="templates">Download Templates</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import CSV Data</CardTitle>
              <CardDescription>
                Select a module and upload a CSV file to bulk import data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Module Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Module</label>
                <Select value={selectedModule} onValueChange={(value) => {
                  setSelectedModule(value);
                  setValidationResult(null);
                  setValidatedFor(null);
                }}>
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Choose a module">
                      {currentModuleInfo?.name || selectedModule || "Choose a module"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-80 bg-white text-gray-900 dark:bg-slate-950 dark:text-white">
                    {modules.map(module => {
                      return (
                        <SelectItem
                          key={module.id}
                          value={module.id}
                          className="text-gray-900 focus:bg-blue-600 focus:text-white dark:text-white dark:focus:bg-blue-700"
                        >
                          {module.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {currentModuleInfo && (
                  <p className="text-xs text-gray-500">{currentModuleInfo.description}</p>
                )}
              </div>

              {/* Download Template Button */}
              <Button
                onClick={() => void handleDownloadTemplate()}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download {selectedModule} Template
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export {selectedModule} Data
              </Button>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select CSV File</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileSelect}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                  />
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{uploadedFile.name}</span>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => {
                      setSkipDuplicates(e.target.checked);
                      setValidationResult(null);
                      setValidatedFor(null);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Skip duplicate records</span>
                </label>
              </div>

              {/* Preview Button */}
              {previewData.length > 0 && (
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Data ({previewData.length} rows)
                </Button>
              )}

              <Button
                onClick={handleValidateImport}
                disabled={!uploadedFile || isImporting || isValidating}
                variant="outline"
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating without saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isCurrentFileValidated ? "Revalidate Import" : "Validate Import"}
                  </>
                )}
              </Button>

              {validationResult && isCurrentFileValidated && (
                <Alert variant={validationResult.errors.length ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Validation complete. No records were saved.</p>
                      <p className="text-sm">
                        {validationResult.validated} rows checked, {validationResult.ready} ready,
                        {` ${validationResult.skipped} duplicates skipped, ${validationResult.errors.length} errors`}.
                      </p>
                      {validationResult.errors.length > 0 && (
                        <details>
                          <summary className="cursor-pointer text-sm">Review row errors</summary>
                          <ul className="mt-2 space-y-1 text-xs">
                            {validationResult.errors.slice(0, 20).map((error: any, index: number) => (
                              <li key={`${error.row}-${index}`}>Row {error.row}: {error.message}</li>
                            ))}
                            {validationResult.errors.length > 20 && <li>... and {validationResult.errors.length - 20} more</li>}
                          </ul>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                disabled={!uploadedFile || !isCurrentFileValidated || isImporting || isValidating || (validationResult?.ready || 0) === 0}
                className="w-full"
              >
                {isImporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing...</> : <><Upload className="w-4 h-4 mr-2" />Import Validated Rows</>}
              </Button>

              {/* Import Results */}
              {importResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Import Completed</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Imported:</span>
                          <p className="font-semibold text-green-600">{importResult.imported}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Skipped:</span>
                          <p className="font-semibold text-yellow-600">{importResult.skipped}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <p className="font-semibold text-red-600">{importResult.errors.length}</p>
                        </div>
                      </div>
                      {importResult.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-red-600 hover:underline">
                            Show errors ({importResult.errors.length})
                          </summary>
                          <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {importResult.errors.slice(0, 10).map((err: any, idx: number) => (
                              <li key={idx}>
                                Row {err.row}: {err.message}
                              </li>
                            ))}
                            {importResult.errors.length > 10 && (
                              <li>... and {importResult.errors.length - 10} more errors</li>
                            )}
                          </ul>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                Download blank CSV templates to use as import files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modules.map(module => (
                  <Button
                    key={module.id}
                    variant="outline"
                    className="h-auto p-3 text-left justify-start flex-col items-start"
                    onClick={() => {
                      setSelectedModule(module.id);
                      void handleDownloadTemplate(module.id);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-4 h-4" />
                      <span className="font-medium">{module.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{module.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Import Data</DialogTitle>
            <DialogDescription>
              Showing first {previewData.length} rows from your CSV file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewData.map((row) => (
              <Card key={row.rowNum} className={row.hasErrors ? 'border-red-300' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">Row {row.rowNum}</h4>
                    {row.hasErrors && (
                      <Badge variant="destructive">Has Errors</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(row.data).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-gray-500 text-xs">{key}</span>
                        <span className="font-medium break-words">
                          {value === null ? <em className="text-gray-400">empty</em> : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!isCurrentFileValidated || !validationResult) && (
            <p className="text-sm text-muted-foreground">
              Proceeding will validate the file first, then import valid rows.
            </p>
          )}

          <DialogFooter>
            <Button onClick={() => setShowPreview(false)} variant="outline">
              Close
            </Button>
            <Button onClick={handlePreviewProceed} disabled={isImporting || isValidating}>
              {isImporting ? 'Importing...' : isValidating ? 'Validating...' : 'Proceed with Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
