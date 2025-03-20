import { Mastra } from "@mastra/core";
import { gdrive } from "./agents/gdrive";

export const mastra = new Mastra({
  agents: { gdrive },
});
