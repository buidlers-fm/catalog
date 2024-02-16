ALTER TABLE "books" DROP COLUMN "title_author_search";
ALTER TABLE "books" ADD COLUMN "title_author_search" tsvector DEFAULT ''::tsvector;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

CREATE OR REPLACE FUNCTION update_books_title_author_search() RETURNS trigger AS $$
BEGIN
  NEW.title_author_search := to_tsvector('english', 
    COALESCE(NEW.title, '') 
    || ' ' || COALESCE(NEW.original_title, '')
    || ' ' || COALESCE(NEW.author_name, '')
  );
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS "update_books_title_author_search" ON "books";
CREATE TRIGGER "update_books_title_author_search"
  BEFORE INSERT OR UPDATE ON "books"
  FOR EACH ROW
  EXECUTE FUNCTION update_books_title_author_search();