import { Memory } from "@mastra/memory";
import { PgVector, PostgresStore } from "@mastra/pg";

export const memory = new Memory({
  storage: new PostgresStore({ connectionString: process.env.DB_URL! }),
  vector: new PgVector(process.env.DB_URL!),
  options: {
    semanticRecall: false,
  },
});
