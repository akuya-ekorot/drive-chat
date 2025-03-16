import { MCPConfiguration } from "@mastra/mcp";

export const mcp = new MCPConfiguration({
  id: "googleDriveAgent",
  servers: {
    googleDrive: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: {
        ...process.env,
        GDRIVE_OAUTH_PATH:
          process.env.PWD + "/" + process.env.GDRIVE_OAUTH_PATH!,
        GDRIVE_CREDENTIALS_PATH:
          process.env.PWD + "/" + process.env.GDRIVE_CREDENTIALS_PATH!,
      },
    },
  },
});
