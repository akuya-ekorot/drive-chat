import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const googleDriveAgent = mastra.getAgent('googleDriveAgent')

  const result = await googleDriveAgent.stream(messages, {
    toolChoice: 'auto'
  })

  //@ts-expect-error toDataStreamResponse identified as non-existent but works just fine
  return result.toDataStreamResponse()
}
