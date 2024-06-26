DROP TABLE IF EXISTS Customers;

CREATE TABLE IF NOT EXISTS clippings (
    uuid UUID PRIMARY KEY NOT NULL,
    domain VARCHAR(256),
    path VARCHAR(256),
    text TEXT
);
CREATE INDEX idx_domain ON clippings (domain);
CREATE INDEX idx_domain_path ON clippings (domain, path);

CREATE TABLE IF NOT EXISTS classifications {
    uuid UUID PRIMARY KEY NOT NULL,
    source UUID,
    classification VARCHAR(256)
};
CREATE INDEX idx_source ON classifications (source);
CREATE INDEX idx_classification ON classifications (classification);
CREATE INDEX idx_source_classification ON classifications (source, classification);
