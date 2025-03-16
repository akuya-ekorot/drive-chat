import { Mastra } from "@mastra/core/mastra";
import { Logger } from "@mastra/core";
import { googleDriveAgent } from "./agents/googleDriveAgent";

export const mastra = new Mastra({
  agents: { googleDriveAgent },
  logger: new Logger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
});
