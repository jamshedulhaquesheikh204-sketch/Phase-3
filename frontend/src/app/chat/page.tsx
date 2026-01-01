// ChatPage - Main chat interface
// Next.js App Router page with ChatKit integration and auth

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInput, ConversationList, MessageBubble } from '@/components/chat';
import { useChat } from '@/hooks/useChat';
import { validateEnv } from '@/lib/env-validate';
import { Sparkles, Menu, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
  } = useChat();

  // Check auth and validate env
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }
    setIsAuthenticated(true);

    // Validate environment
    const { valid, errors } = validateEnv();
    if (!valid) {
      setEnvError(errors.join('\n'));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    sessionStorage.removeItem('currentConversationId');
    router.push('/signin');
  };

  const handleSelectConversation = async (id: number) => {
    await selectConversation(id);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (envError) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-md">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle size={18} />
            Configuration Error
          </h2>
          <pre className="text-sm whitespace-pre-wrap">{envError}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={startNewConversation}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 py-3 border-b flex items-center gap-3 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="bg-blue-500 p-2 rounded-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Todo Assistant</h1>
            <p className="text-xs text-gray-500">Natural language task management</p>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 lg:px-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          {isLoading && <LoadingIndicator />}
          {error && <ErrorMessage message={error} />}
          <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-blue-50 p-4 rounded-full inline-flex mb-4">
          <Sparkles size={32} className="text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Chat with your AI Assistant
        </h2>
        <p className="text-gray-500 mb-6">
          Ask me to add, list, update, or complete your tasks using natural language.
        </p>
        <div className="text-sm text-gray-400 space-y-2">
          <p>Try saying:</p>
          <p className="font-medium text-gray-600">&ldquo;Add buy groceries to my list&rdquo;</p>
          <p className="font-medium text-gray-600">&ldquo;What tasks do I have?&rdquo;</p>
          <p className="font-medium text-gray-600">&ldquo;Mark task 1 as complete&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}
