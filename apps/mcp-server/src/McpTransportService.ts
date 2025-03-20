import * as Match from "effect/Match";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
// import * as Logger from "effect/Logger";
import * as Option from "effect/Option";
import * as HashMap from "effect/HashMap";
import { ServerResponse, IncomingMessage } from "http";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

export class TransportError extends Schema.TaggedError<TransportError>()(
  "TransportError",
  { message: Schema.String },
) {}

export class McpTransportService extends Effect.Service<McpTransportService>()(
  "McpTransportService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      let transports = HashMap.empty<string, SSEServerTransport>();

      return {
        initTransport: (res: ServerResponse<IncomingMessage>) =>
          Effect.gen(function* () {
            const transport = new SSEServerTransport("/messages", res);

            // res.on("close", () =>
            //   Effect.gen(function* () {
            //     yield* Effect.log(
            //       `Closed transport for session ${transport.sessionId}`,
            //     );
            //     transports = HashMap.remove(transports, transport.sessionId);
            //   }).pipe(Effect.provide(Logger.pretty), Effect.runFork),
            // );

            transports = HashMap.set(
              transports,
              transport.sessionId,
              transport,
            );

            return transport;
          }),
        getTransport: (sessionId: string) =>
          Effect.gen(function* () {
            return yield* HashMap.get(transports, sessionId).pipe(
              Match.value,
              Match.when(Option.isSome, (transport) =>
                Effect.succeed(transport.value),
              ),
              Match.orElse(() =>
                Effect.fail(
                  new TransportError({ message: "Transport not found" }),
                ),
              ),
            );
          }),
      };
    }),
  },
) {}
