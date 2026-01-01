# Phase 4 UI Requirements Specification

**Feature**: ChatKit-based Frontend UI for Todo AI Chatbot
**Created**: 2025-12-31
**Version**: 1.0

---

## 1. Technology Stack

### Framework
- **Next.js 16+** with App Router
- **React 19** (client components)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** for styling

### Chat UI Library
- **OpenAI ChatKit** (hosted mode)
- Domain allowlist configuration
- Message orchestration

---

## 2. Page Structure

### Route
```
/chat
```

### Layout
```
┌─────────────────────────────────────────┐
│ Sidebar      │  Main Chat Area          │
│              │                          │
│ • New Chat   │  ┌────────────────────┐  │
│ • Conv 1     │  │ Header             │  │
│ • Conv 2     │  ├────────────────────┤  │
│ • Conv 3     │  │                    │  │
│              │  │ Message List       │  │
│ ──────────── │  │ • User message     │  │
│ Sign Out     │  │ • AI response      │  │
│              │  │ • Loading state    │  │
│              │  │                    │  │
│              │  ├────────────────────┤  │
│              │  │ Chat Input         │  │
│              │  └────────────────────┘  │
└──────────────┴──────────────────────────┘
```

---

## 3. ChatKit Configuration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key
```

### ChatKit Initialization
```typescript
import { ChatKit } from '@openai/chatkit';

const chatKit = new ChatKit({
  domainKey: process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
});
```

### Domain Allowlist
- Configure in OpenAI Dashboard
- Support multiple domains (localhost, vercel.app, custom)
- Fallback for local development

---

## 4. API Integration

### Chat Endpoint
```
POST /api/{user_id}/chat
```

### Request Format
```typescript
{
  message: string;           // User's natural language input
  conversation_id?: number;  // Optional: resume existing conversation
}
```

### Response Format
```typescript
{
  conversation_id: number;   // New or existing conversation ID
  response: string;          // AI's natural language response
  tool_calls: string[];      // Tools invoked (e.g., ['add_task', 'list_tasks'])
}
```

### Authentication
- JWT token from localStorage
- Attach to Authorization header: `Bearer {token}`
- Validate on every request
- Redirect to /signin on 401/403

---

## 5. State Management

### Client State
```typescript
interface ChatState {
  messages: ChatMessage[];          // Current conversation
  conversations: Conversation[];    // Sidebar list
  currentConversationId: number | null;
  isLoading: boolean;
  error: string | null;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tool_calls?: string[];  // From AI response
}
```

### Stateless Backend
- All conversation history stored in PostgreSQL
- Fetch messages on conversation select
- No in-memory session storage
- Server restart preserves all data

---

## 6. UI Components

### MessageBubble
- Props: `message: ChatMessage`
- Styling: Right-aligned (user), Left-aligned (assistant)
- Visual distinction: Blue (user), Gray (assistant)
- Timestamp display

### ChatInput
- Props: `onSend: (message: string) => void`
- Features:
  - Multi-line support (Shift+Enter)
  - Auto-resize
  - Send button
  - Disabled state during loading

### ConversationList
- Props:
  - `conversations: Conversation[]`
  - `currentConversationId: number | null`
  - `onSelect: (id: number) => void`
  - `onNewConversation: () => void`
- Features:
  - New Chat button
  - Conversation list with titles
  - Active state highlighting

---

## 7. User Stories & Acceptance Criteria

### US-001: Send Message
**Scenario**: User sends natural language message to AI

```gherkin
Given I am authenticated and on /chat
When I type "Add buy groceries to my list" and send
Then I see my message in the chat
And I see a loading indicator
And within 5 seconds I see AI response
And the response confirms the task was added
```

**Acceptance**:
- [ ] Message appears immediately (optimistic)
- [ ] Loading indicator shows during API call
- [ ] AI response includes confirmation
- [ ] Response time < 5 seconds

---

### US-002: View Conversation History
**Scenario**: User returns to previous conversation

```gherkin
Given I previously had a conversation
When I refresh the page or return to /chat
Then I see the conversation in the sidebar
When I click on the conversation
Then I see all previous messages
And I can continue the conversation
```

**Acceptance**:
- [ ] Conversations persist in sidebar
- [ ] Messages load from backend
- [ ] Conversation continuity maintained
- [ ] New messages append to existing thread

---

### US-003: Start New Conversation
**Scenario**: User begins a fresh conversation

```gherkin
Given I am in an existing conversation
When I click "New Chat"
Then the message list clears
And currentConversationId is null
When I send a message
Then a new conversation is created
And it appears in the sidebar
```

**Acceptance**:
- [ ] UI clears current messages
- [ ] New conversation created in backend
- [ ] Sidebar updates with new entry
- [ ] Old conversation still accessible

---

### US-004: View Tool Usage
**Scenario**: User sees which tools AI invoked

```gherkin
When I ask AI to list my tasks
Then I see the AI response
And I see indicator that list_tasks tool was called
```

**Acceptance**:
- [ ] `tool_calls` displayed in UI
- [ ] Visual feedback for tool usage
- [ ] Clear confirmation of actions taken

---

### US-005: Error Handling
**Scenario**: API request fails

```gherkin
Given I have a poor network connection
When I send a message
Then I see an error message
And I can retry sending the message
```

**Acceptance**:
- [ ] Network errors displayed
- [ ] Auth errors redirect to signin
- [ ] Retry option available
- [ ] No crash on error

---

### US-006: Mobile Responsiveness
**Scenario**: User accesses chat on mobile

```gherkin
Given I am on a mobile device
When I visit /chat
Then the layout adapts to narrow screen
And I can scroll messages
And I can type and send messages
And sidebar may be collapsible or hidden
```

**Acceptance**:
- [ ] Responsive breakpoints (320px+)
- [ ] Touch-friendly targets
- [ ] Readable text on mobile
- [ ] Smooth scrolling

---

## 8. Non-Functional Requirements

### Performance
| Metric | Target |
|--------|--------|
| First Paint | < 1s |
| Time to Interactive | < 2s |
| Message Send to Response | < 5s |
| Scroll Frame Rate | 60fps |

### Accessibility
- Keyboard navigation
- ARIA labels
- Color contrast (WCAG AA)
- Focus management

### Security
- JWT from localStorage (existing)
- No token exposure in logs
- User ID from JWT (not URL)
- HTTPS in production

---

## 9. File Structure

```
frontend/src/
├── app/
│   └── chat/
│       └── page.tsx          # Main chat page
├── components/
│   └── chat/
│       ├── MessageBubble.tsx # Message display
│       ├── ChatInput.tsx     # Text input
│       ├── ConversationList.tsx # Sidebar
│       └── index.ts          # Barrel export
├── services/
│   └── api.ts                # Extended with chat methods
├── types/
│   ├── chat.ts               # Chat type definitions
│   └── task.ts               # Existing types
└── pages/
    └── tasks.tsx             # Updated with chat link
```

---

## 10. Dependencies

```json
{
  "next": "^16.1.1",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "lucide-react": "^0.562.0",
  "tailwindcss": "^4.1.18"
}
```

**No additional packages required** - using React state + Tailwind for custom chat UI.

---

## 11. Vercel Deployment

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_OPENAI_DOMAIN_KEY": "@domain-key"
  }
}
```

### Environment Variables (Vercel)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` - ChatKit domain key

---

## 12. Testing Requirements

### Manual Testing Checklist
- [ ] Authentication flow
- [ ] Send/receive messages
- [ ] Conversation persistence
- [ ] New conversation creation
- [ ] Error handling (network, auth)
- [ ] Mobile responsiveness
- [ ] Keyboard navigation

### API Testing
```bash
# Get JWT token
TOKEN=$(curl -s -X POST "$API_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r '.access_token')

# Test chat
curl -X POST "$API_URL/1/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add test task"}'
```

---

## 13. Success Criteria

| Criterion | Metric |
|-----------|--------|
| Message delivery | 100% of valid requests |
| Response time | < 5 seconds |
| Error rate | < 1% |
| Mobile usability | 100% on iOS/Android |
| Auth security | 0 token leaks |

---

**Document Version**: 1.0
**Last Updated**: 2025-12-31
**Status**: Ready for Implementation
