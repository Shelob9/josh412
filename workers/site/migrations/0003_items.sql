-- CreateTable
CREATE TABLE IF NOT EXISTS  "Clipping" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "path" TEXT,
    "text" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Classification" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "parent_uuid" TEXT
);

-- CreateTable
DROP TABLE IF EXISTS "Item";
CREATE TABLE "Item" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "remoteReplyToId" TEXT,
    "remoteReplyToAuthorId" TEXT,
    "remoteAuthorId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RemoteAuthor" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Clipping_domain_idx" ON "Clipping"("domain");

-- CreateIndex
CREATE INDEX "Classification_item_type_idx" ON "Classification"("item_type");

-- CreateIndex
CREATE INDEX "Item_remoteAuthorId_idx" ON "Item"("remoteAuthorId");

-- CreateIndex
CREATE INDEX "Item_remoteReplyToAuthorId_idx" ON "Item"("remoteReplyToAuthorId");

-- CreateIndex
CREATE INDEX "Item_remoteAuthorId_remoteReplyToAuthorId_idx" ON "Item"("remoteAuthorId", "remoteReplyToAuthorId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_source_remoteId_key" ON "Item"("source", "remoteId");
