DROP TABLE IF EXISTS Customers;

CREATE TABLE IF NOT EXISTS clippings (
    uuid UUID PRIMARY KEY,
    domain VARCHAR(256),
    path VARCHAR(256),
    text TEXT
);CREATE INDEX idx_domain ON clippings (domain);
CREATE INDEX idx_domain_path ON clippings (domain, path);
