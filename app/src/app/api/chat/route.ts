import { mastra } from "@/mastra";
// import { MastraMCPClient } from '@mastra/mcp'

// const gdriveClient = new MastraMCPClient({
//   name: 'gdrive',
//   server: {
//     url: new URL(`${process.env.VERCEL_URL}/sse`)
//   }
// })

export async function POST(req: Request) {
  const { messages, resourceId, threadId } = await req.json();

  const googleDriveAgent = mastra.getAgent('googleDriveAgent')

  const result = await googleDriveAgent.stream(messages ?? [], {
    toolChoice: 'auto',
    threadId,
    resourceId,
  })

  return result.toDataStreamResponse()
}
