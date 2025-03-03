import * as Effect from "effect/Effect";
import { McpTaggedError } from "./Errors";
import { McpServerService } from "./McpServerService";
import { McpTransportService } from "./McpTransportService";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as NodeHttpServerRequest from "@effect/platform-node/NodeHttpServerRequest";
import type { HandleMessageUrlParams } from "./Api";
import { RedisService } from "./RedisService";
import { createSyntheticIncomingMessage, readRequestBody } from "./HttpUtils";
import { ServerResponse } from "http";

const handleSse = () =>
  Effect.gen(function* () {
    const serverRequest = yield* HttpServerRequest.HttpServerRequest;
    const res = NodeHttpServerRequest.toServerResponse(serverRequest);

    const transport = yield* McpTransportService.initTransport(res);

    yield* RedisService.subscribe(
      `requests:${transport.sessionId}`,
      (message: string) =>
        Effect.gen(function* () {
          const request = JSON.parse(message);

          const req = createSyntheticIncomingMessage({
            method: request.method,
            url: request.url,
            headers: request.headers,
            body: request.body,
          });

          const res = new ServerResponse(req);

          yield* Effect.tryPromise({
            try: () => transport.handlePostMessage(req, res),
            catch: () =>
              new McpTaggedError({ message: "Failed to handle message" }),
          });
        }).pipe(Effect.runFork),
    );

    const server = yield* McpServerService.initServer();

    yield* Effect.tryPromise({
      try: () => server.connect(transport),
      catch: () =>
        new McpTaggedError({ message: "Failed to connect to server" }),
    });
  });

const handleMessages = ({ urlParams }: { urlParams: HandleMessageUrlParams }) =>
  Effect.gen(function* () {
    const serverRequest = yield* HttpServerRequest.HttpServerRequest;
    const req = NodeHttpServerRequest.toIncomingMessage(serverRequest);

    const transport = yield* McpTransportService.getTransport(
      urlParams.sessionId,
    );

    const requestId = crypto.randomUUID();

    const body = yield* Effect.tryPromise({
      try: () => readRequestBody(req),
      catch: () =>
        new McpTaggedError({ message: "Failed to read request body" }),
    });

    yield* RedisService.publish(
      `requests:${transport.sessionId}`,
      JSON.stringify({
        requestId,
        headers: req.headers,
        method: req.method,
        url: req.url,
        body,
      }),
    );
  });

export class McpRepository extends Effect.Service<McpRepository>()(
  "McpRepository",
  { accessors: true, sync: () => ({ handleSse, handleMessages }) },
) {}
