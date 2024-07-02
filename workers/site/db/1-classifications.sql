DROP TABLE IF EXISTS classifications;
CREATE TABLE IF NOT EXISTS classifications (
    uuid UUID PRIMARY KEY NOT NULL,
    classification VARCHAR(64) NOT NULL,
    item_type VARCHAR(64) NOT NULL,
    item VARCHAR(256) NOT NULL,
    parent VARCHAR(256)
);
CREATE INDEX IF NOT EXISTS idx_parent ON classifications (parent);
CREATE INDEX IF NOT EXISTS idx_item ON classifications (item);
CREATE INDEX IF NOT EXISTS idx_item_type ON classifications (item_type);
