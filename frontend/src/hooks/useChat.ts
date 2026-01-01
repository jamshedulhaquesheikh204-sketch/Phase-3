// useChat hook - Chat state management
// Handles conversation state, API calls, and session persistence

import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { ChatMessage, Conversation } from '@/types/chat';

interface UseChatReturn {
  messages: ChatMessage[];
  conversations: Conversation[];
  currentConversationId: number | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  startNewConversation: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get auth from localStorage
  const getAuth = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    const userIdStr = localStorage.getItem('user_id');
    if (!token || !userIdStr) return null;
    return {
      token,
      userId: parseInt(userIdStr, 10),
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    mountedRef.current = true;
    const auth = getAuth();
    if (!auth) return;

    api.getConversations(auth.token, auth.userId)
      .then((convs) => {
        if (mountedRef.current) {
          setConversations(convs);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          console.error('Failed to load conversations:', err);
        }
      });

    // Load saved conversation from sessionStorage
    const savedId = sessionStorage.getItem('currentConversationId');
    if (savedId) {
      selectConversation(parseInt(savedId, 10));
    }

    return () => {
      mountedRef.current = false;
    };
  }, [getAuth]);

  const selectConversation = useCallback(async (id: number) => {
    const auth = getAuth();
    if (!auth) return;

    setIsLoading(true);
    setError(null);

    try {
      const msgs = await api.getConversationMessages(auth.token, auth.userId, id);
      if (mountedRef.current) {
        setMessages(msgs);
        setCurrentConversationId(id);
        sessionStorage.setItem('currentConversationId', String(id));
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Failed to load conversation');
        sessionStorage.removeItem('currentConversationId');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getAuth]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
    sessionStorage.removeItem('currentConversationId');
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const auth = getAuth();
    if (!auth) return;

    setIsLoading(true);
    setError(null);

    // Optimistic update
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await api.sendChatMessage(
        auth.token,
        auth.userId,
        content,
        currentConversationId || undefined
      );

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.response,
        created_at: new Date().toISOString(),
        tool_calls: response.tool_calls,
      };

      if (mountedRef.current) {
        setMessages((prev) => [...prev, aiMessage]);
        setCurrentConversationId(response.conversation_id);
        sessionStorage.setItem('currentConversationId', String(response.conversation_id));

        // Refresh conversations list
        const convs = await api.getConversations(auth.token, auth.userId);
        setConversations(convs);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      if (mountedRef.current) {
        setError(message);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [getAuth, currentConversationId]);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
  };
}
