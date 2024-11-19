DROP INDEX IF EXISTS "card_search_index";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "name_search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "cards"."name"), 'A')) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_card_search" ON "cards" USING gin ("name_search");