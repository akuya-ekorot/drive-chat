"use client";

import {
  AssistantRuntimeProvider,
  ThreadMessageLike,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";

interface AssistantProps {
  initialMessages: ThreadMessageLike[] | undefined;
  threadId: string;
  resourceId: string;
}
export const Assistant: React.FC<AssistantProps> = ({
  resourceId,
  threadId,
  initialMessages,
}) => {
  const runtime = useChatRuntime({
    api: "/api/chat",
    initialMessages,
    body: { threadId, resourceId },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
