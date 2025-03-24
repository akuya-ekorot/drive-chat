"use client";

import { redirectToChat } from "@/actions/redirectToChat";
import {
  AssistantRuntimeProvider,
  ThreadMessageLike,
} from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { useParams } from "next/navigation";

export const AssistantProvider: React.FC<
  React.PropsWithChildren<{
    initialMessages: readonly ThreadMessageLike[] | undefined;
  }>
> = ({ children, initialMessages }) => {
  const { threadId } = useParams();

  const isNew = !threadId;
  const idToUse = isNew ? crypto.randomUUID() : (threadId as string);

  const runtime = useChatRuntime({
    api: "/api/chat",
    body: { threadId: idToUse },
    initialMessages,
    onFinish: () => {
      if (isNew) {
        redirectToChat(idToUse);
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
};
