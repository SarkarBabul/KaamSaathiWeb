// Verified against ai-chat.component.ts and ai-report.service.ts. The
// backend's session/history/message shapes are not fixed contracts — Angular
// itself reads several possible field names defensively (item.id ||
// item.sessionId || item.session_id, etc.) rather than trusting one shape.
// Kept loose here for the same reason, not tightened into a stricter type
// the source doesn't actually guarantee.

export type ChatRole = "user" | "bot";

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface ChatSendResponse {
  reply: string;
}

export interface ChatSessionRaw {
  id?: string;
  sessionId?: string;
  session_id?: string;
  title?: string;
  name?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ChatHistoryItemRaw {
  role?: string;
  sender?: string;
  type?: string;
  message?: string;
  content?: string;
  text?: string;
  reply?: string;
  [key: string]: unknown;
}
