-- CreateTable
DROP TABLE IF EXISTS "Clipping";
CREATE TABLE "Clipping" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "path" TEXT,
    "text" TEXT NOT NULL
);

-- CreateTable
DROP TABLE IF EXISTS "Classification";
CREATE TABLE "Classification" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "parent_uuid" TEXT
);

-- CreateTable
DROP TABLE IF EXISTS "Source";
CREATE TABLE "Source" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
DROP TABLE IF EXISTS "RemoteAuthor";
CREATE TABLE "RemoteAuthor" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "remoteHandle" TEXT NOT NULL,
    "remoteDisplayName" TEXT,
    CONSTRAINT "RemoteAuthor_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
DROP TABLE IF EXISTS "Item";
CREATE TABLE "Item" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "remoteId" TEXT NOT NULL,
    "remoteReplyToId" TEXT,
    "remoteAuthorId" TEXT NOT NULL,
    CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_remoteAuthorId_fkey" FOREIGN KEY ("remoteAuthorId") REFERENCES "RemoteAuthor" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Clipping_domain_idx" ON "Clipping"("domain");

-- CreateIndex
CREATE INDEX "Classification_item_type_idx" ON "Classification"("item_type");
-- CreateIndex
CREATE UNIQUE INDEX "RemoteAuthor_sourceId_remoteId_key" ON "RemoteAuthor"("sourceId", "remoteId");

-- CreateIndex
CREATE INDEX "Item_remoteAuthorId_idx" ON "Item"("remoteAuthorId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_sourceId_remoteId_key" ON "Item"("sourceId", "remoteId");
