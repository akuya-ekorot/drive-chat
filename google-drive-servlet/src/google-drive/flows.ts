import { flow, Match, Schema } from "effect";
import { GoogleDrive } from "./google-drive";
import { SearchFilesParams } from "./schemas";

export const handleSearchFiles = flow(
  Match.when(Schema.is(Schema.asSchema(SearchFilesParams)), (a) =>
    GoogleDrive.searchFiles(a),
  ),
);
