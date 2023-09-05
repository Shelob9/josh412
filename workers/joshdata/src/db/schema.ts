import { sqliteTable, integer,index, text,blob, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Custom column type for big integer columns
 * @see https://orm.drizzle.team/docs/column-types/sqlite#bigint
 * @param column Column name
 * @returns
 */
const bigInt = (column: string) =>  blob(column, { mode: 'bigint' });
/**
 * Custom column type for boolean columns
 * @see https://orm.drizzle.team/docs/column-types/sqlite#boolean
 * @param column Column name
 * @returns
 */
const boolean = (column: string) => integer(column, { mode: 'boolean' });
// classifications by taxonomy and tag
export const classifications = sqliteTable('classifications', {
    txid: blob('txid', { mode: 'bigint' }).notNull(),
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

// taxonomies
export const taxonomies = sqliteTable('taxonomies', {
  txid: blob('txid', { mode: 'bigint' }).primaryKey(),
  slug: text('slug'),
  label: text('label'),
  private: boolean('private')
}, (table) => {
  return {
    slugIndex: uniqueIndex('slug_idx').on(table.slug),
    labelIndex: uniqueIndex('label_idx').on(table.label),
  }
});
// Type for select queries
export type SelectTaxonomy = typeof taxonomies.$inferSelect;

// Type for insert queries
export type NewTaxonomy = typeof taxonomies.$inferInsert;

// taxonomy terms
export const terms = sqliteTable('terms', {
  termid: blob('termid', { mode: 'bigint' }).primaryKey(),
  slug: text('slug'),
  label: text('label'),
  private: blob('private', { mode: 'bigint' }),//boolean('private')
}, (table) => {
  return {
    slugIndex: uniqueIndex('terms_slug_idx').on(table.slug),
    labelIndex: uniqueIndex('terms_label_idx').on(table.label),
  }
});

// Type for select queries
export type Term = typeof terms.$inferSelect;

// Type for insert queries
export type NewTerm = typeof terms.$inferInsert;

// links to external urls
export const links = sqliteTable('links', {
    id: integer('id').notNull().primaryKey(),
	  url: text('url').notNull(),
	  source: text('source'),
	  sourceid: text('sourceid'),
}, (table) => {
  return {
    url: index("links_url_idx").on(table.url),
		source: index("links_source_idx").on(
			table.source,
			table.sourceid
		),
  };
});

export type SELECT_LINKS = typeof links.$inferSelect;
export type INSERT_LINK = typeof links.$inferInsert;

// images
export const images = sqliteTable('images', {
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
    url: index("images_url_idx").on(table.url),
		source: index("images_source_idx").on(
			table.source,
			table.sourceid
		),
  };
});

export type SELECT_IMAGES = typeof images.$inferSelect;
export type INSERT_IMAGE = typeof images.$inferInsert;
