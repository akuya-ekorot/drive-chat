import { Match, pipe } from "effect";
import { CallToolRequest } from "./pdk";
import { handleGreet } from "./greet";
import { handleSearchFiles } from "./google-drive/flows";

export const pipeline = (input: CallToolRequest) =>
  pipe(input, Match.value, handleGreet, handleSearchFiles, Match.orElseAbsurd);
