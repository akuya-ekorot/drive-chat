import { gdrive } from "@/mastra/agents/gdrive";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";

export const actionClient = createSafeActionClient({
  handleServerError: (error, utils) => {
    console.error(error);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  defineMetadataSchema: () =>
    z.object({
      name: z.string(),
    }),
}).use(({ next }) => next({ ctx: { gdrive } }));
