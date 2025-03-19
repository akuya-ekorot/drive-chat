import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { createServer } from "node:http";
import { DriveError, McpTaggedError } from "./Errors";
import { McpRepository } from "./McpRepository";
import * as HttpApi from "@effect/platform/HttpApi";
import { McpServerService } from "./McpServerService";
import { GoogleDriveService } from "./GoogleDriveService";
import { McpTransportService, TransportError } from "./McpTransportService";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import {
  AuthenticationMiddleware,
  AuthenticationMiddlewareLive,
} from "./AuthenticationService";
import { RedisError, RedisService } from "./RedisService";
import { Effect } from "effect";

// Endpoints
const SseEndpoint = HttpApiEndpoint.get("sse")`/sse`
  .addError(McpTaggedError)
  .addError(DriveError)
  .addError(RedisError)
  .addSuccess(Schema.Void);

const HandleMessageUrlParams = Schema.Struct({ sessionId: Schema.String });
export type HandleMessageUrlParams = typeof HandleMessageUrlParams.Type;

const MessagesEndpoint = HttpApiEndpoint.post("messages")`/messages`
  .addError(TransportError)
  .addError(McpTaggedError)
  .addError(RedisError)
  .setUrlParams(HandleMessageUrlParams)
  .addSuccess(Schema.Void);

// Group
const McpGroup = HttpApiGroup.make("McpGroup")
  .add(SseEndpoint)
  .add(MessagesEndpoint)
  .middleware(AuthenticationMiddleware);

// Api
const McpApi = HttpApi.make("McpApi").add(McpGroup);

// Live Groups and endpoint handlers
const McpGroupLive = HttpApiBuilder.group(McpApi, "McpGroup", (handlers) =>
  handlers
    .handle("sse", McpRepository.handleSse)
    .handle("messages", McpRepository.handleMessages),
).pipe(
  Layer.provide(AuthenticationMiddlewareLive),
  Layer.provide(McpRepository.Default),
  Layer.provide(McpTransportService.Default),
  Layer.provide(McpServerService.Default),
  Layer.provide(GoogleDriveService.Default),
  Layer.provide(RedisService.Default),
);

// Live Api
const McpApiLive = HttpApiBuilder.api(McpApi).pipe(Layer.provide(McpGroupLive));

// Live Server
export const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(McpApiLive),
  Layer.tap(() => Effect.log("Server started")),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8080 })),
);
