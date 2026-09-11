import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmployerChatHistory,
  getEmployerChatSessions,
  sendEmployerChatMessage,
} from "@/app-desktop/api/employerAiChat.api";
import type { ChatHistoryItemRaw, ChatMessage, ChatSessionRaw } from "@/app-desktop/types/employerAiChat";

// Mirrors ai-chat.component.ts's defensive unwrapping exactly — the backend
// response shape for these two endpoints isn't a fixed contract; Angular
// itself tries several possible field names rather than trusting one shape.
function extractSessions(res: unknown): ChatSessionRaw[] {
  if (Array.isArray(res)) return res as ChatSessionRaw[];
  const obj = res as { data?: unknown; sessionsId?: unknown } | null | undefined;
  if (Array.isArray(obj?.data)) return obj.data as ChatSessionRaw[];
  if (Array.isArray(obj?.sessionsId)) return obj.sessionsId as ChatSessionRaw[];
  return [];
}

function extractHistory(res: unknown): ChatHistoryItemRaw[] {
  if (Array.isArray(res)) return res as ChatHistoryItemRaw[];
  const obj = res as { data?: unknown; messages?: unknown } | null | undefined;
  if (Array.isArray(obj?.data)) return obj.data as ChatHistoryItemRaw[];
  if (Array.isArray(obj?.messages)) return obj.messages as ChatHistoryItemRaw[];
  return [];
}

export function sessionKey(session: ChatSessionRaw): string {
  return String(session.id || session.sessionId || session.session_id || "");
}

export function sessionTitle(session: ChatSessionRaw): string {
  return String(session.title || session.name || session.message || "AI Conversation");
}

export function sessionTimestamp(session: ChatSessionRaw): string {
  return String(session.createdAt || session.updatedAt || "");
}

export function useEmployerChatSessions(leaderId: string) {
  return useQuery({
    queryKey: ["employerChatSessions", leaderId],
    queryFn: async () => extractSessions(await getEmployerChatSessions(leaderId)),
    enabled: !!leaderId,
  });
}

export function useSendEmployerChatMessage() {
  return useMutation({
    mutationFn: ({ message, leaderId }: { message: string; leaderId: string }) =>
      sendEmployerChatMessage(message, leaderId),
  });
}

export function useEmployerChatHistory() {
  return useMutation({
    mutationFn: async (sessionId: string): Promise<ChatMessage[]> => {
      const items = extractHistory(await getEmployerChatHistory(sessionId));
      return items.map((item) => {
        const role = item.role || item.sender || item.type;
        const text = item.message || item.content || item.text || item.reply || "";
        return { role: role === "user" ? "user" : "bot", text } satisfies ChatMessage;
      });
    },
  });
}
