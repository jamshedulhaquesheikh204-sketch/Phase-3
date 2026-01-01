// MessageBubble component - Displays chat messages
// Shows user/assistant messages with visual distinction and tool call indicators

import { ChatMessage } from '@/types/chat';
import { CheckCircle, List, Edit, Trash, Hammer } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Tool icon mapping
const TOOL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  add_task: CheckCircle,
  list_tasks: List,
  complete_task: CheckCircle,
  update_task: Edit,
  delete_task: Trash,
};

// Tool label mapping
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
