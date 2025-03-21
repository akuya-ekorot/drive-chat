import * as Match from "effect/Match";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Config from "effect/Config";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import type {
  ExportFileParams,
  GetFileParams,
  ListFilesParams,
} from "./Schemas";

const isTextBasedFile = (mimeType: string) =>
  Match.value(mimeType).pipe(
    Match.when("application/json", () => true),
    Match.when("application/xml", () => true),
    Match.when("image/svg+xml", () => true),
    Match.when(
      (s) => s.startsWith("text/"),
      () => true,
    ),
    Match.orElse(() => false),
  );

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
                    text: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
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

            const response = yield* client.execute(req);
            const json = yield* response.json;

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
        get: (params: GetFileParams, token: Redacted.Redacted<string>) =>
          Effect.gen(function* () {
            const getUrl = new URL(baseUrl + "/" + params.fileId);
            getUrl.searchParams.set("key", apiKey);

            // check if file exists
            const req = HttpClientRequest.get(getUrl.toString()).pipe(
              HttpClientRequest.setHeader(
                "Authorization",
                `Bearer ${token.pipe(Redacted.value)}`,
              ),
            );

            const response = yield* client.execute(req);

            const GetFileJsonSchema = Schema.Struct({
              kind: Schema.Literal("drive#file"),
              id: Schema.String,
              name: Schema.String,
              mimeType: Schema.String,
            });

            const json = yield* response.json;

            const fileMetadata = yield* Match.value(json).pipe(
              Match.when(Schema.is(GetFileJsonSchema), (json) =>
                Effect.succeed(json),
              ),
              Match.orElse(() => Effect.fail(new Error("File not found"))),
            );

            getUrl.searchParams.set("alt", "media");

            const getFileRequest = HttpClientRequest.get(
              getUrl.toString(),
            ).pipe(
              HttpClientRequest.setHeader(
                "Authorization",
                `Bearer ${token.pipe(Redacted.value)}`,
              ),
            );

            const getFileResponse = yield* client.execute(getFileRequest);

            if (isTextBasedFile(fileMetadata.mimeType)) {
              const text = yield* getFileResponse.text;

              return {
                content: [
                  {
                    type: "resource" as const,
                    resource: {
                      uri: `gdrive://${fileMetadata.id}`,
                      mimeType: fileMetadata.mimeType,
                      text,
                    },
                  },
                ],
              };
            } else {
              const fileContent = yield* getFileResponse.arrayBuffer;
              const buffer = Buffer.from(fileContent);
              const blob = buffer.toString("base64");

              return {
                content: [
                  {
                    type: "resource" as const,
                    resource: {
                      uri: `gdrive://${fileMetadata.id}`,
                      mimeType: fileMetadata.mimeType,
                      blob,
                    },
                  },
                ],
              };
            }
          }).pipe(
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
        export: (params: ExportFileParams, token: Redacted.Redacted<string>) =>
          Effect.gen(function* () {
            const exportUrl = new URL(
              baseUrl + "/" + params.fileId + "/export",
            );

            exportUrl.searchParams.set("mimeType", params.mimeType);
            exportUrl.searchParams.set("key", apiKey);

            const req = HttpClientRequest.get(exportUrl.toString()).pipe(
              HttpClientRequest.setHeader(
                "Authorization",
                `Bearer ${token.pipe(Redacted.value)}`,
              ),
            );

            const response = yield* client.execute(req);
            const text = yield* response.text;

            return text;
          }).pipe(
            Effect.map((res) => ({
              content: [
                {
                  type: "resource" as const,
                  resource: {
                    text: JSON.stringify(res),
                    uri: `gdrive://${params.fileId}`,
                    mimeType: params.mimeType,
                  },
                },
              ],
            })),
            Effect.catchAll((error) => {
              return Effect.succeed({
                isError: true,
                content: [
                  {
                    type: "text" as const,
                    text: `Export failed failed: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
              });
            }),
          ),
      };
    }),
  },
) {}
