import { sqliteTable, text, integer,primaryKey,uniqueIndex } from 'drizzle-orm/sqlite-core';

export const classifications = sqliteTable('classifications', {
    txid: integer('txid').notNull(),
    termid: integer('termid').notNull(),
	  source: text('source').notNull(),
	  sourceid: text('sourceid')
      .notNull(),
    
}, (table) => {
  return {
    pk: primaryKey(
			table.txid, 
			table.termid,
			table.source,
			table.sourceid,
		),
  };
});

export type SELECT_CLASSIFICATIONS = typeof classifications.$inferSelect;
export type INSERT_CLASSIFICATION = typeof classifications.$inferInsert;

export const links = sqliteTable('links', {
    id: integer('id').notNull().primaryKey(),
	  url: text('url').notNull(),
	  source: text('source'),
	  sourceid: text('sourceid'),
}, (table) => {
  return {
    url: index("url_idx").on(table.url),
		source: index("source_idx").on(
			table.source,
			table.sourceid
		),
  };
});

export type SELECT_LINKS = typeof links.$inferSelect;
export type INSERT_LINK = typeof links.$inferInsert;

export const image = sqliteTable('image', {
    id: integer('id').notNull().primaryKey(),
    url: text('url').notNull(),
	  description: text('description'),
	  source: text('source'),
	  sourceid: text('sourceid'),
    mimetype: text('format').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
	  sizes: blob('json', { mode: 'json' })
			.$type<{ 
				url: string,
				mimetype: string,
				height: number,
				width: number 
			}>()
}, (table) => {
  return {
    url: index("url_idx").on(table.url),
		source: index("source_idx").on(
			table.source,
			table.sourceid
		),
  };
});

export type SELECT_IMAGES = typeof images.$inferSelect;
export type INSERT_IMAGE = typeof images.$inferInsert;
