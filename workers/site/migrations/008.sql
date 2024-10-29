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
DROP TABLE IF EXISTS "Media";
CREATE TABLE "Media" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "remoteId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "itemType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "previewUrl" TEXT,
    "key" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
DROP TABLE IF EXISTS "Link";
CREATE TABLE "Link" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
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
CREATE INDEX "Clipping_domain_idx" ON "Clipping"("domain");

-- CreateIndex
CREATE INDEX "Classification_item_type_idx" ON "Classification"("item_type");

-- CreateIndex
CREATE UNIQUE INDEX "Classification_item_item_type_key" ON "Classification"("item", "item_type");

-- CreateIndex
CREATE INDEX "Media_itemType_idx" ON "Media"("itemType");

-- CreateIndex
CREATE UNIQUE INDEX "Media_item_itemType_key" ON "Media"("item", "itemType");

-- CreateIndex
CREATE INDEX "Link_itemType_idx" ON "Link"("itemType");

-- CreateIndex
CREATE UNIQUE INDEX "Link_item_itemType_key" ON "Link"("item", "itemType");

-- CreateIndex
CREATE INDEX "Item_remoteAuthorId_idx" ON "Item"("remoteAuthorId");

-- CreateIndex
CREATE INDEX "Item_remoteReplyToAuthorId_idx" ON "Item"("remoteReplyToAuthorId");

-- CreateIndex
CREATE INDEX "Item_remoteAuthorId_remoteReplyToAuthorId_idx" ON "Item"("remoteAuthorId", "remoteReplyToAuthorId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_source_remoteId_key" ON "Item"("source", "remoteId");
