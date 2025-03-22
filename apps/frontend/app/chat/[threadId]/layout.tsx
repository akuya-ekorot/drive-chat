import { AssistantProvider } from "@/components/custom/assistant-runtime-provider";
import { gdrive } from "@/mastra/agents/gdrive";
import { ThreadMessageLike } from "@assistant-ui/react";

export default async function ThreadLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = await gdrive.getMemory()?.query({ threadId });

  const messages = thread?.uiMessages.filter(
    (message) => message.role !== "data",
  ) as ThreadMessageLike[];

  return (
    <AssistantProvider initialMessages={messages}>{children}</AssistantProvider>
  );
}
