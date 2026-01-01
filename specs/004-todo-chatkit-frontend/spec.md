# Feature Specification: ChatKit-based Frontend UI for Todo AI Chatbot

**Feature Branch**: `004-todo-chatkit-frontend`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Phase 4: ChatKit-based Frontend UI for the Todo AI Chatbot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Send Message to AI Chatbot (Priority: P1)

A user wants to manage their todos by sending natural language messages to an AI chatbot through a clean chat interface.

**Why this priority**: Core interaction pattern. Without a functional chat UI, users cannot access the Phase 3 AI capabilities.

**Independent Test**: Can be fully tested by authenticating, opening the chat page, typing a message like "Add buy milk to my list", and verifying the AI responds with confirmation.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an open chat session, **When** the user types "Add a task to buy groceries" and presses send, **Then** the message appears in the chat history with a loading indicator.
2. **Given** a message is sent, **When** the AI responds, **Then** the response appears with clear visual separation from user messages and the loading indicator is removed.
3. **Given** the message was "Add buy milk", **When** the AI processes it, **Then** the response says "I've added 'buy milk' to your list" and indicates the `add_task` tool was called.

---

### User Story 2 - Conversation Persistence (Priority: P1)

A user wants to continue their conversation across page refreshes and return later to reference previous messages.

**Why this priority**: Essential for a usable chat experience. Users expect their chat history to persist.

**Independent Test**: Can be tested by sending messages, refreshing the page, and verifying the conversation history is loaded and displayed.

**Acceptance Scenarios**:

1. **Given** previous chat messages exist in the database, **When** the user returns to the chat page, **Then** all previous messages (user and assistant) are loaded and displayed in order.
2. **Given** the user is in an existing conversation, **When** they send a new message, **Then** it continues the same conversation thread with the same `conversation_id`.
3. **Given** the user wants to start fresh, **When** they click "New Conversation", **Then** the chat clears and a new `conversation_id` is created for subsequent messages.

---

### User Story 3 - Real-time Feedback (Priority: P2)

A user wants clear feedback while their message is being processed, including loading states and error handling.

**Why this priority**: User experience. Without feedback, users may resend messages or think the app is frozen.

**Independent Test**: Can be tested by sending various messages and observing loading indicators, success states, and error messages.

**Acceptance Scenarios**:

1. **Given** a message is sent, **When** waiting for AI response, **Then** a typing/loading indicator is displayed.
2. **Given** the AI is processing, **When** the response returns, **Then** the loading indicator is replaced with the AI's message.
3. **Given** an error occurs (network, auth, server), **When** the operation fails, **Then** a clear error message is displayed and the user can retry.

---

### User Story 4 - Task Context Display (Priority: P2)

A user wants to see their current tasks alongside the chat to understand what the AI is referring to.

**Why this priority**: Provides context. Users may need to reference their task list while chatting.

**Independent Test**: Can be tested by having tasks exist, opening chat, and verifying task summary is visible.

**Acceptance Scenarios**:

1. **Given** the user has tasks, **When** viewing the chat, **Then** a sidebar or panel shows a summary of current tasks.
2. **Given** the user creates a new task via chat, **When** the AI confirms, **Then** the task summary updates to reflect the new task.

---

### Edge Cases

- **Network Disconnection**: What happens if the user loses internet? (Solution: Show error, allow retry).
- **Long Messages**: What if the user sends a very long message? (Solution: Handle gracefully, truncate if needed).
- **Empty Response**: What if AI returns empty response? (Solution: Show fallback message).
- **Auth Token Expiry**: What if JWT expires during chat? (Solution: Redirect to signin or refresh token).
- **Concurrent Conversations**: How does the UI handle multiple conversation windows? (Solution: Single active conversation at a time).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a chat interface page accessible at `/chat`.
- **FR-002**: System MUST display chat messages with clear visual separation between user and AI messages.
- **FR-003**: System MUST send messages to `POST /api/{user_id}/chat` with JWT authentication.
- **FR-004**: System MUST handle `conversation_id` for maintaining conversation continuity.
- **FR-005**: System MUST load previous messages from `GET /api/{user_id}/conversations/{id}/messages` on page load.
- **FR-006**: System MUST display a loading indicator while waiting for AI response.
- **FR-007**: System MUST handle errors gracefully with user-friendly error messages.
- **FR-008**: System MUST auto-scroll to the newest message when a response arrives.
- **FR-009**: System MUST allow users to start a new conversation (clear history, new conversation_id).
- **FR-010**: System MUST display a list of existing conversations for easy navigation.

### Non-Functional Requirements

#### Performance

- **First Paint**: < 1 second for chat interface
- **Message Send to Response**: < 5 seconds (dominated by OpenAI API)
- **Smooth Scrolling**: 60fps animations for new messages

#### Usability

- **Clear visual hierarchy**: User messages right-aligned, AI messages left-aligned
- **Distinct styling**: Different colors for user vs AI messages
- **Input validation**: Prevent empty message submission
- **Keyboard support**: Enter to send, Shift+Enter for new line

#### Security

- **JWT token**: Retrieved from localStorage on authenticated pages
- **No token exposure**: Tokens never logged or displayed
- **User isolation**: All API calls include user_id from JWT

#### Accessibility

- **Keyboard navigation**: Full keyboard access to chat features
- **Screen reader support**: ARIA labels for messages and inputs
- **Color contrast**: Meets WCAG AA standards

---

## API Contracts

### Chat Endpoint

**POST** `/api/{user_id}/chat`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request**:
```typescript
{
  message: string;           // User's message (1-1000 chars)
  conversation_id?: number;  // Optional: existing conversation
}
```

**Response**:
```typescript
{
  conversation_id: number;   // ID for this conversation
  response: string;          // AI's response text
  tool_calls: string[];      // List of tools called
}
```

**Error Responses**:
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (user_id mismatch)
- 500: Internal server error

### Conversations List

**GET** `/api/{user_id}/conversations`

**Response**:
```typescript
[
  {
    id: number;
    title: string;
    created_at: string;  // ISO datetime
    updated_at: string;  // ISO datetime
  }
]
```

### Conversation Messages

**GET** `/api/{user_id}/conversations/{conversation_id}/messages`

**Response**:
```typescript
[
  {
    id: number;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    created_at: string;  // ISO datetime
  }
]
```

---

## Key Entities

### ChatMessage

```typescript
interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  created_at: string;
  isLoading?: boolean;  // UI state
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

interface ChatState {
  currentConversationId: number | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
```

---

## Scope *(mandatory)*

### In Scope

- Chat UI page with message display and input
- Conversation list sidebar
- API integration with Phase 3 backend
- JWT authentication flow
- Loading states and error handling
- New conversation functionality
- Responsive design for mobile/desktop
- Integration with existing tasks page

### Out of Scope

- Real-time WebSocket updates (Phase 5+)
- Voice/audio input
- Image attachments
- Message editing/deletion
- Advanced formatting (Markdown, code blocks)
- Conversation search/filter
- Typing indicators beyond simple loading

---

## Assumptions *(mandatory)*

- Phase 2 authentication (JWT, localStorage) is functional.
- Phase 3 backend (`/api/{user_id}/chat`) is deployed and accessible.
- User has valid JWT token when accessing chat page.
- OpenAI API key is configured in backend environment.
- Tailwind CSS v4 is available for styling.
- Next.js App Router structure is maintained.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can send a message and receive AI response in under 5 seconds.
- **SC-002**: 100% of authenticated chat requests include valid JWT.
- **SC-003**: Chat history persists across page refreshes.
- **SC-004**: Error states are displayed within 2 seconds of failure.
- **SC-005**: UI is responsive on mobile (320px+) and desktop.

### Testing Requirements

- Manual testing of all user stories.
- API integration testing with backend.
- Error handling verification (401, 403, 500 cases).
- Responsive design testing.

---

## Dependencies

### Frontend Dependencies

- **openai-chatkit** (or similar chat UI library) - TBD based on research
- **lucide-react** (already installed) - icons
- **tailwindcss** (already installed) - styling

### Backend Dependencies (Phase 3 - Verified)

- FastAPI endpoint at `/api/{user_id}/chat`
- JWT authentication via `get_current_user`
- PostgreSQL persistence for conversations

---

## Implementation Notes

### Chat UI Library Selection

Research required for ChatKit alternatives:
1. **openai-chatkit** - Official OpenAI chat UI
2. **react-chat-ui** - Popular React chat components
3. **custom implementation** - Full control, minimal dependencies

Recommendation: Start with simple custom implementation using Tailwind to minimize dependencies and bundle size.

### State Management

- Use React `useState` and `useEffect` for local state.
- No external state management library needed for Phase 4.
- Store `conversation_id` in state, not localStorage.

### API Integration

- Extend existing `api.ts` with chat methods.
- Reuse `getHeaders()` with JWT token.
- Handle auth errors globally (redirect to signin).

---

## Open Questions

1. **ChatKit Library**: Should we use a library or custom implementation?
2. **Message Bubbles**: Should user messages be right-aligned or left-aligned? (Standard: user right, AI left)
3. **Conversation Title**: How to generate conversation titles? (First message, auto-generated, or user-provided)
4. **Mobile Layout**: Sidebar or bottom sheet for conversation list on mobile?

---

**Version**: 1.0
**Last Updated**: 2025-12-31
