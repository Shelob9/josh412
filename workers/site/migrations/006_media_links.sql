

-- CreateTable
DROP TABLE IF EXISTS "Media";
CREATE TABLE "Media" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
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
-- CreateIndex
DROP INDEX IF EXISTS "Media_item_idx";
CREATE INDEX "Media_itemType_idx" ON "Media"("itemType");

-- CreateIndex
DROP INDEX IF EXISTS "Media_item_itemType_idx";
CREATE UNIQUE INDEX "Media_item_itemType_key" ON "Media"("item", "itemType");


-- CreateIndex
DROP INDEX IF EXISTS "Link_item_idx";
CREATE INDEX "Link_itemType_idx" ON "Link"("itemType");

-- CreateIndex
DROP INDEX IF EXISTS "Link_item_itemType_idx";
CREATE UNIQUE INDEX "Link_item_itemType_key" ON "Link"("item", "itemType");
