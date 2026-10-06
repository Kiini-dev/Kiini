import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, FileText, Copy, Download } from 'lucide-react';

type FocusType = 'key_points' | 'action_items' | 'financial' | 'general';

export function DocumentSummarizer() {
  const [documentText, setDocumentText] = useState('');
  const [focusType, setFocusType] = useState<FocusType>('general');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const summarizeMutation = trpc.ai.summarizeDocument.useMutation({
    onSuccess: (data) => {
      setSummary(data.summary);
      toast.success('Document summarized successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to summarize: ${error.message}`);
    },
  });

  const handleSummarize = async () => {
    if (!documentText.trim()) {
      toast.error('Please enter document text');
      return;
    }

    setIsLoading(true);
    try {
      await summarizeMutation.mutateAsync({
        text: documentText,
        focus: focusType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  const handleDownloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Summary downloaded');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Input
          </CardTitle>
          <CardDescription>
            Paste your document text to summarize
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document">Document Text</Label>
            <Textarea
              id="document"
              placeholder="Paste your document content here (minimum 50 characters)..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Characters: {documentText.length}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Summary Focus</Label>
            <Select value={focusType} onValueChange={(value) => setFocusType(value as FocusType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Summary</SelectItem>
                <SelectItem value="key_points">Key Points Only</SelectItem>
                <SelectItem value="action_items">Action Items</SelectItem>
                <SelectItem value="financial">Financial Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSummarize}
            disabled={isLoading || !documentText.trim() || documentText.length < 50}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Summarizing...' : 'Summarize Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Output Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Summary
          </CardTitle>
          <CardDescription>
            AI-generated summary of your document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {summary}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSummary}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 h-[200px] flex items-center justify-center">
              <p className="text-gray-400 text-sm">
                Summary will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
