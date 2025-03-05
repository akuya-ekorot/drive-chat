import { pipe, Schema } from "effect";
import * as EffectConfig from "effect/Config";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import { ContentType } from "../pdk";
import type { ListFilesParams } from "./schemas";

const makeListMethod =
  (baseUrl: string, accessToken: string, apiKey: string) =>
  (params: ListFilesParams) =>
    pipe(
      Object.entries(params),
      Effect.forEach(
        (keyValue) =>
          pipe(
            keyValue,
            Match.value,
            Match.when(
              [Match.is("query"), Match.nonEmptyString],
              ([_, value]) => Effect.succeed(`q=${encodeURI(value)}`),
            ),
            Match.when([Match.is("accessToken"), Match.nonEmptyString], () =>
              Effect.succeed(`access_token=${encodeURI(accessToken)}`),
            ),
            Match.orElse(([key, value]) =>
              Effect.succeed(`${key}=${encodeURI(value.toString())}`),
            ),
          ),
        { concurrency: "unbounded" },
      ),
      Effect.andThen((partialParams) => partialParams.concat(`key=${apiKey}`)),
      Effect.andThen((queryParams) => baseUrl + queryParams.join("&")),
      Effect.andThen((requestUrl) =>
        pipe(
          Http.request({
            url: requestUrl,
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: `application/json`,
            },
          }),
          Match.value,
          Match.when({ status: 200, body: Schema.is(Schema.String) }, (a) =>
            Effect.succeed({
              content: [{ type: ContentType.Text, text: a.body }],
            }),
          ),
          Match.orElse((a) =>
            Effect.succeed({
              content: [
                { type: ContentType.Text, isError: true, text: a.body },
              ],
            }),
          ),
        ),
      ),
    );

export class DriveClient extends Effect.Service<DriveClient>()("DriveClient", {
  accessors: true,
  effect: Effect.gen(function* () {
    const accessToken = yield* EffectConfig.string("ACCESS_TOKEN");
    const apiKey = yield* EffectConfig.string("GOOGLE_API_KEY");
    const baseUrl = "https://www.googleapis.com/drive/v3/files?";

    return {
      list: makeListMethod(baseUrl, accessToken, apiKey),
    };
  }),
}) {}
