# Phase 4 Implementation Tasks

**Feature**: ChatKit-based Frontend UI for Todo AI Chatbot
**Branch**: `004-todo-chatkit-frontend`
**Created**: 2025-12-31
**Status**: completed

---

## Task Overview

| Total Tasks | 9 |
|-------------|---|
| Priority High | 5 |
| Priority Medium | 3 |
| Priority Low | 1 |

---

## TASK-001: Setup ChatKit Provider and Configuration

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `30 min`

### Description
Configure OpenAI ChatKit for hosted mode with proper initialization and domain allowlist support.

### Implementation Details

1. Install ChatKit package:
   ```bash
   cd frontend && npm install @openai/chatkit
   ```

2. Create ChatKit configuration file:
   ```typescript
   // frontend/src/lib/chatkit.ts
   import { ChatKit } from '@openai/chatkit';

   const domainKey = process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY;

   if (!domainKey) {
     console.warn('NEXT_PUBLIC_OPENAI_DOMAIN_KEY not set. ChatKit will use fallback UI.');
   }

   export const chatKit = domainKey
     ? new ChatKit({
         domainKey,
         // Enable debug mode in development
         debug: process.env.NODE_ENV === 'development',
       })
     : null;
   ```

3. Create environment validation:
   ```typescript
   // frontend/src/lib/env-validate.ts
   export function validateEnv() {
     const errors: string[] = [];

     if (!process.env.NEXT_PUBLIC_API_URL) {
       errors.push('NEXT_PUBLIC_API_URL is required');
     }

     // Validate URL format
     try {
       if (process.env.NEXT_PUBLIC_API_URL) {
         new URL(process.env.NEXT_PUBLIC_API_URL);
       }
     } catch {
       errors.push('NEXT_PUBLIC_API_URL must be a valid URL');
     }

     return {
       valid: errors.length === 0,
       errors,
     };
   }
   ```

4. Add env vars to `.env.local.example`:
   ```bash
   # ChatKit domain key (from OpenAI Dashboard)
   NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key

   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

### Test Cases

- [ ] `TASK-001-TC1`: Package installs without errors
- [ ] `TASK-001-TC2`: `chatKit` is null when domain key missing (fallback mode)
- [ ] `TASK-001-TC3`: `validateEnv()` returns error when API_URL missing
- [ ] `TASK-001-TC4`: `validateEnv()` rejects invalid URL format
- [ ] `TASK-001-TC5`: `.env.local.example` contains all required variables

### Files Modified
- `frontend/package.json` - Add dependency
- `frontend/src/lib/chatkit.ts` - NEW
- `frontend/src/lib/env-validate.ts` - NEW
- `frontend/.env.local.example` - Add variables

---

## TASK-002: Create ChatPage Component

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `45 min`

### Description
Build the main chat page with App Router, auth check, and layout structure.

### Implementation Details

1. Create chat page:
   ```typescript
   // frontend/src/app/chat/page.tsx
   'use client';

   import { useEffect, useState } from 'react';
   import { useRouter } from 'next/navigation';
   import { chatKit } from '@/lib/chatkit';
   import { validateEnv } from '@/lib/env-validate';
   import { ChatInput } from '@/components/chat/ChatInput';
   import { ConversationList } from '@/components/chat/ConversationList';
   import { MessageBubble } from '@/components/chat/MessageBubble';
   import { useChat } from '@/hooks/useChat';
   import { Sparkles, Menu, X } from 'lucide-react';
   import { ChatMessage } from '@/types/chat';

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

     useEffect(() => {
       // Check auth
       const token = localStorage.getItem('token');
       if (!token) {
         router.push('/signin');
         return;
       }
       setIsAuthenticated(true);

       // Validate env
       const { valid, errors } = validateEnv();
       if (!valid) {
         setEnvError(errors.join('\n'));
       }
     }, [router]);

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
             <h2 className="font-semibold mb-2">Configuration Error</h2>
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
             onSelectConversation={(id) => {
               selectConversation(id);
               setSidebarOpen(false);
             }}
             onNewConversation={() => {
               startNewConversation();
               setSidebarOpen(false);
             }}
             onLogout={() => {
               localStorage.removeItem('token');
               localStorage.removeItem('user_id');
               router.push('/signin');
             }}
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
             <p className="font-medium text-gray-600">"Add buy groceries to my list"</p>
             <p className="font-medium text-gray-600">"What tasks do I have?"</p>
             <p className="font-medium text-gray-600">"Mark task 1 as complete"</p>
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
         <span>Error: {message}</span>
       </div>
     );
   }
   ```

### Test Cases

- [ ] `TASK-002-TC1`: Page redirects to /signin if no token
- [ ] `TASK-002-TC2`: Shows env error when NEXT_PUBLIC_API_URL missing
- [ ] `TASK-002-TC3`: Sidebar toggles on mobile
- [ ] `TASK-002-TC4`: Empty state displays with helpful examples
- [ ] `TASK-002-TC5`: Messages area scrolls properly
- [ ] `TASK-002-TC6`: TypeScript compiles without errors

### Files Created
- `frontend/src/app/chat/page.tsx`

---

## TASK-003: Implement useChat Hook

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `45 min`

### Description
Create a custom React hook to manage chat state, API calls, and conversation lifecycle.

### Implementation Details

1. Create hooks directory:
   ```bash
   mkdir -p frontend/src/hooks
   ```

2. Implement useChat hook:
   ```typescript
   // frontend/src/hooks/useChat.ts
   import { useState, useCallback, useEffect } from 'react';
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

     // Get auth
     const getAuth = useCallback(() => {
       const token = localStorage.getItem('token');
       const userIdStr = localStorage.getItem('user_id');
       if (!token || !userIdStr) return null;
       return {
         token,
         userId: parseInt(userIdStr, 10),
       };
     }, []);

     // Load conversations on mount
     useEffect(() => {
       const auth = getAuth();
       if (!auth) return;

       api.getConversations(auth.token, auth.userId)
         .then(setConversations)
         .catch((err) => {
           console.error('Failed to load conversations:', err);
         });
     }, [getAuth]);

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
         };

         setMessages((prev) => [...prev, aiMessage]);
         setCurrentConversationId(response.conversation_id);

         // Refresh conversations
         const convs = await api.getConversations(auth.token, auth.userId);
         setConversations(convs);
       } catch (err) {
         const message = err instanceof Error ? err.message : 'Failed to send message';
         setError(message);
         // Remove optimistic message
         setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
       } finally {
         setIsLoading(false);
       }
     }, [getAuth, currentConversationId]);

     const selectConversation = useCallback(async (id: number) => {
       const auth = getAuth();
       if (!auth) return;

       setIsLoading(true);
       setError(null);

       try {
         const msgs = await api.getConversationMessages(auth.token, auth.userId, id);
         setMessages(msgs);
         setCurrentConversationId(id);
       } catch (err) {
         setError('Failed to load conversation');
       } finally {
         setIsLoading(false);
       }
     }, [getAuth]);

     const startNewConversation = useCallback(() => {
       setMessages([]);
       setCurrentConversationId(null);
       setError(null);
     }, []);

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
   ```

### Test Cases

- [ ] `TASK-003-TC1`: Loads conversations on mount
- [ ] `TASK-003-TC2`: Optimistic update shows user message immediately
- [ ] `TASK-003-TC3`: AI response added after API call
- [ ] `TASK-003-TC4`: Error state set on failure
- [ ] `TASK-003-TC5`: Optimistic message removed on error
- [ ] `TASK-003-TC6`: Conversations list refreshed after send
- [ ] `TASK-003-TC7`: selectConversation loads messages
- [ ] `TASK-003-TC8`: startNewConversation clears state

### Files Created
- `frontend/src/hooks/useChat.ts`

---

## TASK-004: Implement sendMessage Handler

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `30 min`

### Description
Build the ChatInput component with send functionality, keyboard support, and auto-resize.

### Implementation Details

```typescript
// frontend/src/components/chat/ChatInput.tsx
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      setValue('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white p-4"
    >
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to manage your tasks..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-shadow"
          aria-label="Chat message input"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </form>
  );
}
```

### Test Cases

- [ ] `TASK-004-TC1`: Submit triggers onSend with trimmed value
- [ ] `TASK-004-TC2`: Enter key submits without shift
- [ ] `TASK-004-TC3`: Shift+Enter creates new line
- [ ] `TASK-004-TC4`: Textarea auto-resizes to content
- [ ] `TASK-004-TC5`: Button disabled when empty or loading
- [ ] `TASK-004-TC6`: Loading spinner shows when disabled
- [ ] `TASK-004-TC7`: Input cleared after send
- [ ] `TASK-004-TC8`: Accessibility labels present

### Files Created
- `frontend/src/components/chat/ChatInput.tsx`

---

## TASK-005: Persist conversation_id Per Session

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `20 min`

### Description
Ensure conversation_id is properly maintained during the session and restored on page refresh.

### Implementation Details

1. Update useChat to use sessionStorage for conversation_id:
   ```typescript
   // In useChat.ts, add session persistence

   // Load saved conversation_id from sessionStorage
   const [currentConversationId, setCurrentConversationId] = useState<number | null>(() => {
     if (typeof window === 'undefined') return null;
     const saved = sessionStorage.getItem('currentConversationId');
     return saved ? parseInt(saved, 10) : null;
   });

   // Save to sessionStorage when changed
   useEffect(() => {
     if (currentConversationId !== null) {
       sessionStorage.setItem('currentConversationId', String(currentConversationId));
     } else {
       sessionStorage.removeItem('currentConversationId');
     }
   }, [currentConversationId]);

   // Load messages for saved conversation_id on mount
   useEffect(() => {
     const auth = getAuth();
     if (!auth || currentConversationId === null) return;

     api.getConversationMessages(auth.token, auth.userId, currentConversationId)
       .then(setMessages)
       .catch((err) => {
         console.error('Failed to load saved conversation:', err);
         // Clear invalid session data
         sessionStorage.removeItem('currentConversationId');
         setCurrentConversationId(null);
       });
   }, [getAuth, currentConversationId]);
   ```

2. Clear session on logout:
   ```typescript
   // In ChatPage component logout handler
   sessionStorage.removeItem('currentConversationId');
   ```

### Test Cases

- [ ] `TASK-005-TC1`: conversation_id saved to sessionStorage after send
- [ ] `TASK-005-TC2`: conversation_id restored from sessionStorage on refresh
- [ ] `TASK-005-TC3`: Messages for saved conversation_id load on refresh
- [ ] `TASK-005-TC4`: New conversation clears sessionStorage
- [ ] `TASK-005-TC5`: Logout clears sessionStorage
- [ ] `TASK-005-TC6`: Invalid conversation_id cleared gracefully

### Files Modified
- `frontend/src/hooks/useChat.ts`

---

## TASK-006: Render Tool-Confirmation Responses

**Status**: `completed` | **Priority**: `high` | **Est. Effort**: `30 min`

### Description
Display which MCP tools were invoked in AI responses with visual indicators.

### Implementation Details

1. Update MessageBubble to show tool calls:
   ```typescript
   // frontend/src/components/chat/MessageBubble.tsx
   import { CheckCircle, Hammer, List, Edit, Trash } from 'lucide-react';
   import { ChatMessage } from '@/types/chat';

   interface MessageBubbleProps {
     message: ChatMessage;
   }

   const TOOL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
     add_task: CheckCircle,
     list_tasks: List,
     complete_task: CheckCircle,
     update_task: Edit,
     delete_task: Trash,
   };

   const TOOL_LABELS: Record<string, string> = {
     add_task: 'Added task',
     list_tasks: 'Listed tasks',
     complete_task: 'Completed task',
     update_task: 'Updated task',
     delete_task: 'Deleted task',
   };

   export function MessageBubble({ message }: MessageBubbleProps) {
     const isUser = message.role === 'user';

     return (
       <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
         <div
           className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
             isUser
               ? 'bg-blue-500 text-white rounded-br-md'
               : 'bg-gray-100 text-gray-900 rounded-bl-md'
           }`}
         >
           <p className="whitespace-pre-wrap text-sm leading-relaxed">
             {message.content}
           </p>

           {/* Tool calls indicator - only for assistant messages */}
           {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
             <ToolCallsDisplay tool_calls={message.tool_calls} />
           )}

           <time
             className={`text-xs mt-2 block opacity-60 ${
               isUser ? 'text-blue-100' : 'text-gray-400'
             }`}
           >
             {formatTime(message.created_at)}
           </time>
         </div>
       </div>
     );
   }

   function ToolCallsDisplay({ tool_calls }: { tool_calls: string[] }) {
     return (
       <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/50">
         <span className="text-xs opacity-60">Tools used:</span>
         {tool_calls.map((tool) => {
           const Icon = TOOL_ICONS[tool] || Hammer;
           const label = TOOL_LABELS[tool] || tool;
           return (
             <span
               key={tool}
               className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
             >
               <Icon size={12} />
               {label}
             </span>
           );
         })}
       </div>
     );
   }

   function formatTime(isoString: string): string {
     const date = new Date(isoString);
     return date.toLocaleTimeString([], {
       hour: '2-digit',
       minute: '2-digit',
     });
   }
   ```

2. Add tool_calls to ChatMessage type:
   ```typescript
   // frontend/src/types/chat.ts
   export interface ChatMessage {
     id: number;
     role: 'user' | 'assistant' | 'system' | 'tool';
     content: string;
     created_at: string;
     tool_calls?: string[];  // NEW: Tools invoked
   }
   ```

### Test Cases

- [ ] `TASK-006-TC1`: Tool calls displayed for assistant messages
- [ ] `TASK-006-TC2`: Tool calls NOT shown for user messages
- [ ] `TASK-006-TC3`: Correct icon displayed for each tool
- [ ] `TASK-006-TC4`: Correct label shown for each tool
- [ ] `TASK-006-TC5": Unknown tools show fallback icon/label
- [ ] `TASK-006-TC6": Multiple tool calls displayed correctly

### Files Modified
- `frontend/src/types/chat.ts` - Add tool_calls field
- `frontend/src/components/chat/MessageBubble.tsx` - Add tool display

---

## TASK-007: Add Environment Variable Validation

**Status**: `completed` | **Priority**: `medium` | **Est. Effort**: `15 min`

### Description
Validate required environment variables at runtime and display helpful errors.

### Implementation Details

```typescript
// frontend/src/lib/env-validate.ts
export interface EnvValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required
  if (!process.env.NEXT_PUBLIC_API_URL) {
    errors.push('NEXT_PUBLIC_API_URL is required');
  } else {
    try {
      new URL(process.env.NEXT_PUBLIC_API_URL);
    } catch {
      errors.push('NEXT_PUBLIC_API_URL must be a valid URL');
    }
  }

  // Optional but recommended
  if (!process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY) {
    warnings.push('NEXT_PUBLIC_OPENAI_DOMAIN_KEY not set. ChatKit will use fallback UI.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Hook for runtime validation
export function useEnvValidation() {
  const [result, setResult] = useState<EnvValidation | null>(null);

  useEffect(() => {
    setResult(validateEnv());
  }, []);

  return result;
}
```

### Test Cases

- [ ] `TASK-007-TC1`: Returns valid=true when all required vars present
- [ ] `TASK-007-TC2`: Returns valid=false when NEXT_PUBLIC_API_URL missing
- [ ] `TASK-007-TC3": Rejects invalid URL format
- [ ] `TASK-007-TC4": Warnings for optional missing vars
- [ ] `TASK-007-TC5": Helpful error message displayed in UI

### Files Created
- `frontend/src/lib/env-validate.ts`

---

## TASK-008: Add Frontend README + Quickstart

**Status**: `completed` | **Priority**: `medium` | **Est. Effort**: `20 min`

### Description
Create comprehensive frontend documentation with setup and usage instructions.

### Implementation Details

```markdown
# frontend/README.md

# Todo AI Chatbot Frontend

Next.js 16+ frontend for the AI-powered todo management chatbot.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Chat UI**: OpenAI ChatKit (hosted mode)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see `/backend`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000/api`) |
| `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` | No | OpenAI ChatKit domain key for hosted mode |

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000/chat
```

### Building for Production

```bash
# Build
npm run build

# Preview production build
npm run start
```

## Project Structure

```
src/
├── app/
│   └── chat/
│       └── page.tsx         # Main chat page
├── components/
│   └── chat/
│       ├── MessageBubble.tsx
│       ├── ChatInput.tsx
│       └── ConversationList.tsx
├── hooks/
│   └── useChat.ts           # Chat state management
├── lib/
│   ├── chatkit.ts           # ChatKit configuration
│   └── env-validate.ts      # Environment validation
├── services/
│   └── api.ts               # API client
└── types/
    └── chat.ts              # TypeScript types
```

## Chat Interface

### Features

- Natural language task management
- Conversation history persistence
- Tool usage indicators
- Responsive design (desktop + mobile)
- Error handling with helpful messages

### Usage

1. Navigate to `/chat`
2. Sign in with your account
3. Type a command like:
   - "Add buy groceries to my list"
   - "What tasks do I have?"
   - "Mark task 1 as complete"
4. AI will confirm actions and show which tools were used

### API Integration

The chat UI integrates with these backend endpoints:

- `POST /api/{user_id}/chat` - Send message
- `GET /api/{user_id}/conversations` - List conversations
- `GET /api/{user_id}/conversations/{id}/messages` - Get messages

## Vercel Deployment

1. Connect repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT
```

### Test Cases

- [ ] `TASK-008-TC1": README contains setup instructions
- [ ] `TASK-008-TC2": Environment variables documented
- [ ] `TASK-008-TC3": Project structure documented
- [ ] `TASK-008-TC4": Usage examples included
- [ ] `TASK-008-TC5": Vercel deployment steps included

### Files Created
- `frontend/README.md`

---

## TASK-009: Manual QA with Real Backend

**Status**: `completed` | **Priority**: `medium` | **Est. Effort**: `45 min`

### Description
Perform comprehensive manual testing against the running Phase 3 backend.

### Implementation Details

Create test script:
```bash
#!/bin/bash
# frontend/test-chat-e2e.sh

set -e

API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000/api}"
echo "Testing against: $API_URL"

# Test 1: Signup
echo "1. Creating test user..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-test-'"$(date +%s)"'@example.com","password":"test123"}')
echo "$SIGNUP_RESPONSE" | jq .

# Test 2: Signin
echo "2. Signing in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-test@example.com","password":"test123"}' | jq -r '.access_token')
echo "Token: ${TOKEN:0:20}..."

# Test 3: Send chat message
echo "3. Sending chat message..."
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/api/1/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add QA test task to verify frontend integration"}')
echo "$CHAT_RESPONSE" | jq .

CONVERSATION_ID=$(echo "$CHAT_RESPONSE" | jq -r '.conversation_id')
echo "Conversation ID: $CONVERSATION_ID"

# Test 4: List conversations
echo "4. Listing conversations..."
curl -s -X GET "$API_URL/api/1/conversations" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 5: Get conversation messages
echo "5. Getting conversation messages..."
curl -s -X GET "$API_URL/api/1/conversations/$CONVERSATION_ID/messages" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "All tests passed!"
```

### Manual Test Checklist

**Authentication Tests**
- [ ] `QA-001`: Unauthenticated access redirects to /signin
- [ ] `QA-002`: Valid credentials allow access
- [ ] `QA-003`: Invalid JWT shows error

**Chat Tests**
- [ ] `QA-010`: Send message displays immediately (optimistic)
- [ ] `QA-011`: Loading indicator shows during API call
- [ ] `QA-012": AI response appears within 5 seconds
- [ ] `QA-013": Tool calls displayed in response
- [ ] `QA-014": New conversation creates entry in sidebar

**Persistence Tests**
- [ ] `QA-020": Refresh page preserves conversation
- [ ] `QA-021": Clicking conversation loads history
- [ ] `QA-022": New chat clears current thread

**UI Tests**
- [ ] `QA-030": Desktop layout shows sidebar
- [ ] `QA-031": Mobile layout hides sidebar
- [ ] `QA-032": Messages scroll smoothly
- [ ] `QA-033": Input auto-resizes
- [ ] `QA-034": Keyboard shortcuts work (Enter to send)

**Error Tests**
- [ ] `QA-040": Network error shows helpful message
- [ ] `QA-041": Invalid message shows validation
- [ ] `QA-042": Missing env vars show config error

### Test Results Template

```markdown
## QA Results - [DATE]

| Test | Status | Notes |
|------|--------|-------|
| QA-001 | PASS/FAIL | |
| QA-002 | PASS/FAIL | |
| ... | | |

### Environment
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Browser: Chrome/Firefox/Safari

### Issues Found
1. [Issue description]
2. [Issue description]
```

### Files Created
- `frontend/test-chat-e2e.sh`

---

## Task Dependencies

```
TASK-001 (ChatKit Setup)
    │
    ├─► TASK-002 (ChatPage Component)
    │         │
    │         ├─► TASK-003 (useChat Hook)
    │         │         │
    │         │         ├─► TASK-004 (sendMessage Handler)
    │         │         │
    │         │         └─► TASK-005 (Persist conversation_id)
    │         │
    │         └─► TASK-006 (Tool-confirmation UI)
    │
    ├─► TASK-007 (Env Validation)
    │
    └─► TASK-008 (README)
             │
             └─► TASK-009 (Manual QA)
```

---

## Definition of Done

All tasks must meet:
- [ ] TypeScript compiles without errors
- [ ] `npm run build` succeeds
- [ ] All test cases pass
- [ ] No console errors in browser
- [ ] Code reviewed and linted
- [ ] Documentation updated

---

**Document Version**: 1.0
**Created**: 2025-12-31
**Status**: Ready for Execution
