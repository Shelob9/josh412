import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { TABLE_classifications } from './schema';
const sqlite = new Database('local.db');
const db: BetterSQLite3Database = drizzle(sqlite);
