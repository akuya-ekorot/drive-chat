import * as Effect from "effect/Effect";
import * as Logger from "effect/Logger";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExportFileSchema, GetFileSchema, ListFilesZodSchema } from "./Schemas";
import { GoogleDriveClient } from "./GoogleDriveClient";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import { CurrentAccessToken } from "./AuthenticationService";

const initServer = () =>
  Effect.gen(function* () {
    const gdrive = yield* GoogleDriveClient;
    const { token } = yield* CurrentAccessToken;

    const server = new McpServer(
      { name: "gdrive-sse", version: "0.1.0" },
      {
        capabilities: {
          tools: {
            health: {
              description:
                "Verify the MCP server and Google Drive API connection are functioning correctly",
            },
            list: {
              description:
                "Retrieve a list of files and folders from the user's Google Drive with filtering, paging, and sorting options",
            },
            export: {
              description:
                "Convert and export Google Workspace files (Docs, Sheets, Slides) to plain text formats for processing",
            },
            get: {
              description:
                "Retrieve file content from Google Drive as a resource, supporting various file types including documents, images, and PDFs",
            },
          },
        },
      },
    );

    server.tool(
      "health",
      "Verify server and Google Drive API connection status",
      {},
      () =>
        gdrive
          .health(token)
          .pipe(
            Effect.provide(FetchHttpClient.layer),
            Effect.provide(Logger.pretty),
            Effect.runPromise,
          ),
    );

    server.tool(
      "list",
      "List files and folders in Google Drive with filtering and pagination options",
      ListFilesZodSchema.shape,
      (args) =>
        gdrive
          .list(args, token)
          .pipe(
            Effect.provide(FetchHttpClient.layer),
            Effect.provide(Logger.pretty),
            Effect.runPromise,
          ),
    );

    server.tool(
      "export",
      "Export Google Workspace files (Docs, Sheets, Slides) to text formats for processing",
      ExportFileSchema.shape,
      async (args) =>
        gdrive
          .export(args, token)
          .pipe(
            Effect.provide(FetchHttpClient.layer),
            Effect.provide(Logger.pretty),
            Effect.runPromise,
          ),
    );

    server.tool(
      "get",
      "Retrieve file content from Google Drive as a binary resource",
      GetFileSchema.shape,
      async (args) =>
        gdrive
          .get(args, token)
          .pipe(
            Effect.provide(FetchHttpClient.layer),
            Effect.provide(Logger.pretty),
            Effect.runPromise,
          ),
    );

    return server;
  });

export class McpServerService extends Effect.Service<McpServerService>()(
  "McpServerService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return { initServer };
    }),
  },
) {}
