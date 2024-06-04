import type { Config } from "drizzle-kit";


export default {
  schema: "./src/db/schemas.ts",
  out: "./migrations",
  driver: 'better-sqlite',
  url: './src/db/sqlite.db'
} as Config;
