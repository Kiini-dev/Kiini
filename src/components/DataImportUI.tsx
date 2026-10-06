import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Loader2,
  XCircle,
} from 'lucide-react';

interface ImportResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{ recordIndex: number; error: string }>;
  warnings: Array<{ recordIndex: number; warning: string }>;
  duration: number;
}

interface DataImportProps {
  organizationId: string;
  supportedEntityTypes: string[];
  onImportComplete?: (result: ImportResult) => void;
}

export const DataImport: React.FC<DataImportProps> = ({
  organizationId,
  supportedEntityTypes,
  onImportComplete,
}) => {
  const { t } = useTranslation();
  const [entityType, setEntityType] = useState<string>('');
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setResult(null);

    // Validate file type
    const validTypes: Record<string, string[]> = {
      csv: ['text/csv', 'application/vnd.ms-excel'],
      xlsx: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      json: ['application/json'],
    };

    if (!validTypes[format]?.includes(selectedFile.type)) {
      setError(
        t('import.invalidFileType', 'Invalid file type for selected format')
      );
      setFile(null);
      return;
    }

    // File size limit: 50MB
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError(t('import.fileTooLarge', 'File size exceeds 50MB limit'));
      setFile(null);
      return;
    }
  };

  const handlePreview = async () => {
    if (!file || !entityType) return;

    setLoading(true);
    setPreview(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('format', format);

      // TODO: Call API for preview
      // const response = await api.dataMigration.previewImport.query({...});
      // Show preview results

      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      setPreview(false);
    }
  };

  const handleImport = async () => {
    if (!file || !entityType) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('format', format);

      // TODO: Call API for import
      // const response = await api.dataMigration.importData.mutate({...});
      // const mockResult: ImportResult = {
      //   totalRecords: 150,
      //   successfulRecords: 147,
      //   failedRecords: 3,
      //   errors: [
      //     { recordIndex: 15, error: 'Invalid email format' },
      //     { recordIndex: 87, error: 'Duplicate record' },
      //     { recordIndex: 142, error: 'Missing required field' },
      //   ],
      //   warnings: [],
      //   duration: 5234,
      // };
      // setResult(mockResult);
      // onImportComplete?.(mockResult);

      setLoading(false);
      setPreview(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const successRate = result
    ? Math.round((result.successfulRecords / result.totalRecords) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('import.title', 'Import Data')}</CardTitle>
          <CardDescription>
            {t(
              'import.description',
              'Upload CSV, Excel, or JSON files to import data into the system'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Entity Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('import.entityType', 'Entity Type *')}
            </label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    'import.selectEntityType',
                    'Select entity type...'
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {supportedEntityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('import.format', 'File Format *')}
            </label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma-Separated Values)</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('import.file', 'File *')}
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept={
                  format === 'csv'
                    ? '.csv'
                    : format === 'xlsx'
                      ? '.xlsx,.xls'
                      : '.json'
                }
                onChange={handleFileSelect}
              />
              <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                {file
                  ? file.name
                  : t('import.dragDrop', 'Drag and drop file here or click')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('import.maxSize', 'Maximum file size: 50MB')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handlePreview}
              variant="outline"
              disabled={!file || !entityType || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading', 'Loading...')}
                </>
              ) : (
                t('import.preview', 'Preview')
              )}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || !entityType || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.importing', 'Importing...')}
                </>
              ) : (
                t('import.import', 'Import')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className={result.failedRecords === 0 ? 'border-green-200' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {result.failedRecords === 0 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {t('import.success', 'Import Successful')}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    {t('import.partialSuccess', 'Import Completed with Issues')}
                  </>
                )}
              </CardTitle>
              <span className="text-sm text-gray-600">
                {t('import.duration', 'Duration')}: {(result.duration / 1000).toFixed(2)}s
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{t('import.progress', 'Progress')}</span>
                <span>{successRate}%</span>
              </div>
              <Progress value={successRate} />
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-sm text-gray-600">
                  {t('import.total', 'Total')}
                </p>
                <p className="text-2xl font-bold">{result.totalRecords}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t('import.successful', 'Successful')}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {result.successfulRecords}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {t('import.failed', 'Failed')}
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {result.failedRecords}
                </p>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 text-red-600">
                  {t('import.errors', 'Errors')} ({result.errors.length})
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.slice(0, 5).map((error, idx) => (
                    <p key={idx} className="text-xs text-red-700">
                      Row {error.recordIndex}: {error.error}
                    </p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-xs text-gray-500">
                      {t('import.andMore', 'and')} {result.errors.length - 5}{' '}
                      {t('import.more', 'more...')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataImport;