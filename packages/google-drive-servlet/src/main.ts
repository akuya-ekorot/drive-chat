import { ConfigProvider, Effect } from "effect";
import { CallToolRequest, CallToolResult, ListToolsResult } from "./pdk";
import { pipeline } from "./pipeline";
import { GoogleDrive } from "./google-drive/google-drive";
import { DriveClient } from "./google-drive/client";

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
        name: "export-file",
        description:
          "export file's content in acceptable mime-type. Works best for google workspace files",
        inputSchema: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description:
                "The google access token to authenticate transactions",
            },
            fileId: {
              type: "string",
              description: "The fileId of the file to get",
            },
            mimeType: {
              type: "string",
              description:
                "The mime type of the file. Prefer text mime types for easier operations",
            },
          },
          required: ["fileId", "accessToken", "mimeType"],
        },
      },
      {
        name: "get-file",
        description:
          "get file's blob data. Works best for non-google workspace files",
        inputSchema: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description:
                "The google access token to authenticate transactions",
            },
            fileId: {
              type: "string",
              description: "The fileId of the file to get",
            },
            alt: {
              type: "string",
              description:
                "Alt type to be used in the query. Use the default media",
            },
          },
          required: ["fileId", "accessToken"],
        },
      },
      {
        name: "list-files",
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
              description: "The query to use while searching the files.",
            },
            fields: {
              type: "string",
              description:
                "The fields to return for the file. At the very least, include the file id, name, mime type and capabilities(canDownload). Here's an example of how to get the file fields: 'nextPageToken, files(id, name, capabilities(canDownload))'",
            },
          },
          required: ["query", "accessToken", "fields"],
        },
      },
    ],
  };
}
