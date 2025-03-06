import { Match, Schema } from "effect";
import { GoogleDrive } from "./google-drive";
import { ExportFileParams, GetFileParams, SearchFilesParams } from "./schemas";

export const handleListFile = Match.when(
  Schema.is(Schema.asSchema(SearchFilesParams)),
  (a) => GoogleDrive.listFiles(a),
);

export const handleGetFile = Match.when(
  Schema.is(Schema.asSchema(GetFileParams)),
  (a) => GoogleDrive.getFile(a),
);

export const handleExportFile = Match.when(
  Schema.is(Schema.asSchema(ExportFileParams)),
  (a) => GoogleDrive.exportFile(a),
);
