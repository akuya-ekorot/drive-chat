import { Match, pipe } from "effect";
import { CallToolRequest } from "./pdk";
import { handleSearchFiles } from "./google-drive/flows";

export const pipeline = (input: CallToolRequest) =>
  pipe(input, Match.value, handleSearchFiles, Match.orElseAbsurd);
