import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { classifications } from './schema';
const sqlite = new Database('local.db');
const db: BetterSQLite3Database = drizzle(sqlite);
