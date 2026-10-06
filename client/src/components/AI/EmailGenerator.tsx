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
import { Loader2, Mail, Copy, Download } from 'lucide-react';

type ToneType = 'professional' | 'friendly' | 'formal' | 'casual';
type EmailType = 'invoice' | 'proposal' | 'follow_up' | 'general';

export function EmailGenerator() {
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [emailType, setEmailType] = useState<EmailType>('general');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateMutation = trpc.ai.generateEmail.useMutation({
    onSuccess: (data) => {
      setGeneratedEmail(data.emailContent);
      toast.success('Email generated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Failed to generate email: ${error.message}`);
    },
  });

  const handleGenerate = async () => {
    if (!context.trim()) {
      toast.error('Please enter email context');
      return;
    }

    setIsLoading(true);
    try {
      await generateMutation.mutateAsync({
        context,
        tone,
        type: emailType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success('Email copied to clipboard');
  };

  const handleDownloadEmail = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedEmail], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'email.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Email downloaded');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Parameters
          </CardTitle>
          <CardDescription>
            Provide context for email generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Email Context</Label>
            <Textarea
              id="context"
              placeholder="Describe what the email should say (e.g., client name John Smith, project XYZ, invoice overdue since Jan 15)..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Characters: {context.length} (minimum 20 required)
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-type">Email Type</Label>
              <Select value={emailType} onValueChange={(value) => setEmailType(value as EmailType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(value) => setTone(value as ToneType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !context.trim() || context.length < 20}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating...' : 'Generate Email'}
          </Button>
        </CardContent>
      </Card>

      {/* Output Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Generated Email
          </CardTitle>
          <CardDescription>
            Ready to copy or customize
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedEmail ? (
            <>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[200px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedEmail}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadEmail}
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
                Generated email will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
