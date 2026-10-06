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
import { Loader2, TrendingUp, Copy, Download } from 'lucide-react';

type MetricType = 'expense_trends' | 'revenue_analysis' | 'cash_flow' | 'profitability';

export function FinancialAnalyzer() {
  const [dataDescription, setDataDescription] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('revenue_analysis');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeMutation = trpc.ai.analyzeFinancials.useMutation({
    onSuccess: (data) => {
      setAnalysis(data.insights);
      toast.success('Financial analysis completed!');
    },
    onError: (error: any) => {
      toast.error(`Failed to analyze: ${error.message}`);
    },
  });

  const handleAnalyze = async () => {
    if (!dataDescription.trim()) {
      toast.error('Please enter financial data description');
      return;
    }

    setIsLoading(true);
    try {
      await analyzeMutation.mutateAsync({
        dataDescription,
        metricType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    toast.success('Analysis copied to clipboard');
  };

  const handleDownloadAnalysis = () => {
    const element = document.createElement('a');
    const file = new Blob([analysis], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'financial-analysis.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Analysis downloaded');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Financial Data
          </CardTitle>
          <CardDescription>
            Describe your financial data for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data Description</Label>
            <Textarea
              id="data"
              placeholder="Provide financial data (e.g., January revenue: 50,000 KES, February: 62,000 KES, March: 45,000 KES, or expense categories with amounts)..."
              value={dataDescription}
              onChange={(e) => setDataDescription(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Characters: {dataDescription.length}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric">Analysis Focus</Label>
            <Select value={metricType} onValueChange={(value) => setMetricType(value as MetricType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue_analysis">Revenue Analysis</SelectItem>
                <SelectItem value="expense_trends">Expense Trends</SelectItem>
                <SelectItem value="cash_flow">Cash Flow</SelectItem>
                <SelectItem value="profitability">Profitability</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !dataDescription.trim() || dataDescription.length < 20}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Analyzing...' : 'Analyze Financials'}
          </Button>
        </CardContent>
      </Card>

      {/* Output Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights
          </CardTitle>
          <CardDescription>
            AI-generated financial insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 min-h-[200px]">
                <p className="text-sm text-blue-900 whitespace-pre-wrap font-medium">
                  {analysis}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAnalysis}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAnalysis}
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
                Financial insights will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
