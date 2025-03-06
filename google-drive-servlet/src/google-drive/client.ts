import { Console, pipe } from "effect";
import * as EffectConfig from "effect/Config";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import { ContentType } from "../pdk";
import type { ExportParams, GetParams, ListFilesParams } from "./schemas";

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
      Effect.andThen((queryParams) => baseUrl + "?" + queryParams.join("&")),
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
          Match.when({ status: 200, body: Match.string }, (a) =>
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

export const makeGetMethod =
  (baseUrl: string, accessToken: string, apiKey: string) =>
  (params: GetParams) =>
    pipe(
      Effect.succeed(params),
      Effect.andThen((params) => {
        const { fileId, ...queryParams } = params;
        const getBaseUrl = baseUrl + `/${fileId}`;

        return pipe(
          Object.entries(queryParams),
          Effect.forEach(
            ([key, value]) =>
              pipe(
                [key, value],
                Match.value,
                Match.when(
                  [Match.is("accessToken"), Match.nonEmptyString],
                  () =>
                    Effect.succeed(`access_token=${encodeURI(accessToken)}`),
                ),
                Match.orElse(([key, value]) =>
                  Effect.succeed(`${key}=${encodeURI(String(value))}`),
                ),
              ),
            { concurrency: "unbounded" },
          ),
          Effect.andThen((partialParams) =>
            partialParams.concat(`key=${apiKey}`),
          ),
          Effect.andThen(
            (queryParamsList) => getBaseUrl + "?" + queryParamsList.join("&"),
          ),
          Effect.andThen((requestUrl) =>
            pipe(
              Http.request({
                url: requestUrl,
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "media",
                },
              }),
              Match.value,
              Match.when({ status: 200, body: Match.string }, (response) =>
                Effect.succeed({
                  content: [{ type: ContentType.Text, text: response.body }],
                }),
              ),
              Match.orElse((response) =>
                Effect.succeed({
                  content: [
                    {
                      type: ContentType.Text,
                      isError: true,
                      text: response.body,
                    },
                  ],
                }),
              ),
            ),
          ),
        );
      }),
    );

export const makeExportMethod =
  (baseUrl: string, accessToken: string, apiKey: string) =>
  (params: ExportParams) =>
    pipe(
      Effect.succeed(params),
      Effect.andThen((params) => {
        const { fileId, ...queryParams } = params;
        const exportBaseUrl = baseUrl + `/${fileId}/export`;

        return pipe(
          Object.entries(queryParams),
          Effect.forEach(
            ([key, value]) =>
              pipe(
                [key, value],
                Match.value,
                Match.when(
                  [Match.is("accessToken"), Match.nonEmptyString],
                  () => Effect.succeed(``),
                ),
                Match.orElse(([key, value]) =>
                  Effect.succeed(`${key}=${encodeURI(String(value))}`),
                ),
              ),
            { concurrency: "unbounded" },
          ),
          Effect.andThen((partialParams) =>
            partialParams.filter(Boolean).concat(`key=${apiKey}`),
          ),
          Effect.andThen(
            (queryParamsList) =>
              exportBaseUrl + "?" + queryParamsList.join("&"),
          ),
          Effect.andThen((requestUrl) =>
            pipe(
              Http.request({
                url: requestUrl,
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json",
                },
              }),
              Match.value,
              Match.when({ status: 200, body: Match.string }, (response) =>
                Effect.succeed({
                  content: [{ type: ContentType.Text, text: response.body }],
                }),
              ),
              Match.orElse((response) =>
                Effect.succeed({
                  content: [
                    {
                      type: ContentType.Text,
                      isError: true,
                      text: response.body,
                    },
                  ],
                }),
              ),
            ),
          ),
        );
      }),
    );

export class DriveClient extends Effect.Service<DriveClient>()("DriveClient", {
  accessors: true,
  effect: Effect.gen(function* () {
    const accessToken = yield* EffectConfig.string("ACCESS_TOKEN");
    const apiKey = yield* EffectConfig.string("GOOGLE_API_KEY");
    const baseUrl = "https://www.googleapis.com/drive/v3/files";

    return {
      list: makeListMethod(baseUrl, accessToken, apiKey),
      get: makeGetMethod(baseUrl, accessToken, apiKey),
      export: makeExportMethod(baseUrl, accessToken, apiKey),
    };
  }),
}) {}
