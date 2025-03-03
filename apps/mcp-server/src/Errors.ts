import * as Schema from "effect/Schema";

export class McpTaggedError extends Schema.TaggedError<McpTaggedError>()(
  "McpTaggedError",
  { message: Schema.String },
) {}

export class TokenError extends Schema.TaggedError<TokenError>()("TokenError", {
  message: Schema.String,
}) {}

export class DriveError extends Schema.TaggedError<DriveError>()("DriveError", {
  message: Schema.String,
}) {}
