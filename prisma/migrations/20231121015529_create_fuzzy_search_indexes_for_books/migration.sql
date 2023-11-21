CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS trgm_title_author_idx ON books USING gin ((title || ' ' || author_name || ' ' || original_title) gin_trgm_ops);