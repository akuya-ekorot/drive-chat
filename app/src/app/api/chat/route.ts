import { mastra } from "@/mastra";
import { MastraMCPClient } from '@mastra/mcp'
import { NextResponse } from "next/server";

const url = new URL(process.env.MCP_SERVER_URL! + '/sse')

export async function POST(req: Request) {
  const agent = mastra.getAgent('googleDriveAgent')

  try {
    const gdriveClient = new MastraMCPClient({
      name: 'gdrive',
      server: { url }
    })


    try {
      const { messages, resourceId, threadId } = await req.json();

      const thread = await agent.getMemory()?.getThreadById({ threadId })

      if (thread) {
        await agent.getMemory()?.saveThread({ thread: { ...thread, metadata: { ...(thread?.metadata ?? {}), nextThread: false } } })
      }

      await gdriveClient.connect();

      process.on("exit", () => {
        gdriveClient.disconnect();
      });

      const tools = await gdriveClient.tools();

      console.dir({ tools })

      const result = await agent.stream(messages ?? [], {
        toolChoice: 'auto',
        threadId,
        resourceId,
        toolsets: { gdrive: tools }
      })

      return result.toDataStreamResponse()
    } catch (error) {
      console.error('issue', error)
      return NextResponse.json(error, { status: 500 })
    } finally {
      gdriveClient.disconnect()
      console.log('gdrive client disconnected')
    }
  } catch (e) {
    console.error('mastra mcp init error', e)
    return NextResponse.json(e, { status: 500 })
  }
}
