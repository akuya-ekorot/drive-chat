import { mastra } from "@/mastra";
import { MCPConfiguration } from "@mastra/mcp";
import { NextResponse } from "next/server";

export const mcp = new MCPConfiguration({
  id: "googleDriveAgent",
  servers: {
    googleDrive: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: {
        ...process.env,
        GDRIVE_OAUTH_PATH: process.env.GDRIVE_OAUTH_PATH!,
        GDRIVE_CREDENTIALS_PATH: process.env.GDRIVE_CREDENTIALS_PATH!,
      },
    },
  },
});

export async function POST(req: Request) {
  const agent = mastra.getAgent("googleDriveAgent");

  try {
    try {
      const { messages, resourceId, threadId } = await req.json();

      const thread = await agent.getMemory()?.getThreadById({ threadId });

      if (thread) {
        await agent.getMemory()?.saveThread({
          thread: {
            ...thread,
            metadata: { ...(thread?.metadata ?? {}), nextThread: false },
          },
        });
      }

      const result = await agent.stream(messages ?? [], {
        toolChoice: "auto",
        // threadId,
        // resourceId,
        toolsets: await mcp.getToolsets(),
      });

      return result.toDataStreamResponse();
    } catch (error) {
      console.dir({ error }, { depth: Infinity });
      return NextResponse.json(error, { status: 500 });
    }
  } catch (e) {
    console.error("mastra mcp init error", e);
    return NextResponse.json(e, { status: 500 });
  }
}
