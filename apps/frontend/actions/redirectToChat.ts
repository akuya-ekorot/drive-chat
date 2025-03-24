"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function redirectToChat(newThreadId: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  revalidatePath(`/`, "layout");
  redirect(`/${newThreadId}`);
}
