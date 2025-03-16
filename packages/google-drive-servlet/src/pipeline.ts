import { Effect, Match, pipe } from "effect";
import { CallToolRequest, ContentType } from "./pdk";
import {
  handleExportFile,
  handleGetFile,
  handleListFile,
} from "./google-drive/flows";

export const pipeline = (input: CallToolRequest) =>
  pipe(
    input,
    Match.value,
    handleListFile,
    handleGetFile,
    handleExportFile,
    Match.orElse((response) =>
      Effect.succeed({
        content: [
          {
            type: ContentType.Text,
            isError: true,
            text: `${response.params.name} method not found.`,
          },
        ],
      }),
    ),
  );
