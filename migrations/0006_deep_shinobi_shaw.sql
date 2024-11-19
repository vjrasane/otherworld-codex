DROP INDEX IF EXISTS "idx_card_search";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_card_search" ON "cards" USING gin (("name_search" || "content_search"));