import { Effect } from "effect";
import type {
  ExportFileParams,
  GetFileParams,
  SearchFilesParams,
} from "./schemas";
import { DriveClient } from "./client";

export class GoogleDrive extends Effect.Service<GoogleDrive>()("GoogleDrive", {
  effect: Effect.gen(function* () {
    const drive = yield* DriveClient;

    return {
      listFiles: (a: SearchFilesParams) => drive.list(a.params.arguments),
      getFile: (a: GetFileParams) => drive.get(a.params.arguments),
      exportFile: (a: ExportFileParams) => drive.export(a.params.arguments),
    };
  }),
  accessors: true,
}) {}
