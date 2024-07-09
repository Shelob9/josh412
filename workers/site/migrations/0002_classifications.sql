-- CreateTable
CREATE TABLE "Classification" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "parent_uuid" TEXT
);
