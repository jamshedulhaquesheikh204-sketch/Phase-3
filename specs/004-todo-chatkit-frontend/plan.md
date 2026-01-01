# Phase 4 Implementation Plan

**Feature**: ChatKit-based Frontend UI for Todo AI Chatbot
**Branch**: `004-todo-chatkit-frontend`
**Created**: 2025-12-31
**Status**: Ready for Implementation

---

## Overview

This plan implements a production-ready chat UI using OpenAI ChatKit in hosted mode. The implementation follows the UI requirements specification and integrates with the verified Phase 3 backend.

**Total Steps**: 10
**Estimated Effort**: 3-4 hours

---

## Step 1: Create /frontend/chat Page (App Router)

### Objective
Create the main chat page using Next.js 16 App Router with client-side interactivity.

### Files Created
```
frontend/src/app/chat/
└── page.tsx          # Main chat page (client component)
```

### Implementation Details
- Use `'use client'` directive for React hooks
- Implement auth check in useEffect (redirect to /signin if no token)
- Load conversations list on mount
- Manage chat state: messages, loading, errors, currentConversationId
- Auto-scroll to newest message using ref

### Code Structure
```typescript
// frontend/src/app/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // ... additional state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/signin');
    else setIsAuthenticated(true);
  }, []);

  // ... render logic
}
```

### Acceptance Criteria
- [ ] Page renders at /chat route
- [ ] Redirects to /signin if not authenticated
- [ ] Loads and displays without errors
- [ ] TypeScript compiles without errors

---

## Step 2: Install and Configure OpenAI ChatKit

### Objective
Install OpenAI ChatKit and configure it for hosted mode with domain allowlist.

### Dependencies Added
```bash
npm install @openai/chatkit
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

### Configuration
```typescript
// frontend/src/lib/chatkit.ts
import { ChatKit } from '@openai/chatkit';

export const chatKit = new ChatKit({
  domainKey: process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY,
});
```

### Domain Allowlist Setup
1. Go to OpenAI Dashboard → ChatKit → Domain Settings
2. Add allowed domains:
   - `localhost` (development)
   - `*.vercel.app` (preview/production)
   - Custom domain (if applicable)

### Acceptance Criteria
- [ ] ChatKit package installed
- [ ] Environment variables configured
- [ ] Domain allowlist set in OpenAI dashboard
- [ ] No build errors from missing dependencies

---

## Step 3: Implement API Client for /api/{user_id}/chat

### Objective
Extend the existing API service with chat-specific methods.

### Files Modified
```
frontend/src/services/api.ts
```

### Methods Added
```typescript
export const api = {
  // ... existing methods

  // Chat methods - Phase 4
  async sendChatMessage(
    token: string,
    userId: number,
    message: string,
    conversationId?: number
  ): Promise<ChatResponse> {
    const res = await fetch(`${API_URL}/${userId}/chat`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Chat request failed');
    }
    return res.json();
  },

  async getConversations(token: string, userId: number): Promise<Conversation[]> {
    const res = await fetch(`${API_URL}/${userId}/conversations`, {
      headers: getHeaders(token),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getConversationMessages(
    token: string,
    userId: number,
    conversationId: number
  ): Promise<ChatMessage[]> {
    const res = await fetch(
      `${API_URL}/${userId}/conversations/${conversationId}/messages`,
      { headers: getHeaders(token) }
    );
    if (!res.ok) throw await res.json();
    return res.json();
  },
};
```

### Types Required
```typescript
// frontend/src/types/chat.ts
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: string[];
}
```

### Acceptance Criteria
- [ ] API methods call correct endpoints
- [ ] Types match backend contracts
- [ ] Errors throw with meaningful messages
- [ ] TypeScript compilation passes

---

## Step 4: Attach JWT Automatically to Requests

### Objective
Ensure JWT token is attached to every API request without manual handling.

### Implementation
The existing `getHeaders()` function in `api.ts` handles this:

```typescript
const getHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: 'Bearer ' + token } : {}),
});
```

### Usage Pattern
```typescript
// In chat page
const token = localStorage.getItem('token');
if (!token) {
  router.push('/signin');
  return;
}

// All API calls use the token
const response = await api.sendChatMessage(token, userId, message, conversationId);
```

### Security Considerations
- Token retrieved from localStorage (Phase 2 pattern)
- No token logging or exposure
- 401/403 errors redirect to signin

### Acceptance Criteria
- [ ] JWT attached to all chat API calls
- [ ] Auth errors handled (redirect to signin)
- [ ] No token in URLs or logs
- [ ] User ID from JWT used for isolation

---

## Step 5: Persist conversation_id in Local State

### Objective
Maintain conversation context using React state (not URL or localStorage).

### State Management
```typescript
const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
```

### Flow
1. New conversation: `conversationId = null` → Backend creates new
2. Existing conversation: `conversationId = number` → Backend loads history
3. Response returns: Update `currentConversationId` with returned ID

### Conversation Continuity
```typescript
const handleSendMessage = async (message: string) => {
  const response = await api.sendChatMessage(
    token,
    userId,
    message,
    currentConversationId || undefined  // Send null for new, ID for existing
  );

  // Backend returns the conversation ID (new or existing)
  setCurrentConversationId(response.conversation_id);
};
```

### Sidebar Integration
```typescript
const handleSelectConversation = (id: number) => {
  const messages = await api.getConversationMessages(token, userId, id);
  setMessages(messages);
  setCurrentConversationId(id);
};

const handleNewConversation = () => {
  setMessages([]);
  setCurrentConversationId(null);
};
```

### Acceptance Criteria
- [ ] conversation_id stored in React state
- [ ] New conversations work (null ID)
- [ ] Existing conversations load correctly
- [ ] State persists across renders

---

## Step 6: Render Message History from Backend

### Objective
Display conversation messages with proper user/assistant visual separation.

### Message Rendering
```typescript
// In chat page render
<div className="flex-1 overflow-y-auto p-4 space-y-4">
  {messages.map((msg) => (
    <MessageBubble key={msg.id} message={msg} />
  ))}
  <div ref={messagesEndRef} />
</div>
```

### MessageBubble Component
```typescript
// frontend/src/components/chat/MessageBubble.tsx
interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-900 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <time className="text-xs mt-1 block opacity-70">
          {formatTime(message.created_at)}
        </time>
      </div>
    </div>
  );
}
```

### Tool Calls Display
```typescript
{message.tool_calls && message.tool_calls.length > 0 && (
  <div className="flex gap-1 mt-2">
    {message.tool_calls.map((tool) => (
      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
        {tool}
      </span>
    ))}
  </div>
)}
```

### Acceptance Criteria
- [ ] User messages right-aligned, AI left-aligned
- [ ] Timestamps displayed
- [ ] Tool calls shown in AI responses
- [ ] Scrolls to newest message

---

## Step 7: Handle Loading, Errors, and Empty States

### Objective
Provide clear UX for all states: loading, error, empty, and success.

### Loading State
```typescript
const [isLoading, setIsLoading] = useState(false);

// In render
{isLoading && <LoadingIndicator />}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
```

### Error State
```typescript
const [error, setError] = useState<string | null>(null);

// In render
{error && (
  <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
    <AlertCircle size={18} />
    <span>{error}</span>
  </div>
)}
```

### Empty State
```typescript
{messages.length === 0 ? (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold mb-2">Chat with your AI Assistant</h2>
      <p className="text-gray-500 mb-4">Ask me to manage your tasks</p>
      <p className="text-sm text-gray-400">Try: "Add buy groceries"</p>
    </div>
  </div>
) : (
  messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
)}
```

### Error Handling Pattern
```typescript
try {
  setIsLoading(true);
  setError(null);
  const response = await api.sendChatMessage(token, userId, message, conversationId);
  // Handle success
} catch (err) {
  const message = err instanceof Error ? err.message : 'An error occurred';
  setError(message);
} finally {
  setIsLoading(false);
}
```

### Acceptance Criteria
- [ ] Loading indicator during API calls
- [ ] Error message on failure
- [ ] Helpful empty state when no messages
- [ ] Input disabled during loading

---

## Step 8: Add Responsive Styling

### Objective
Ensure the chat UI works on desktop (1024px+) and mobile (320px+).

### Layout Structure
```typescript
<div className="flex h-screen">
  <aside className="w-64 bg-gray-50 border-r hidden md:block">
    {/* Sidebar - desktop only */}
  </aside>
  <main className="flex-1 flex flex-col min-w-0">
    {/* Chat area - always visible */}
  </main>
</div>
```

### Mobile Responsive Adjustments
- Sidebar: Hidden by default, toggleable via button
- Message bubbles: Max-width 85% on mobile
- Input: Full width on mobile
- Padding: Reduced on small screens

### Tailwind Classes
```typescript
// Sidebar
className="w-64 bg-gray-50 border-r flex-col h-full hidden md:flex lg:w-72"

// Messages
className="max-w-[70%] md:max-w-[60%]"

// Input area
className="border-t bg-white p-3 md:p-4"
```

### Acceptance Criteria
- [ ] Works on 320px+ viewport
- [ ] Sidebar responsive (hidden on mobile)
- [ ] Touch targets minimum 44px
- [ ] No horizontal scroll on small screens

---

## Step 9: Verify Against Phase 3 Backend

### Objective
Test the frontend integration with the running Phase 3 backend.

### Prerequisites
```bash
# Start backend
cd backend
python -m uvicorn src.api.main:app --reload

# Start frontend (separate terminal)
cd frontend
npm run dev
```

### Test Cases

#### Test 1: Authentication
```bash
# Create test user and get token
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.access_token')
```

#### Test 2: Send Chat Message
```bash
curl -X POST "http://localhost:8000/api/1/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add buy groceries to my list"}'
```

**Expected Response**:
```json
{
  "conversation_id": 1,
  "response": "I've added 'buy groceries' to your list!",
  "tool_calls": ["add_task"]
}
```

#### Test 3: List Conversations
```bash
curl -X GET "http://localhost:8000/api/1/conversations" \
  -H "Authorization: Bearer $TOKEN"
```

#### Test 4: Get Conversation Messages
```bash
curl -X GET "http://localhost:8000/api/1/conversations/1/messages" \
  -H "Authorization: Bearer $TOKEN"
```

### Manual Testing Checklist
- [ ] Open http://localhost:3000/chat
- [ ] Redirects to /signin if not logged in
- [ ] After login, see chat interface
- [ ] Type "Add test task" → Send
- [ ] See loading indicator
- [ ] See AI response within 5 seconds
- [ ] Refresh page → Conversation persists
- [ ] Click "New Chat" → Clears messages

### Acceptance Criteria
- [ ] All API endpoints respond correctly
- [ ] JWT auth works on all requests
- [ ] Conversation persistence verified
- [ ] No console errors in browser

---

## Step 10: Prepare for Vercel Deployment

### Objective
Configure the frontend for production deployment on Vercel.

### Files Required

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_OPENAI_DOMAIN_KEY": "@domain-key"
  }
}
```

#### .env.local.example
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api

# ChatKit domain key (from OpenAI Dashboard)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

### Vercel Configuration Steps

1. **Import Project**
   - Connect GitHub repository to Vercel
   - Select `frontend` directory as root

2. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` (backend URL)
   - Add `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` (from OpenAI)

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Vercel automatically builds and deploys
   - Preview deployments for PRs
   - Production deployment on merge

### Post-Deployment Verification
- [ ] Production URL loads
- [ ] Authentication works
- [ ] Chat messages send/receive
- [ ] API_URL correctly pointing to backend

---

## File Changes Summary

### New Files Created
| File | Purpose |
|------|---------|
| `frontend/src/types/chat.ts` | Chat type definitions |
| `frontend/src/components/chat/MessageBubble.tsx` | Message display component |
| `frontend/src/components/chat/ChatInput.tsx` | Text input component |
| `frontend/src/components/chat/ConversationList.tsx` | Sidebar component |
| `frontend/src/components/chat/index.ts` | Barrel export |
| `frontend/src/app/chat/page.tsx` | Main chat page |
| `frontend/lib/chatkit.ts` | ChatKit configuration |
| `frontend/vercel.json` | Vercel deployment config |
| `frontend/.env.local.example` | Environment template |

### Files Modified
| File | Change |
|------|--------|
| `frontend/src/services/api.ts` | Added chat API methods |
| `frontend/src/pages/tasks.tsx` | Added chat link |
| `frontend/tsconfig.json` | Added path aliases |
| `frontend/package.json` | Added @openai/chatkit |

---

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend API changes | High | Test endpoints before frontend work |
| ChatKit configuration issues | Medium | Use fallback custom UI |
| JWT expiry during chat | Medium | Add auto-refresh or redirect |
| Mobile layout issues | Low | Test on real devices |

---

## Definition of Done

- [ ] TypeScript compiles without errors
- [ ] Build succeeds (`npm run build`)
- [ ] Chat page loads at /chat
- [ ] Authentication required
- [ ] Messages send/receive successfully
- [ ] Conversation history loads
- [ ] Loading states work
- [ ] Error states display
- [ ] Responsive on mobile
- [ ] Vercel deployment succeeds

---

**Plan Version**: 1.0
**Last Updated**: 2025-12-31
**Next**: Execute implementation steps
