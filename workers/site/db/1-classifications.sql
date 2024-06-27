
CREATE TABLE IF NOT EXISTS classifications {
    uuid UUID PRIMARY KEY NOT NULL,
    source UUID,
    classification VARCHAR(256)
};
CREATE INDEX idx_source ON classifications (source);
CREATE INDEX idx_classification ON classifications (classification);
CREATE INDEX idx_source_classification ON classifications (source, classification);
