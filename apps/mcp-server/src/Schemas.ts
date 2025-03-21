import { z } from "zod";
import * as Schema from "effect/Schema";

export const ListFilesParams = Schema.Struct({
  q: Schema.String.pipe(Schema.optional),
  pageSize: Schema.Number.pipe(Schema.optional),
  pageToken: Schema.String.pipe(Schema.optional),
  fields: Schema.String.pipe(Schema.optional),
  orderBy: Schema.String.pipe(Schema.optional),
});
export type ListFilesParams = typeof ListFilesParams.Type;

export const File = Schema.Struct({});
export const ListFilesResponse = Schema.Struct({
  nextPageToken: Schema.String.pipe(Schema.optional),
  kind: Schema.Literal("drive#fileList").pipe(Schema.optional),
  incompleteSearch: Schema.Boolean.pipe(Schema.optional),
});

export const ListFilesZodSchema = z.object({
  q: z
    .string()
    .optional()
    .describe(
      "Search query string in Google Drive query format (e.g., 'mimeType=\"application/pdf\"')",
    ),
  pageSize: z
    .number()
    .optional()
    .describe("Maximum number of files to return per page (1-1000)"),
  pageToken: z
    .string()
    .optional()
    .describe(
      "Token for pagination, used to retrieve the next page of results",
    ),
  fields: z
    .string()
    .optional()
    .describe("Selector specifying which fields to include in the response"),
  orderBy: z
    .string()
    .optional()
    .describe("Field by which to sort results (e.g., 'modifiedTime desc')"),
});

export const ExportFileParams = Schema.Struct({
  fileId: Schema.String.pipe(Schema.optional),
  mimeType: Schema.String.pipe(Schema.optional),
});
export type ExportFileParams = typeof ExportFileParams.Type;

export const ExportFileSchema = z.object({
  fileId: z.string().describe("The ID of the Google Workspace file to export"),
  mimeType: z
    .string()
    .describe(
      "The MIME type to export the file as (e.g., 'text/csv' for Sheets)",
    ),
});

export type GetFileParams = typeof GetFileParams.Type;
export const GetFileParams = Schema.Struct({
  fileId: Schema.String.pipe(Schema.optional),
  mimeType: Schema.String.pipe(Schema.optional),
});

export const GetFileSchema = z.object({
  fileId: z
    .string()
    .describe("The ID of the file to retrieve from Google Drive"),
  mimeType: z
    .string()
    .optional()
    .describe(
      "The MIME type of the file (optional, will be detected if not provided)",
    ),
});
