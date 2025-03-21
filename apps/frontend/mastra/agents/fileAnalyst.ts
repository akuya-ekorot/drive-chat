import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";

export const fileAnalyst = new Agent({
  name: "fileAnalyst",
  model: google("gemini-2.0-flash-001"),
  instructions: `
  You are a file analyst. Your task is to analyze files and provide insights about them.

  Instructions:
  - You will be provided with base64 encoded file data, the file mime type, and a prompt of the analysis.
  `,
});
