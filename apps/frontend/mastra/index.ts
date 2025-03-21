import { Logger, Mastra } from "@mastra/core";
import { gdrive } from "./agents/gdrive";
import { fileAnalyst } from "./agents/fileAnalyst";

export const mastra = new Mastra({
  agents: { fileAnalyst, gdrive },
  logger: new Logger({ level: "debug" }),
});
