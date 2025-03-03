import { ConfigProvider, Effect } from "effect";
import { CallToolRequest, CallToolResult, ListToolsResult } from "./pdk";
import { pipeline } from "./pipeline";
import { DriveClient, GoogleDrive } from "./google-drive/services";

/**
 * Called when the tool is invoked.
 * If you support multiple tools, you must switch on the input.params.name to detect which tool is being called.
 *
 * @param {CallToolRequest} input - The incoming tool request from the LLM
 * @returns {CallToolResult} The servlet's response to the given tool call
 */
export function callImpl(input: CallToolRequest): CallToolResult {
  const program = pipeline(input).pipe(
    Effect.provide(GoogleDrive.Default),
    Effect.provide(DriveClient.Default),
  );

  const accessToken = input.params.arguments?.accessToken satisfies
    | string
    | undefined;

  if (accessToken) {
    const configProvider = ConfigProvider.fromMap(
      new Map([
        ["ACCESS_TOKEN", accessToken],
        ["GOOGLE_API_KEY", Config.get("GOOGLE_API_KEY")],
      ]),
    );

    return Effect.runSync(
      program.pipe(Effect.withConfigProvider(configProvider)),
    );
  } else {
    return Effect.runSync(program);
  }
}

/**
 * Called by mcpx to understand how and why to use this tool.
 * Note: Your servlet configs will not be set when this function is called,
 * so do not rely on config in this function
 *
 * @returns {ListToolsResult} The tools' descriptions, supporting multiple tools from a single servlet.
 */
export function describeImpl(): ListToolsResult {
  return {
    tools: [
      {
        name: "search-files",
        description: "Search Google Drive files for the user",
        inputSchema: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description:
                "The google access token to authenticate transactions",
            },
            query: {
              type: "string",
              description: "The query to use while searching the files",
            },
          },
          required: ["query", "accessToken"],
        },
      },
      {
        name: "greet",
        description: "A very simple tool to provide a greeting",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "the name of the person to greet",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
}
