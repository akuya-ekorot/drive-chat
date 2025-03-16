import { auth } from "@clerk/nextjs/server";
import { mastra } from "@/mastra";
import { notFound, redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) redirect('/sign-in')

  const agent = mastra.getAgent('googleDriveAgent')
  const threads = await agent.getMemory()?.getThreadsByResourceId({ resourceId: userId })

  const nextThread = threads?.find((t) => Boolean(t.metadata?.nextThread));

  if (!nextThread) {
    const newThread = await agent.getMemory()?.createThread({
      resourceId: userId,
      metadata: { nextThread: true }
    });

    if (newThread) {
      redirect(`/chats/${newThread?.id}`)
    } else {
      notFound() // should not happen
    }
  }

  redirect(`/chats/${nextThread?.id}`);
}
