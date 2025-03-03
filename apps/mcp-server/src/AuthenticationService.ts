import { Context, Layer, Schema } from "effect";
import * as Effect from "effect/Effect";
import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform";
import { TokenError } from "./Errors";

class AccessToken extends Schema.Class<AccessToken>("AccessToken")({
  token: Schema.String.pipe(Schema.Redacted),
}) {}

export class CurrentAccessToken extends Context.Tag("CurrentAccessToken")<
  CurrentAccessToken,
  AccessToken
>() {}

export class AuthenticationMiddleware extends HttpApiMiddleware.Tag<AuthenticationMiddleware>()(
  "Http/Authentication",
  {
    failure: TokenError,
    provides: CurrentAccessToken,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    return {
      bearer: (token) =>
        Effect.gen(function* () {
          return new AccessToken({ token });
        }),
    };
  }),
);
