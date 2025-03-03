import { Schema } from "effect";

// =============================
// Request Parameter Schemas
// =============================

// Request parameters for files.list endpoint
export const ListFilesParams = Schema.Struct({
  query: Schema.String,
  pageSize: Schema.optional(Schema.Int),
  pageToken: Schema.optional(Schema.String),
  orderBy: Schema.optional(Schema.String),
  corpora: Schema.optional(
    Schema.Literal("user", "domain", "teamDrive", "allTeamDrives"),
  ),
  driveId: Schema.optional(Schema.String),
  spaces: Schema.optional(Schema.Literal("drive", "appDataFolder")),
  includePermissionsForView: Schema.optional(Schema.Literal("published")),
  supportsAllDrives: Schema.optional(Schema.Boolean),
  includeItemsFromAllDrives: Schema.optional(Schema.Boolean),
  includeLabels: Schema.optional(Schema.String),
});
export type ListFilesParams = typeof ListFilesParams.Type;

// =============================
// Response Schemas
// =============================

// File resource schema
// export const FileSchema = Schema.Struct({
//   id: Schema.String,
//   name: Schema.String,
//   mimeType: Schema.String,
//   kind: Schema.optional(Schema.String),
//
//   // Common file metadata
//   size: Schema.optional(Schema.String), // File size as string (can be parsed as number)
//   modifiedTime: Schema.optional(Schema.String),
//   createdTime: Schema.optional(Schema.String),
//
//   // File-specific properties
//   webViewLink: Schema.optional(Schema.String),
//   webContentLink: Schema.optional(Schema.String),
//   thumbnailLink: Schema.optional(Schema.String),
//   iconLink: Schema.optional(Schema.String),
//   hasThumbnail: Schema.optional(Schema.Boolean),
//
//   // Permissions and sharing
//   shared: Schema.optional(Schema.Boolean),
//   ownedByMe: Schema.optional(Schema.Boolean),
//   capabilities: Schema.optional(
//     Schema.Record({ key: Schema.String, value: Schema.Boolean }),
//   ),
//
//   // Parent folder information
//   parents: Schema.optional(Schema.Array(Schema.String)),
//
//   // Additional metadata
//   trashed: Schema.optional(Schema.Boolean),
//   explicitlyTrashed: Schema.optional(Schema.Boolean),
//   starred: Schema.optional(Schema.Boolean),
//
//   // For Google Docs, Sheets, etc.
//   exportLinks: Schema.optional(
//     Schema.Record({ key: Schema.String, value: Schema.String }),
//   ),
// });
//
// // Files list response schema
// export const ListFilesResponseSchema = Schema.Struct({
//   nextPageToken: Schema.optional(Schema.String),
//   kind: Schema.optional(Schema.String),
//   incompleteSearch: Schema.optional(Schema.Boolean),
//   files: Schema.Array(FileSchema),
// });
//
// Helper type for the response
// export type ListFilesResponse = typeof ListFilesResponseSchema.Type;

// =============================
// Parameter Schemas for API Integration
// =============================

// Interface for the servlet parameter Structure
export const SearchFilesParams = Schema.Struct({
  params: Schema.Struct({
    name: Schema.Literal("search-files"),
    arguments: ListFilesParams.pipe(
      Schema.extend(Schema.Struct({ accessToken: Schema.String })),
    ),
  }),
});
export type SearchFilesParams = typeof SearchFilesParams.Type;

// =============================
// Response Model for Servlet
// =============================

// Using data.Tagged for the ContentType enum if it doesn't exist yet
// export const ContentType = Data.tagged("type");
// export type ContentType = Data.TaggedEnum<typeof ContentType>;

// Define the content types if they're not already defined in your project
// export class Text extends ContentType.Tag("Text")<Text, { text: string }> {}
// export class JSON extends ContentType.Tag("JSON")<JSON, { text: string }> {}

// File Operation Response Schema
// export const FileOperationResponseSchema = Schema.Struct({
//   content: Schema.Array(
//     Schema.Union(
//       Schema.Struct({
//         type: Schema.Literal("Text"),
//         text: Schema.String,
//       }),
//       Schema.Struct({
//         type: Schema.Literal("JSON"),
//         text: Schema.String,
//       }),
//     ),
//   ),
// });
//
// export type FileOperationResponse = typeof FileOperationResponseSchema.Type;
