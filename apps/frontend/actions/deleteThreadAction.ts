"use server";

import { z } from "zod";
import { actionClient } from "./client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const threadSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  resourceId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).nullish(),
});

export const deleteThreadsAction = actionClient
  .metadata({
    name: "deleteThreadAction",
  })
  .schema(
    z.object({
      threads: z.array(threadSchema),
      hasActivePath: z.boolean().optional(),
    }),
  )
  .action(
    async ({ parsedInput: { threads, hasActivePath }, ctx: { gdrive } }) => {
      try {
        await Promise.all(
          threads.map((thread) => gdrive.getMemory()?.deleteThread(thread.id)),
        );
      } catch (error) {
        console.error("Error deleting selected threads:", error);
        throw error;
      }

      if (hasActivePath) {
        redirect("/chat/new");
      } else {
        revalidatePath("/chat/[threadId]", "layout");
      }
    },
  );
