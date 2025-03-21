import * as Effect from "effect/Effect";
// import * as Match from "effect/Match";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { GoogleDriveService } from "./GoogleDriveService";
import { ListFilesZodSchema } from "./Schemas";
import { GoogleDriveClient } from "./GoogleDriveClient";
import { FetchHttpClient } from "@effect/platform";
import { Logger, Redacted } from "effect";
import { CurrentAccessToken } from "./AuthenticationService";

// const getSuggestedExportMimeType = (fileType: string) =>
//   Match.value(fileType).pipe(
//     Match.withReturnType<string>(),
//     Match.when("application/vnd.google-apps.spreadsheet", () => "text/csv"),
//     Match.when("application/vnd.google-apps.document", () => "text/plain"),
//     Match.when("application/vnd.google-apps.presentation", () => "text/plain"),
//     Match.when("application/vnd.google-apps.drawing", () => "image/svg+xml"),
//     Match.when("application/vnd.google-apps.script", () => "application/json"),
//     Match.orElse(() => "text/plain"),
//   );

const initServer = () =>
  Effect.gen(function* () {
    const gdrive = yield* GoogleDriveClient;
    const { token } = yield* CurrentAccessToken;

    yield* Effect.log(
      `Initializing MCP Service with token ${token.pipe(Redacted.value)}`,
    );

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

    // server.tool(
    //   "export",
    //   "Export Google Workspace files (Docs, Sheets, Slides) to text formats for processing",
    //   ExportFileSchema.shape,
    //   async (args) => {
    //     try {
    //       const fileMetadata = await drive.files.get({
    //         fileId: args.fileId,
    //         fields: "mimeType,name",
    //       });

    //       const fileMimeType = fileMetadata.data.mimeType;
    //       const fileName = fileMetadata.data.name;

    //       const suggestedMimeType = getSuggestedExportMimeType(
    //         fileMimeType ?? "",
    //       );

    //       const exportMimeType = args.mimeType ?? suggestedMimeType;

    //       const res = await drive.files.export({
    //         fileId: args.fileId,
    //         mimeType: exportMimeType,
    //       });

    //       if (typeof res.data === "string" || res.data instanceof Buffer) {
    //         const textData =
    //           res.data instanceof Buffer
    //             ? res.data.toString("utf-8")
    //             : String(res.data);

    //         return {
    //           content: [
    //             {
    //               type: "text",
    //               text: `Exported "${fileName}" as ${exportMimeType}:\n\n${textData}`,
    //             },
    //           ],
    //         };
    //       } else {
    //         return {
    //           content: [
    //             {
    //               type: "text",
    //               text: `Exported "${fileName}" as ${exportMimeType}:\n\n${JSON.stringify(res.data, null, 2)}`,
    //             },
    //           ],
    //         };
    //       }
    //     } catch (error) {
    //       return {
    //         isError: true,
    //         content: [
    //           {
    //             type: "text",
    //             text: `Failed to export file: ${error instanceof Error ? error.message : String(error)}`,
    //           },
    //         ],
    //       };
    //     }
    //   },
    // );

    // server.tool(
    //   "get",
    //   "Retrieve file content from Google Drive as a binary resource",
    //   GetFileSchema.shape,
    //   async (args) => {
    //     try {
    //       const metadata = await drive.files.get({
    //         fileId: args.fileId,
    //         fields: "mimeType,name,size",
    //       });

    //       const fileMimeType =
    //         args.mimeType ??
    //         metadata.data.mimeType ??
    //         "application/octet-stream";

    //       const fileName = metadata.data.name;

    //       const file = await drive.files.get(
    //         {
    //           fileId: args.fileId,
    //           alt: "media",
    //         },
    //         {
    //           responseType: "arraybuffer",
    //         },
    //       );

    //       const buffer =
    //         file.data instanceof Buffer
    //           ? file.data
    //           : Buffer.from(file.data as any);

    //       const blob = buffer.toString("base64");

    //       const safeFileName = encodeURIComponent(fileName || args.fileId);
    //       const uri = `gdrive://${args.fileId}/${safeFileName}`;

    //       return {
    //         content: [
    //           {
    //             type: "resource",
    //             resource: {
    //               uri,
    //               name: fileName,
    //               description: `Google Drive file: ${fileName}`,
    //               blob,
    //               mimeType: fileMimeType,
    //             },
    //           },
    //         ],
    //       };
    //     } catch (error) {
    //       return {
    //         isError: true,
    //         content: [
    //           {
    //             type: "text",
    //             text: `Failed to get file: ${error instanceof Error ? error.message : String(error)}`,
    //           },
    //         ],
    //       };
    //     }
    //   },
    // );

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
