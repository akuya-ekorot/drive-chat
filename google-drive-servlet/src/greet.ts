import { Effect, flow, Match, Schema } from "effect";
import { ContentType } from "./pdk";

export const handleGreet = flow(
  Match.when(
    {
      params: {
        name: "greet",
        arguments: {
          name: Schema.is(Schema.String),
        },
      },
    },
    ({
      params: {
        arguments: { name },
      },
    }) =>
      Effect.succeed({
        content: [
          {
            type: ContentType.Text,
            text: `Hello ${name}`,
          },
        ],
      }),
  ),
);
