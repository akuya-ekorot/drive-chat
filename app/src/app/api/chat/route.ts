import { mastra } from "@/mastra";

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
