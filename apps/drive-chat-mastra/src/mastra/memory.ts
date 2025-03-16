import { Memory } from "@mastra/memory";
import { PostgresStore } from "@mastra/pg"

const storage = new PostgresStore({ connectionString: process.env.DB_URL! });

export const memory = new Memory({
  storage,
  options: {
    semanticRecall: false
  }
});
