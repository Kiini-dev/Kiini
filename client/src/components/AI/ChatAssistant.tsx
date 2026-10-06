import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, MessageSquare, Send, Clock, Trash2, Copy } from 'lucide-react';
import { AIMessageContent } from './AIMessageContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  attachments?: Array<{ format: string; filename: string; mimeType: string; data: string }>;
}

const CHAT_STORAGE_KEY = 'ai_chat_history';
const CONTEXT_STORAGE_KEY = 'ai_chat_context';

export function AIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showChatHistory, setShowChatHistory] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    const storedContext = localStorage.getItem(CONTEXT_STORAGE_KEY);
    
    if (storedMessages) {
      try {
        const parsed = JSON.parse(storedMessages);
        setMessages(parsed.length > 0 ? parsed : getDefaultMessage());
      } catch {
        setMessages(getDefaultMessage());
      }
    } else {
      setMessages(getDefaultMessage());
    }
    
    if (storedContext) {
      setContext(storedContext);
    }
  }, []);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const newMessages = [
        ...messages,
        { role: 'assistant' as const, content: data.message, timestamp: Date.now(), attachments: data.attachments },
      ];
      setMessages(newMessages);
      // Save to localStorage
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
      setInput('');
      toast.success('Response received');
    },
    onError: (error: any) => {
      toast.error(`Chat error: ${error.message}`);
    },
  });

  const getDefaultMessage = (): Message[] => [
    {
      role: 'assistant',
      content: 'Hello! I\'m your CRM assistant. I can help you with questions about invoices, projects, payments, clients, and more. What would you like to know?',
      timestamp: Date.now(),
    },
  ];

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Save context to localStorage
    if (context) {
      localStorage.setItem(CONTEXT_STORAGE_KEY, context);
    }

    // Add user message to conversation with timestamp
    const userMessage: Message = { role: 'user', content: input, timestamp: Date.now() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
    setIsLoading(true);

    try {
      await chatMutation.mutateAsync({
        message: input,
        context: context || undefined,
        sessionId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const defaultMessage = getDefaultMessage();
    setMessages(defaultMessage);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultMessage));
    localStorage.removeItem(CONTEXT_STORAGE_KEY);
    setContext('');
    toast.success('Chat history cleared');
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Chat Window */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Assistant Chat
          </CardTitle>
          <CardDescription>
            Ask questions about your CRM data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={`${message.role}-${message.content.substring(0, 20)}`}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-xs ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    <AIMessageContent content={message.content} attachments={message.attachments} />
                  </p>
                  {message.timestamp && (
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Question</Label>
            <div className="flex gap-2">
              <Input
                id="message"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && !isLoading && handleSendMessage()
                }
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const history = localStorage.getItem(CHAT_STORAGE_KEY);
                if (history) {
                  const messages = JSON.parse(history);
                  const historyText = messages
                    .map((msg: any) => {
                      const timestamp = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleString()
                        : 'Unknown time';
                      return `[${timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`;
                    })
                    .join('\n\n');
                  navigator.clipboard.writeText(historyText);
                  toast.success('Chat history copied to clipboard');
                } else {
                  toast.info('No chat history to copy');
                }
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context</CardTitle>
          <CardDescription>
            Optional context for better answers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Textarea
              id="context"
              placeholder="e.g., Client name: Acme Corp, Project: Website redesign"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={6}
              className="resize-none text-sm"
            />
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-semibold">Quick Questions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Show unpaid invoices</li>
              <li>Projects over budget</li>
              <li>Client payment stats</li>
              <li>Revenue this month</li>
              <li>Team availability</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
