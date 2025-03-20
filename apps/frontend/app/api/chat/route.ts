import { mastra } from "@/mastra";
import { NextRequest, NextResponse } from "next/server";
import { createMcpConfig } from "@/mastra/mcp-config";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();

  const clerkResponse = await client.users.getUserOauthAccessToken(
    userId,
    "google",
  );

  const accessToken = clerkResponse.data[0].token || "";

  if (!accessToken) {
    return NextResponse.json(
      { message: "Access token not found" },
      { status: 401 },
    );
  }

  const mcpConfig = createMcpConfig(accessToken);

  const gdriveAgent = mastra.getAgent("gdrive");

  const response = await gdriveAgent.stream(messages, {
    toolChoice: "auto",
    toolsets: await mcpConfig.getToolsets(),
  });

  return response.toDataStreamResponse();
}
