import { drive_v3, google } from "googleapis";
import * as Effect from "effect/Effect";
import { Config } from "effect";
import { DriveError } from "./Errors";

export class GoogleDriveService extends Effect.Service<GoogleDriveService>()(
  "GoogleDriveService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      let drive: drive_v3.Drive;
      return {
        authenticateDrive: (token: string) =>
          Effect.gen(function* () {
            const apiKey = yield* Config.string("GOOGLE_API_KEY");

            yield* Effect.log(`Authenticating drive with API key ${apiKey}`);

            drive = google.drive({
              version: "v3",
              auth: token,
              key: apiKey,
              params: { key: apiKey },
            });

            return drive;
          }).pipe(
            Effect.catchAll(() =>
              Effect.fail(
                new DriveError({ message: "Failed to authenticate drive" }),
              ),
            ),
          ),

        getDrive: () => Effect.succeed(drive),
      };
    }),
  },
) {}
