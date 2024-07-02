
CREATE TABLE IF NOT EXISTS items (
    uuid UUID PRIMARY KEY NOT NULL,
    item_type VARCHAR(64) NOT NULL,
    content LONGTEXT,
    remote_id VARCHAR(256) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_item_type ON items (item_type);
CREATE INDEX IF NOT EXISTS idx_remote_id ON items (remote_id);
CREATE INDEX IF NOT EXISTS idx_item_type_remote_id ON items (item_type, remote_id);
