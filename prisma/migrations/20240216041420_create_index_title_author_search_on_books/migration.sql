-- CreateIndex
CREATE INDEX "books_title_author_search_idx" ON "books" USING GIN ("title_author_search");
