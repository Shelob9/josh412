import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  driver: 'better-sqlite',
  url: './src/db/sqlite.db'
} as Config;
