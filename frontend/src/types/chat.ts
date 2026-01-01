// Chat types - Phase 4
// API contracts for chat endpoints

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  created_at: string;
  tool_calls?: string[];
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: string[];
}

export interface ConversationListItem {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}
