import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Send, History, Minimize2, Maximize2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AIMessageContent } from '@/components/AI/AIMessageContent';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Array<{ format: string; filename: string; mimeType: string; data: string }>;
}

const CHAT_STORAGE_KEY = 'floating_ai_chat_history';

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const msgId = `msg-${Date.now()}-assistant`;
      const newMessages = [
        ...messages,
        { id: msgId, role: 'assistant' as const, content: data.message, timestamp: Date.now(), attachments: data.attachments },
      ];
      setMessages(newMessages);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    },
    onError: (error) => {
      toast.error(`Chat error: ${error.message}`);
    },
  });

  // Load chat history on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    setInput('');

    await chatMutation.mutateAsync({
      message: input,
    });
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    toast.success('Chat history cleared');
  };

  const loadSampleQuestions = () => {
    const samples = [
      'What are my total pending invoices?',
      'Show me revenue trends',
      'List active projects',
      'How many clients do I have?',
      'What is my cash flow status?',
    ];
    return samples;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 z-40"
          size="icon"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col shadow-2xl transition-all duration-200',
          'w-[min(420px,calc(100vw-1rem))] max-w-[calc(100vw-1rem)]',
          isMinimized ? 'h-14' : 'h-[min(600px,calc(100vh-5rem))] max-h-[calc(100vh-5rem)]'
        )}>
          {/* Header */}
          <CardHeader className="pb-3 border-b flex flex-row items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <CardTitle className="text-sm leading-tight truncate">AI Assistant</CardTitle>
                <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0.5">Quick Chat</Badge>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Chat Content */}
              <CardContent className="flex-1 overflow-hidden flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-center text-muted-foreground">
                      Hi! I'm your AI assistant. Ask me anything about your business.
                    </p>
                    <div className="space-y-2 w-full px-2">
                      {loadSampleQuestions().map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(q)}
                          className="w-full text-left text-xs p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 py-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex gap-2',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] p-3 rounded-lg text-sm',
                              msg.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <AIMessageContent content={msg.content} attachments={msg.attachments} />
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>
                )}
              </CardContent>

              {/* Chat Actions */}
              {messages.length > 0 && (
                <div className="flex gap-2 px-4 py-2 border-t bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs"
                  >
                    <History className="w-3 h-3 mr-1" />
                    History
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t p-3 bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={chatMutation.isPending}
                    className="text-sm h-9"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={chatMutation.isPending || !input.trim()}
                    className="h-9 w-9"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      )}
    </>
  );
}
