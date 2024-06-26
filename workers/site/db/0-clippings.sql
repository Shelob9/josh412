
CREATE TABLE IF NOT EXISTS clippings (
    uuid UUID PRIMARY KEY NOT NULL,
    domain VARCHAR(256),
    path VARCHAR(256),
    text TEXT
);
CREATE INDEX IF NOT EXISTS idx_domain ON clippings (domain);
CREATE INDEX IF NOT EXISTS  idx_domain_path ON clippings (domain, path);
