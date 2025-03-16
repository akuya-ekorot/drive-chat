import { Assistant } from "@/app/assistant";
import { mastra } from "@/mastra";
import { ThreadMessageLike } from "@assistant-ui/react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const agent = mastra.getAgent('googleDriveAgent')
  const messages = await agent.getMemory()?.query({ threadId: chatId })
  const { userId } = await auth();

  if (userId) {
    return (
      <div className="relative">
        <Assistant resourceId={userId} threadId={chatId} initialMessages={messages?.uiMessages.filter((m) => m.role !== 'data') as ThreadMessageLike[] | undefined} />
        <div className="absolute top-0 right-4">
          <UserButton />
        </div>
      </div>

    )
  }

  redirect('/sign-in')
}
