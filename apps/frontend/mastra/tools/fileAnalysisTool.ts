import { CoreMessage, CoreUserMessage, createTool } from "@mastra/core";
import { z } from "zod";
import { FileContentPart } from "@assistant-ui/react";

export const fileAnalysisTool = createTool({
  id: "fileAnalysisTool",
  description: "Analyze file content",
  inputSchema: z.object({
    base64EncodedFile: z.string().describe("Base64 encoded file content"),
    mimeType: z.string().describe("MIME type of the file"),
    prompt: z.string().describe("Prompt for the analysis"),
  }),
  execute: async ({ context, mastra }) => {
    const agent = mastra?.getAgent("fileAnalyst");

    if (!agent) {
      return {
        error: "No agent found to perform file analysis.",
      };
    }

    console.dir(agent, { depth: Infinity });

    const fileContentPart: FileContentPart = {
      type: "file",
      data: context.base64EncodedFile,
      mimeType: context.mimeType,
    };

    const message: CoreMessage = {
      role: "user",
      content: [fileContentPart, { type: "text", text: context.prompt }],
    };

    const response = await agent.generate([message], {
      output: z.object({
        summary: z.string().describe("Summary of the file content"),
        keywords: z
          .array(z.string())
          .describe("Keywords extracted from the file"),
      }),
    });

    console.dir(response.object, { depth: Infinity });

    return {
      response: response.object.summary,
    };
  },
});
