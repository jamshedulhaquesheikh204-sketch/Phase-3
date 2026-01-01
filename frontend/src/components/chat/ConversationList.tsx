// ConversationList component - Sidebar with conversation navigation
// Displays list of conversations with new chat and logout options

import { Conversation } from '@/types/chat';
import { MessageSquare, Plus, LogOut } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onLogout: () => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onLogout,
}: ConversationListProps) {
  return (
    <aside className="w-64 bg-gray-50 border-r flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="truncate text-sm">
                    {conv.title || 'New Conversation'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full text-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
