import { Config as EffectConfig, Effect, Match, pipe } from "effect";
import type { ListFilesParams, SearchFilesParams } from "./schemas";
import { ContentType } from "../pdk";

export class DriveClient extends Effect.Service<DriveClient>()("DriveClient", {
  accessors: true,
  effect: Effect.gen(function* () {
    const accessToken = yield* EffectConfig.string("ACCESS_TOKEN");
    const apiKey = yield* EffectConfig.string("GOOGLE_API_KEY");

    const baseUrl = "https://www.googleapis.com/drive/v3/files?";

    return {
      list: (a: ListFilesParams) =>
        Effect.gen(function* () {
          const queryParams = yield* Effect.forEach(
            Object.entries(a),
            ([param, value]) =>
              pipe(
                [param, value],
                Match.value,
                Match.when(
                  [Match.is("query"), Match.nonEmptyString],
                  ([_, value]) => Effect.succeed(`q=${encodeURI(value)}`),
                ),
                Match.when(
                  [Match.is("accessToken"), Match.nonEmptyString],
                  () =>
                    Effect.succeed(`access_token=${encodeURI(accessToken)}`),
                ),
                Match.orElse(() =>
                  Effect.succeed(`${param}=${encodeURI(value.toString())}`),
                ),
              ),
            { concurrency: "unbounded" },
          ).pipe(Effect.map((a) => a.join("&")));

          const requestUrl = baseUrl + queryParams + `key=${apiKey}`;

          const request = Http.request({
            url: requestUrl,
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: `application/json`,
            },
          });

          return {
            content: [
              {
                type: ContentType.Text,
                text: JSON.stringify(request),
              },
            ],
          };
        }),
    };
  }),
}) {}

export class GoogleDrive extends Effect.Service<GoogleDrive>()("GoogleDrive", {
  effect: Effect.gen(function* () {
    const drive = yield* DriveClient;

    return {
      searchFiles: (a: SearchFilesParams) => drive.list(a.params.arguments),
    };
  }),
  accessors: true,
}) {}
