import * as Effect from "effect/Effect";
import * as Config from "effect/Config";
import * as HttpClient from "@effect/platform/HttpClient";
import type { ListFilesParams } from "./Schemas";
import { HttpClientRequest } from "@effect/platform";
import { Redacted } from "effect";

export class GoogleDriveClient extends Effect.Service<GoogleDriveClient>()(
  "GoogleDriveClient",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const baseUrl = "https://www.googleapis.com/drive/v3/files";
      const client = yield* HttpClient.HttpClient;
      const apiKey = yield* Config.string("GOOGLE_API_KEY");

      return {
        health: (token: Redacted.Redacted<string>) =>
          Effect.gen(function* () {
            const healthUrl = new URL(baseUrl);
            healthUrl.searchParams.set("key", apiKey);

            const req = HttpClientRequest.get(healthUrl.toString()).pipe(
              HttpClientRequest.setHeader(
                "Authorization",
                `Bearer ${token.pipe(Redacted.value)}`,
              ),
            );

            yield* Effect.log(`Health request: ${req}`);

            const res = yield* client.execute(req);
            const json = yield* res.json;

            yield* Effect.log(`Health response: ${JSON.stringify(json)}`);

            return res.status === 200;
          }).pipe(
            Effect.map((res) => ({
              content: [{ type: "text" as const, text: JSON.stringify(res) }],
            })),
            Effect.catchAll((error) => {
              return Effect.succeed({
                isError: true,
                content: [
                  {
                    type: "text" as const,
                    text: `List failed: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
              });
            }),
          ),
        list: (params: ListFilesParams, token: Redacted.Redacted<string>) =>
          Effect.gen(function* () {
            const listUrl = new URL(baseUrl);

            listUrl.searchParams.set("key", apiKey);

            if (params.q) listUrl.searchParams.set("q", params.q);
            if (params.fields)
              listUrl.searchParams.set("fields", params.fields);
            if (params.pageToken)
              listUrl.searchParams.set("pageToken", params.pageToken);
            if (params.pageSize)
              listUrl.searchParams.set("pageSize", params.pageSize.toString());
            if (params.orderBy)
              listUrl.searchParams.set("orderBy", params.orderBy);

            const req = HttpClientRequest.get(listUrl.toString()).pipe(
              HttpClientRequest.setHeader(
                "Authorization",
                `Bearer ${token.pipe(Redacted.value)}`,
              ),
            );

            yield* Effect.log(`Requesting list from ${listUrl}`);

            const response = yield* client.execute(req);
            const json = yield* response.json;

            yield* Effect.log(`List response: ${JSON.stringify(json)}`);

            return json;
          }).pipe(
            Effect.map((res) => ({
              content: [{ type: "text" as const, text: JSON.stringify(res) }],
            })),
            Effect.catchAll((error) => {
              return Effect.succeed({
                isError: true,
                content: [
                  {
                    type: "text" as const,
                    text: `List failed: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
              });
            }),
          ),
      };
    }),
  },
) {}
