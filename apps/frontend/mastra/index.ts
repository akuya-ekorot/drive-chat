import { Logger, Mastra } from "@mastra/core";
import { gdrive } from "./agents/gdrive";
import { base64Translator } from "./agents/base64Translater";

export const mastra = new Mastra({
  agents: { base64Translator, gdrive },
  logger: new Logger({ level: "debug" }),
});
