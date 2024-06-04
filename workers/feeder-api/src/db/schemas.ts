import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const TABLE_FEEDER_SCHEDULED_POSTS = sqliteTable('feeder_scheduled_posts', {
    id: integer("id").primaryKey({ autoIncrement: true }),
    text: text('text').notNull(),
    mediaKeys: text('mediaKeys', { mode: 'json' }).$type<string[]>(),
    savedAt: integer('savedAt', { mode:'timestamp_ms'  }).notNull(),
    sendAt: integer('sendAt', { mode:'timestamp_ms'  }).notNull(),
    hasSent: integer('hasSent', { mode:'boolean'  }).notNull(),
    postKey: text('postKey').notNull(),
    accountKey: text('accountKey').references(() => TABLE_FEEDER_ACCOUNTS.accountKey).notNull(),
}, (table) => {
    return {
        accountKeyIdx: index("accountKeyIdx_idx").on(table.accountKey),
        postKeyIndexIdx: index("postKey_idx").on(table.postKey),
        timeUnqiuqeIdx: uniqueIndex("timeUnqiuqe_idx").on(table.accountKey,table.sendAt),
      };
});

export type SELECT_FEEDER_SCHEDULED_POSTS = typeof TABLE_FEEDER_SCHEDULED_POSTS.$inferSelect;
export type INSERT_FEEDER_SCHEDULED_POST = Omit<typeof TABLE_FEEDER_SCHEDULED_POSTS.$inferInsert, "postKey" >;


export type FEEDER_ALLOWED_NETWORK =  'bluesky' |  'mastodon';
export const TABLE_FEEDER_ACCOUNTS = sqliteTable('feeder_accounts', {
    id: integer("id").primaryKey({ autoIncrement: true }),
    network: text('text', { enum: ["bluesky", "mastodon"] }).notNull(),
    instanceUrl: text('instanceUrl').notNull(),
    accountId: text('accountId').notNull(),
    accountHandle: text('accountHandle').notNull(),
    accountAvatarUrl: text('accountAvatarUrl'),
    accountKey: text('accountKey').notNull(),
}, (table) => {
    return {
        uniqueAccountKeyIndex: uniqueIndex("unique_accountKeyIdx").on(table.accountKey),
        uniqueCombos: uniqueIndex("uniqueCombos").on(table.network, table.instanceUrl,),
        accountKeyIdx: index("accountKey_idx").on(table.accountKey),
    };
});
export type SELECT_FEEDER_ACCOUNTS = typeof TABLE_FEEDER_ACCOUNTS.$inferSelect;
export type INSERT_FEEDER_ACCOUNT = Omit< typeof TABLE_FEEDER_ACCOUNTS.$inferInsert, "accountKey" >;
