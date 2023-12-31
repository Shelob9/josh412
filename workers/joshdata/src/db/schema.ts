import { blob, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { CLASSIFICATION_ITEM_TYPES, CLASSIFICATION_SOURCE_TYPES } from 'src/classify';


// classifications by taxonomy and tag
export const TABLE_classifications = sqliteTable('classifications', {
  //The classification's unique ID, which is defined in code
    slug: text( 'slug' ).notNull(),
    //What content type is this classification for? in ['socialpost']
    itemtype: text('termid',{
      //@ts-ignore
      enum: CLASSIFICATION_ITEM_TYPES
    }).notNull(),
    //What is unique ID of the content item?
    itemid: text('itemid').notNull(),
    //Optional, subtype of the item
    subtype: text('subtype', {
      //@ts-ignore
      enum: CLASSIFICATION_SOURCE_TYPES
    }),
    // created at in ms
    // https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/sqlite-core/README.md#column-types
    created: integer('created', { mode:'timestamp_ms'  }).notNull(),
   // updated at in ms
    updated: integer('updated', { mode:'timestamp_ms'  }).notNull(),
}, (table) => {
  return {
    unique: uniqueIndex("classifications_unique_idx").on(
      table.slug,
      table.itemtype,
      table.itemid,
    ),
    slug: index("classifications_slug_idx").on(table.slug),
    itemtype: index("classifications_itemtype_idx").on(table.itemtype),
    itemid: index("classifications_itemid_idx").on(table.itemid),
    itemtype_itemid: index( 'classifications_itemtype_itemid_idx' ).on(
      table.itemtype,
      table.itemid
    ),
    itemtype_subtype: index( 'classifications_itemtype_subtype_idx' ).on(
      table.itemtype,
      table.subtype
    ),
    itemtype_subtype_itemid: index( 'classifications_itemtype_subtype_itemid_idx' ).on(
      table.itemtype,
      table.subtype,
      table.itemid
    ),
  };
});

export type SELECT_CLASSIFICATIONS = typeof TABLE_classifications.$inferSelect;
export type SAVED_CLASSIFICATION = typeof TABLE_classifications.$inferInsert;
export type INSERT_CLASSIFICATION = Omit<SAVED_CLASSIFICATION, 'created' | 'updated'>;


// links to external urls
export const TABLE_links = sqliteTable('links', {
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

export type SELECT_LINKS = typeof TABLE_links.$inferSelect;
export type INSERT_LINK = typeof TABLE_links.$inferInsert;

// media
export const TABLE_media = sqliteTable('media', {
    id: integer('id').notNull().primaryKey(),
    url: text('url').notNull(),
    cdnurl: text('cdnurl'),
    processversion: integer('processversion'),
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
    url: index("media_url_idx").on(table.url),
		source: index("media_source_idx").on(
			table.source,
			table.sourceid
		),
  };
});

export type SELECT_IMAGES = typeof TABLE_media.$inferSelect;
export type INSERT_IMAGE = typeof TABLE_media.$inferInsert;
