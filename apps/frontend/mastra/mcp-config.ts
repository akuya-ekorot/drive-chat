import { MCPConfiguration } from "@mastra/mcp";

export const createMcpConfig = (token: string) => {
  if (!process.env.MCP_SERVER_URL) {
    throw new Error("MCP_SERVER_URL environment variable is not set");
  }

  return new MCPConfiguration({
    id: "gdrive-sse",
    servers: {
      "gdrive-sse": {
        url: new URL(process.env.MCP_SERVER_URL),
        requestInit: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    },
  });
};
