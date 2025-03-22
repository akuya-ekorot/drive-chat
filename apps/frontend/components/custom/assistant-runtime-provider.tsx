"use client";

import {
  AssistantRuntimeProvider,
  ThreadMessageLike,
  unstable_useRemoteThreadListRuntime,
  useAssistantRuntime,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useParams } from "next/navigation";

export const AssistantProvider: React.FC<
  React.PropsWithChildren<{
    initialMessages: readonly ThreadMessageLike[] | undefined;
  }>
> = ({ children, initialMessages }) => {
  const { threadId } = useParams();
  const runtime = useChatRuntime({
    api: "/api/chat",
    body: { threadId },
    initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
