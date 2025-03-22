import { gdrive } from "@/mastra/agents/gdrive";
import { auth } from "@clerk/nextjs/server";
import { ThreadListActions } from "./thread-list-actions";

export const ThreadList: React.FC = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  const threads = await gdrive
    .getMemory()
    ?.getThreadsByResourceId({ resourceId: userId });

  return <ThreadListActions threads={threads ?? []} />;
};
