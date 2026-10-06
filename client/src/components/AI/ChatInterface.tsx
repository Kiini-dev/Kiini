import React, { useState, useRef, useEffect } from "react";
import { Send, Loader, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIMessageContent } from "@/components/AI/AIMessageContent";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  tokensUsed?: number;
  attachments?: Array<{ format: string; filename: string; mimeType: string; data: string }>;
}

interface ChatInterfaceProps {
  sessionId?: string;
  title?: string;
  onSessionChange?: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId: initialSessionId,
  title = "AI Chat Assistant",
  onSessionChange,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TRPC mutations
  const createSessionMutation = trpc.ai.createChatSession.useMutation();
  const chatMutation = trpc.ai.chat.useMutation();
  const getChatHistoryQuery = trpc.ai.getChatHistory.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  // Load chat history
  useEffect(() => {
    if (getChatHistoryQuery.data) {
      setMessages(getChatHistoryQuery.data);
    }
  }, [getChatHistoryQuery.data]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);

      // Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const result = await createSessionMutation.mutateAsync({
          title: title || "Chat Session",
        });
        currentSessionId = result.id;
        setSessionId(currentSessionId);
        onSessionChange?.(currentSessionId);
      }

      // Add user message to UI
      const userMessage: Message = {
        id: Math.random().toString(),
        role: "user",
        content: input,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Send message to AI
      const response = await chatMutation.mutateAsync({
        message: input,
        sessionId: currentSessionId,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: response.id || Math.random().toString(),
        role: "assistant",
        content: response.message,
        createdAt: response.createdAt || new Date().toISOString(),
        tokensUsed: response.tokensUsed,
        attachments: response.attachments,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {sessionId && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Session: {sessionId.substring(0, 8)}...
          </p>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div>
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Ask anything or describe what you need help with.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 dark:bg-blue-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                <AIMessageContent content={msg.content} attachments={msg.attachments} />
              </p>
              {msg.tokensUsed && (
                <p className="text-xs opacity-75 mt-1">
                  Tokens: {msg.tokensUsed}
                </p>
              )}
              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className="mt-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <Loader className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
