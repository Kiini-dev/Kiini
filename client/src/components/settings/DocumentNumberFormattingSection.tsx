import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import mutateAsync from '@/lib/mutationHelpers';
import { ResetToDefaultButton } from './ResetToDefaultButton';

const DOCUMENT_TYPES = ['invoice', 'estimate', 'receipt', 'proposal', 'expense'] as const;
const SEPARATORS = ['-', '_', '.', '/', ''] as const;

export function DocumentNumberFormattingSection() {
  const [formats, setFormats] = useState<Record<string, any>>({});
  const [selectedType, setSelectedType] = useState<typeof DOCUMENT_TYPES[number]>('invoice');
  const [isLoading, setIsLoading] = useState(false);

  const getFormatQuery = trpc.settings.getDocumentNumberFormat.useQuery(
    { documentType: selectedType },
    { enabled: !!selectedType }
  );

  const updateFormatMutation = trpc.settings.updateDocumentNumberFormat.useMutation();
  const resetCounterMutation = trpc.settings.resetDocumentNumberFormatCounter.useMutation();

  useEffect(() => {
    if (getFormatQuery.data) {
      setFormats(prev => ({
        ...prev,
        [selectedType]: getFormatQuery.data,
      }));
    }
  }, [getFormatQuery.data, selectedType]);

  const currentFormat = formats[selectedType] || {
    prefix: '',
    padding: 6,
    separator: '-',
    currentNumber: 1,
  };

  const handleUpdateFormat = async () => {
    setIsLoading(true);
    try {
      await mutateAsync(updateFormatMutation, {
        documentType: selectedType,
        prefix: currentFormat.prefix,
        padding: currentFormat.padding,
        separator: currentFormat.separator,
      });

      toast.success(`${selectedType} format updated successfully`);
      getFormatQuery.refetch();
    } catch (error) {
      toast.error(`Failed to update format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCounter = async () => {
    setIsLoading(true);
    try {
      await mutateAsync(resetCounterMutation, {
        documentType: selectedType,
        startNumber: 1,
      });

      toast.success(`${selectedType} counter reset to 1`);
      getFormatQuery.refetch();
    } catch (error) {
      toast.error(`Failed to reset counter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = () => {
    const padding = currentFormat.padding || 6;
    const paddedNumber = String(currentFormat.currentNumber || 1).padStart(padding, '0');
    const prefix = currentFormat.prefix || '';
    const separator = currentFormat.separator || '-';
    return prefix ? `${prefix}${separator}${paddedNumber}` : paddedNumber;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Number Formatting</CardTitle>
        <CardDescription>
          Customize how document numbers are generated for each document type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="doc-type">Document Type</Label>
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger id="doc-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prefix */}
          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              placeholder="e.g., INV, INVOICE"
              value={currentFormat.prefix || ''}
              onChange={e =>
                setFormats(prev => ({
                  ...prev,
                  [selectedType]: { ...currentFormat, prefix: e.target.value },
                }))
              }
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Text to prepend to the document number
            </p>
          </div>

          {/* Padding */}
          <div className="space-y-2">
            <Label htmlFor="padding">Number Padding (digits)</Label>
            <Select
              value={String(currentFormat.padding || 6)}
              onValueChange={value =>
                setFormats(prev => ({
                  ...prev,
                  [selectedType]: { ...currentFormat, padding: parseInt(value) },
                }))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="padding">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <SelectItem key={num} value={String(num)}>
                    {num} digits (e.g., {String(1).padStart(num, '0')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Number of digits to pad with zeros
            </p>
          </div>

          {/* Separator */}
          <div className="space-y-2">
            <Label htmlFor="separator">Separator</Label>
            <Select
              value={currentFormat.separator || '-'}
              onValueChange={value =>
                setFormats(prev => ({
                  ...prev,
                  [selectedType]: { ...currentFormat, separator: value },
                }))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="separator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEPARATORS.map(sep => (
                  <SelectItem key={sep} value={sep}>
                    {sep === '' ? 'None' : sep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Character between prefix and number
            </p>
          </div>

          {/* Current Number */}
          <div className="space-y-2">
            <Label htmlFor="current-number">Current Number</Label>
            <Input
              id="current-number"
              type="number"
              min="1"
              value={currentFormat.currentNumber || 1}
              onChange={e =>
                setFormats(prev => ({
                  ...prev,
                  [selectedType]: { ...currentFormat, currentNumber: parseInt(e.target.value) || 1 },
                }))
              }
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Next number to use when creating a document
            </p>
          </div>
        </div>

        {/* Format Preview */}
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Format Preview</p>
          <p className="text-2xl font-mono font-bold text-primary">
            {generatePreview()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This is how your next {selectedType} number will look
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleUpdateFormat}
            disabled={isLoading || getFormatQuery.isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Format'}
          </Button>
          <Button
            variant="outline"
            onClick={handleResetCounter}
            disabled={isLoading}
          >
            Reset Counter to 1
          </Button>
          <ResetToDefaultButton
            settingKey={`${selectedType}_format`}
            label="Reset to Default"
            onSuccess={() => getFormatQuery.refetch()}
          />
        </div>
      </CardContent>
    </Card>
  );
}

