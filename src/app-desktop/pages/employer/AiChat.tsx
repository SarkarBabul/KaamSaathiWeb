import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Bot,
  ChevronRight,
  History,
  ImagePlus,
  Lightbulb,
  Loader2,
  Mic,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/app-desktop/auth/useAuth";
import {
  sessionKey,
  sessionTimestamp,
  sessionTitle,
  useEmployerChatHistory,
  useEmployerChatSessions,
  useSendEmployerChatMessage,
} from "@/app-desktop/hooks/useEmployerAiChat";
import type { ChatMessage } from "@/app-desktop/types/employerAiChat";

const SUGGESTIONS = [
  "How many workers were present recently?",
  "Show pending payments summary",
  "Who is my best worker?",
  "Who is the most consistent worker?",
];

export default function AiChat() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const leaderId = session?.parentId ?? "";

  const [showHistory, setShowHistory] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [showTryAsking, setShowTryAsking] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const sessionsQuery = useEmployerChatSessions(leaderId);
  const historyMutation = useEmployerChatHistory();
  const sendMessage = useSendEmployerChatMessage();

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight });
  }, [messages, sendMessage.isPending]);

  const openHistory = () => {
    setShowHistory(true);
    sessionsQuery.refetch();
  };

  const openSession = (sessionId: string) => {
    if (!sessionId) return;
    historyMutation.mutate(sessionId, {
      onSuccess: (formatted) => {
        setMessages(formatted);
        setShowHistory(false);
      },
    });
  };

  const selectSuggestion = (text: string) => {
    setUserMessage(text);
    setShowTryAsking(false);
  };

  const handleSend = () => {
    const msg = userMessage.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setUserMessage("");
    sendMessage.mutate(
      { message: msg, leaderId },
      {
        onSuccess: (res) => {
          setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
        },
      },
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-[#eef0f3] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
      <header className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2ba85b]/10 text-[#2ba85b]">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">AI Beta</h2>
            <p className="text-xs text-muted-foreground">Powered by live backend data</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground">
          <Plus className="h-5 w-5" aria-hidden />
          <button type="button" aria-label="Chat history" onClick={openHistory} className="rounded-full p-1 hover:bg-muted">
            <History className="h-5 w-5" />
          </button>
          <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> AI
          </span>
        </div>
      </header>

      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="max-h-[70vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3">
              <div>
                <h3 className="font-bold text-foreground">Chat History</h3>
                <p className="text-xs text-muted-foreground">Your previous conversations</p>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowHistory(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <ScrollArea className="max-h-[55vh]">
              <div className="divide-y divide-[#eef0f3]">
                {sessionsQuery.isLoading ? (
                  <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading history...
                  </div>
                ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
                  sessionsQuery.data.map((item, i) => (
                    <button
                      key={sessionKey(item) || i}
                      type="button"
                      onClick={() => openSession(sessionKey(item))}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{sessionTitle(item)}</p>
                        <p className="truncate text-xs text-muted-foreground">{sessionTimestamp(item)}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">No chat history found</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Angular's ai-chat.component.html renders these three summary cards
          with hardcoded placeholder values ("-", "₹--", "--") regardless of
          real data — no binding exists in the source. Preserved as
          decorative, not wired to any real stats endpoint. */}
      <div className="grid grid-cols-1 gap-3 border-b border-[#eef0f3] p-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#eef0f3] p-3">
          <p className="text-xs font-medium text-muted-foreground">Total Workers</p>
          <p className="mt-1 text-2xl font-bold text-foreground">-</p>
        </div>
        <div className="rounded-xl border border-[#eef0f3] p-3">
          <p className="text-xs font-medium text-muted-foreground">Pending Payments</p>
          <p className="mt-1 text-2xl font-bold text-foreground">₹--</p>
        </div>
        <div className="rounded-xl border border-[#eef0f3] p-3">
          <p className="text-xs font-medium text-muted-foreground">Attendance Records</p>
          <p className="mt-1 text-2xl font-bold text-foreground">--</p>
        </div>
      </div>

      <div ref={chatBodyRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2ba85b]/10 text-[#2ba85b]">
            <Bot className="h-4 w-4" />
          </div>
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">
            Hi 👋 I&apos;m your AI Reports Assistant. Ask me anything about attendance, payments, sites, or workers —
            I&apos;ll answer using your live backend data.
          </div>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "bot" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2ba85b]/10 text-[#2ba85b]">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "rounded-tr-sm bg-[#2ba85b] text-white"
                  : "rounded-tl-sm bg-muted text-foreground prose prose-sm max-w-none"
              }`}
            >
              {msg.role === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
            </div>
          </div>
        ))}

        {sendMessage.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking...
          </div>
        )}
      </div>

      {showTryAsking && (
        <div className="border-t border-[#eef0f3] px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5" /> Try asking:
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectSuggestion(item)}
                className="rounded-full border border-[#eef0f3] px-3 py-1.5 text-xs text-foreground hover:bg-muted"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-[#eef0f3] p-3">
        <Button type="button" variant="ghost" size="icon" disabled title="Not implemented in the live Angular app">
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Input
          id="ai-chat-message"
          name="message"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask a question or tap the mic..."
          aria-label="Ask a question"
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon" disabled title="Not implemented in the live Angular app">
          <Mic className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" aria-label="Send message" onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
