-- CreateTable
DROP TABLE IF EXISTS "Clipping";
CREATE TABLE "Clipping" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "path" TEXT,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
DROP TABLE IF EXISTS "Classification";
CREATE TABLE "Classification" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "parent_uuid" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "remoteAuthorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
DROP TABLE IF EXISTS "RemoteAuthor";
CREATE TABLE "RemoteAuthor" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
DROP INDEX IF EXISTS "Clipping_domain_idx";
CREATE INDEX "Clipping_domain_idx" ON "Clipping"("domain");

-- CreateIndex
DROP INDEX IF EXISTS "Classification_item_idx";
CREATE INDEX "Classification_item_type_idx" ON "Classification"("item_type");

-- CreateIndex
DROP INDEX IF EXISTS "Classification_item_item_type_idx";
CREATE UNIQUE INDEX "Classification_item_item_type_key" ON "Classification"("item", "item_type");

-- CreateIndex
DROP INDEX IF EXISTS "Item_remoteAuthorId_idx";
CREATE INDEX "Item_remoteAuthorId_idx" ON "Item"("remoteAuthorId");

-- CreateIndex
DROP INDEX IF EXISTS "Item_remoteReplyToAuthorId_idx";
CREATE INDEX "Item_remoteReplyToAuthorId_idx" ON "Item"("remoteReplyToAuthorId");

-- CreateIndex
DROP INDEX IF EXISTS "Item_remoteAuthorId_remoteReplyToAuthorId_idx";
CREATE INDEX "Item_remoteAuthorId_remoteReplyToAuthorId_idx" ON "Item"("remoteAuthorId", "remoteReplyToAuthorId");

-- CreateIndex
DROP INDEX IF EXISTS "Item_source_remoteId_idx";
CREATE UNIQUE INDEX "Item_source_remoteId_key" ON "Item"("source", "remoteId");
