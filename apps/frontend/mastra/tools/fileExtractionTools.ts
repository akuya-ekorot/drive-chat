import { CoreMessage, createTool } from "@mastra/core";
import { z } from "zod";
import { FileContentPart } from "@assistant-ui/react";

export const textDecoderTool = createTool({
  id: "textDecoderTool",
  description: "Decode base64-encoded text-based files to plain text",
  inputSchema: z
    .object({
      base64EncodedFile: z.string().describe("Base64 encoded file content"),
      mimeType: z
        .string()
        .describe("MIME type of the file (must be text-based)"),
    })
    .describe("Parameters for decoding text-based files from base64"),
  execute: async ({ context, mastra }) => {
    const agent = mastra?.getAgent("base64Translator");

    if (!agent) {
      return {
        error: "No agent found to perform text decoding.",
      };
    }

    try {
      const decodedText = Buffer.from(
        context.base64EncodedFile,
        "base64",
      ).toString("utf8");

      const message: CoreMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: `I've decoded a ${context.mimeType} file. Please analyze the following content:\n\n${decodedText}`,
          },
        ],
      };

      const response = await agent.generate([message], {
        output: z.object({
          fileType: z
            .string()
            .describe("Description of the detected file type"),
          content: z.string().describe("The extracted text content"),
          notes: z
            .string()
            .optional()
            .describe("Any relevant warnings or processing information"),
        }),
      });

      return {
        decodedText,
        analysis: response.object,
      };
    } catch (error) {
      return {
        error: `Error decoding text: ${error instanceof Error ? error.message : String(error)}`,
        suggestion:
          "Check if the content is properly base64 encoded and the MIME type is correct.",
      };
    }
  },

  outputSchema: z
    .object({
      decodedText: z
        .string()
        .optional()
        .describe("The raw decoded text from the base64 content"),
      analysis: z
        .object({
          fileType: z
            .string()
            .describe("Description of the detected file type"),
          content: z.string().describe("The extracted text content"),
          notes: z
            .string()
            .optional()
            .describe("Any relevant warnings or processing information"),
        })
        .optional()
        .describe("Analysis of the text content by the agent"),
      error: z.string().optional().describe("Error message if decoding failed"),
      suggestion: z
        .string()
        .optional()
        .describe("Suggestion for resolving errors"),
    })
    .describe("Result of text decoding operation"),
});

export const binaryExtractorTool = createTool({
  id: "binaryExtractorTool",
  description: "Extract text from base64-encoded binary files",
  inputSchema: z
    .object({
      base64EncodedFile: z
        .string()
        .describe("Base64 encoded binary file content"),
      mimeType: z.string().describe("MIME type of the binary file"),
      options: z
        .record(z.any())
        .optional()
        .describe("Additional extraction options specific to the file type"),
    })
    .describe("Parameters for extracting text from binary files"),
  execute: async ({ context, mastra }) => {
    const agent = mastra?.getAgent("base64Translator");

    if (!agent) {
      return {
        error: "No agent found to perform binary extraction.",
      };
    }

    try {
      const fileContentPart: FileContentPart = {
        type: "file",
        data: context.base64EncodedFile,
        mimeType: context.mimeType,
      };

      const message: CoreMessage = {
        role: "user",
        content: [
          fileContentPart,
          {
            type: "text",
            text: `Please extract and analyze text from this ${context.mimeType} file.${
              context.options
                ? ` Additional options: ${JSON.stringify(context.options)}`
                : ""
            }`,
          },
        ],
      };

      const response = await agent.generate([message], {
        output: z.object({
          fileType: z
            .string()
            .describe("Description of the detected file type"),
          extractedText: z
            .string()
            .describe("Text extracted from the binary file"),
          isComplete: z
            .boolean()
            .describe("Whether the extraction was complete or partial"),
          metadata: z
            .record(z.any())
            .optional()
            .describe("Additional metadata extracted from the file"),
          notes: z
            .string()
            .optional()
            .describe("Any relevant warnings or processing information"),
        }),
      });

      return {
        extraction: response.object,
        success: true,
      };
    } catch (error) {
      return {
        error: `Error extracting from binary: ${error instanceof Error ? error.message : String(error)}`,
        suggestion:
          "Check if the content is properly base64 encoded and the MIME type is supported.",
        success: false,
      };
    }
  },
  outputSchema: z
    .object({
      extraction: z
        .object({
          fileType: z
            .string()
            .describe("Description of the detected file type"),
          extractedText: z
            .string()
            .describe("Text extracted from the binary file"),
          isComplete: z
            .boolean()
            .describe("Whether the extraction was complete or partial"),
          metadata: z
            .record(z.any())
            .optional()
            .describe("Additional metadata extracted from the file"),
          notes: z
            .string()
            .optional()
            .describe("Any relevant warnings or processing information"),
        })
        .optional()
        .describe("Results of the text extraction"),
      error: z
        .string()
        .optional()
        .describe("Error message if extraction failed"),
      suggestion: z
        .string()
        .optional()
        .describe("Suggestion for resolving errors"),
      success: z
        .boolean()
        .optional()
        .describe("Whether the extraction operation was successful"),
    })
    .describe("Result of binary extraction operation"),
});
