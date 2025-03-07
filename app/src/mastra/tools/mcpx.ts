import { Session } from "@dylibso/mcpx";
import { createTool } from "@mastra/core";
import { z } from "zod";
import { convertToZodSchema } from "@dylibso/json-schema-to-zod-openai";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

// Define consistent types across both implementations
interface MCPXTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

// Align with the more detailed content type structure
interface MCPXCallResult {
  content?: Array<{
    type: "text" | "image" | "resource";
    data?: string;
    mimeType?: string;
    text: string;
  }>;
  isError?: boolean;
}

// Define the content type enum
const ContentTypeEnum = z.enum(["text", "image", "resource"]);

// Define consistent content schema
const Content = z.object({
  data: z.string().nullable().describe("The base64-encoded data"),
  mimeType: z.string().nullable().describe("The MIME type of the content"),
  text: z.string().nullable().describe("The text content of the message"),
  type: ContentTypeEnum,
});

// Define consistent call result schema
const CallToolResult = z.object({
  content: z.array(Content),
  isError: z.boolean().nullable().describe(
    "Whether the tool call ended in an error",
  ),
});

export async function getMcpxTools(session: Session) {
  try {
    const { tools: mcpxTools } = await session.handleListTools({
      method: "tools/list",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);

    const tools = mcpxTools.map((mcpxTool: MCPXTool) => {
      // remove accessToken as input param in the schema, we provide that directly and llm should have zero-knowledge about it
      const isCustomTool = mcpxTool.name.startsWith('google-drive_')
      let refinedSchema: Record<string, unknown> = {};

      if (isCustomTool) {
        refinedSchema = Object.entries(mcpxTool.inputSchema).reduce((pv, [key, value]) => {
          const cv: Record<string, unknown> = {}

          switch (key) {
            case 'required':
              cv[key] = (value as string[]).filter((v) => v !== 'accessToken')
              break;
            case 'properties':
              cv[key] = Object.entries((value as Record<string, Record<string, string>>)).reduce((p, [k, v]) => k === 'accessToken' ? p : ({ ...p, [k]: v }), {})
              break;
            default:
              cv[key] = value;
              break;
          }

          return { ...pv, ...cv };
        }, {} as Record<string, unknown>)
      }

      const zodSchema = convertToZodSchema(isCustomTool ? refinedSchema : mcpxTool.inputSchema);

      return createTool({
        id: mcpxTool.name,
        description: mcpxTool.description || "",
        inputSchema: zodSchema,
        outputSchema: CallToolResult,
        execute: async ({ context }) => {
          try {
            // Retrive users google access token
            const user = await currentUser();
            if (!user) throw new Error('No user logged in')
            const a = await clerkClient()
            const tokens = await a.users.getUserOauthAccessToken(user.id, 'google')


            if (tokens.totalCount < 1) throw new Error('No tokens for user')
            const accessToken = tokens.data[0].token

            const response = await session.handleCallTool({
              method: "tools/call",
              params: {
                name: mcpxTool.name,
                arguments: { ...context, accessToken },
              },
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }, {} as any) as MCPXCallResult;

            console.log(
              "called tool",
              mcpxTool.name,
              "with context",
              context,
              "success?",
              !response.isError,
              "full response",
              response,
            );

            if (!response) {
              return {
                content: [{
                  type: "text",
                  text: "No response received from tool",
                  data: null,
                  mimeType: null,
                }],
                isError: true,
              };
            }

            return {
              content: response.content?.map((item) => ({
                type: item.type,
                text: item.text,
                data: item.data,
                mimeType: item.mimeType,
              })) ?? [],
              isError: response.isError,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
          } catch (error) {
            console.error(`Error executing tool ${mcpxTool.name}:`, error);
            return {
              content: [{
                type: "text",
                text:
                  `An error occurred while executing ${mcpxTool.name}: ${error}.`,
                data: null,
                mimeType: null,
              }],
              isError: true,
            };
          }
        },
      });
    });

    return tools.reduce((acc, tool) => ({
      ...acc,
      [tool.id]: tool,
    }), {});
  } catch (error) {
    console.error("Error getting MCPX tools:", error);
    throw error;
  }
}
