import type { Config } from "drizzle-kit";


export default {
  schema: "../../../../packages/feeder/src/db/schemas.ts",
  out: "migrations",
  driver: 'better-sqlite',
  url: './db/sqlite.db',
  dbCredentials: {
    url: './db/sqlite.db', // 👈 this could also be a path to the local sqlite file
  }
} as Config;
