import { api } from "@/app-desktop/api/httpClient";
import type { ChatSendResponse } from "@/app-desktop/types/employerAiChat";

// ai-report.service.ts calls this.api.post/get with no isEnterprise argument
// on any method — all three resolve to `default`.
const TARGET = "default" as const;

export function sendEmployerChatMessage(message: string, leaderId: string) {
  return api.post<ChatSendResponse>(TARGET, "/v2/chatbot/chat", { message, leaderId });
}

export function getEmployerChatSessions(leaderId: string) {
  return api.get<unknown>(TARGET, "/v2/chatbot/sessions", { leaderId });
}

export function getEmployerChatHistory(sessionId: string) {
  return api.get<unknown>(TARGET, `/v2/chatbot/history/${sessionId}`);
}
