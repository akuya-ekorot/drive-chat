import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Layer from "effect/Layer";
import * as Config from "effect/Config";
import { createClient } from "redis";

export class RedisError extends Schema.TaggedError<RedisError>()("RedisError", {
  message: Schema.String,
}) {}

export class RedisService extends Effect.Service<RedisService>()(
  "RedisService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const redisUrl = yield* Config.string("REDIS_URL");

      const redisClient = createClient({ url: redisUrl });
      const redisPublisher = createClient({ url: redisUrl });

      redisClient.on("error", (err) => {
        console.error(`Redis client error: ${err}`);
      });

      redisPublisher.on("error", (err) => {
        console.error(`Redis publisher error: ${err}`);
      });

      yield* Effect.tryPromise({
        try: () =>
          Promise.all([redisClient.connect(), redisPublisher.connect()]),
        catch: (error) =>
          new RedisError({ message: `Failed to connect to Redis: ${error}` }),
      });

      return {
        subscribe: (channel: string, callback: (message: string) => void) =>
          Effect.tryPromise({
            try: () => redisClient.subscribe(channel, callback),
            catch: (error) =>
              new RedisError({
                message: `Failed to subscribe to ${channel}: ${error}`,
              }),
          }),

        unsubscribe: (channel: string, callback?: (message: string) => void) =>
          Effect.tryPromise({
            try: () => redisClient.unsubscribe(channel, callback),
            catch: (error) =>
              new RedisError({
                message: `Failed to unsubscribe from ${channel}: ${error}`,
              }),
          }),

        publish: (channel: string, message: string) =>
          Effect.tryPromise({
            try: () => redisPublisher.publish(channel, message),
            catch: (error) =>
              new RedisError({
                message: `Failed to publish to ${channel}: ${error}`,
              }),
          }),

        disconnect: () =>
          Effect.tryPromise({
            try: () => Promise.all([redisClient.quit(), redisPublisher.quit()]),
            catch: (error) =>
              new RedisError({
                message: `Failed to disconnect Redis: ${error}`,
              }),
          }),
      };
    }),
  },
) {}

export const RedisServiceLive = Layer.effect(RedisService, RedisService);
