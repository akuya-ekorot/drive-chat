import { Effect } from "effect";
import type { SearchFilesParams } from "./schemas";
import { DriveClient } from "./client";

export class GoogleDrive extends Effect.Service<GoogleDrive>()("GoogleDrive", {
  effect: Effect.gen(function* () {
    const drive = yield* DriveClient;

    return {
      searchFiles: (a: SearchFilesParams) => drive.list(a.params.arguments),
    };
  }),
  accessors: true,
}) {}
