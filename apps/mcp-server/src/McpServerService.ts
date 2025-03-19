import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GoogleDriveService } from "./GoogleDriveService";
import { ExportFileSchema, GetFileSchema, ListFilesSchema } from "./Schemas";
import { CurrentAccessToken } from "./AuthenticationService";
import { Redacted } from "effect";

const getSuggestedExportMimeType = (fileType: string) =>
  Match.value(fileType).pipe(
    Match.withReturnType<string>(),
    Match.when("application/vnd.google-apps.spreadsheet", () => "text/csv"),
    Match.when("application/vnd.google-apps.document", () => "text/plain"),
    Match.when("application/vnd.google-apps.presentation", () => "text/plain"),
    Match.when("application/vnd.google-apps.drawing", () => "image/svg+xml"),
    Match.when("application/vnd.google-apps.script", () => "application/json"),
    Match.orElse(() => "text/plain"),
  );

const initServer = () =>
  Effect.gen(function* () {
    const accessToken = yield* CurrentAccessToken;
    const drive = yield* GoogleDriveService.authenticateDrive(
      accessToken.token.pipe(Redacted.value),
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
      async () => {
        try {
          const user = await drive.about.get({ fields: "user" });
          return {
            content: [
              {
                type: "text",
                text: `Server is healthy and connected to Google Drive API for user ${user}`,
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    );

    server.tool(
      "list",
      "List files and folders in Google Drive with filtering and pagination options",
      ListFilesSchema.shape,
      async (args) => {
        try {
          // Create a params object with properly typed properties
          const params: {
            fields?: string;
            q?: string;
            pageSize?: number;
            pageToken?: string;
            orderBy?: string;
          } = {};

          // Only add properties that are defined
          if (args.fields !== undefined) params.fields = args.fields;
          if (args.q !== undefined) params.q = args.q;
          if (args.pageSize !== undefined) params.pageSize = args.pageSize;
          if (args.pageToken !== undefined) params.pageToken = args.pageToken;
          if (args.orderBy !== undefined) params.orderBy = args.orderBy;

          const res = await drive.files.list(params);
          const formattedFiles =
            res.data.files?.map((file) => ({
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              createdTime: file.createdTime,
              modifiedTime: file.modifiedTime,
              size: file.size,
              webViewLink: file.webViewLink,
            })) ?? [];

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    files: formattedFiles,
                    nextPageToken: res.data.nextPageToken,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Failed to list files: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    );

    server.tool(
      "export",
      "Export Google Workspace files (Docs, Sheets, Slides) to text formats for processing",
      ExportFileSchema.shape,
      async (args) => {
        try {
          const fileMetadata = await drive.files.get({
            fileId: args.fileId,
            fields: "mimeType,name",
          });

          const fileMimeType = fileMetadata.data.mimeType;
          const fileName = fileMetadata.data.name;

          const suggestedMimeType = getSuggestedExportMimeType(
            fileMimeType ?? "",
          );

          const exportMimeType = args.mimeType ?? suggestedMimeType;

          const res = await drive.files.export({
            fileId: args.fileId,
            mimeType: exportMimeType,
          });

          if (typeof res.data === "string" || res.data instanceof Buffer) {
            const textData =
              res.data instanceof Buffer
                ? res.data.toString("utf-8")
                : String(res.data);

            return {
              content: [
                {
                  type: "text",
                  text: `Exported "${fileName}" as ${exportMimeType}:\n\n${textData}`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Exported "${fileName}" as ${exportMimeType}:\n\n${JSON.stringify(res.data, null, 2)}`,
                },
              ],
            };
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Failed to export file: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
    );

    server.tool(
      "get",
      "Retrieve file content from Google Drive as a binary resource",
      GetFileSchema.shape,
      async (args) => {
        try {
          const metadata = await drive.files.get({
            fileId: args.fileId,
            fields: "mimeType,name,size",
          });

          const fileMimeType =
            args.mimeType ??
            metadata.data.mimeType ??
            "application/octet-stream";

          const fileName = metadata.data.name;

          const file = await drive.files.get(
            {
              fileId: args.fileId,
              alt: "media",
            },
            {
              responseType: "arraybuffer",
            },
          );

          const buffer =
            file.data instanceof Buffer
              ? file.data
              : Buffer.from(file.data as any);

          const blob = buffer.toString("base64");

          const safeFileName = encodeURIComponent(fileName || args.fileId);
          const uri = `gdrive://${args.fileId}/${safeFileName}`;

          return {
            content: [
              {
                type: "resource",
                resource: {
                  uri,
                  name: fileName,
                  description: `Google Drive file: ${fileName}`,
                  blob,
                  mimeType: fileMimeType,
                },
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `Failed to get file: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      },
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
