import { sqliteTable, text, integer,primaryKey,uniqueIndex } from 'drizzle-orm/sqlite-core';

export const classifications = sqliteTable('classifications', {
    txid: integer('txid').notNull(),
    termid: integer('termid').notNull(),
    itemid: text('itemid').notNull(),
  }, (table) => {
    return {
        pk: primaryKey(
            table.txid,
            table.termid,
            table.itemid,
        ),
    }
});

export const sociallinks = sqliteTable('sociallinks', {
    id: integer('id').notNull().primaryKey(),
    remoteid: text('remoteid').notNull(),
    url: text('url').notNull(),
    network: text('network').notNull(),
    authorid: text('author').notNull(),
    replytoid: text('replytoid'),
    parentid: text('parentid'),
});

export const mediaitems = sqliteTable('mediaitems', {
    id: integer('id').notNull().primaryKey(),
    remoteid: text('remoteid').notNull(),
    network: text('network').notNull(),
    url: text('url').notNull(),
    mimetype: text('format').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    itemid: text('itemid').notNull(),
});






export type SELECT_CLASSIFICATION = typeof classifications.$inferSelect;
export type INSERT_CLASSIFICATION = typeof classifications.$inferInsert;
