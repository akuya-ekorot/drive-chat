import { initializeMcpApiHandler } from "@/lib/mcp-api-handler";
import { z } from "zod";

const handler = initializeMcpApiHandler(
  (server) => {
    server.tool("echo", { message: z.string() }, async ({ message }) => ({
      content: [{ type: "text", text: `Tool echo: ${message}` }],
    }));
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
      },
    },
  }
);

export default handler;
