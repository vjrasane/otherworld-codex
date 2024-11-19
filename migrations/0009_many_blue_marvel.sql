DROP INDEX IF EXISTS "idx_card_search";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("cards"."name", '')), 'A') || 
        setweight(to_tsvector('english', coalesce("cards"."real_name", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("cards"."text", '')), 'C') ||
        setweight(to_tsvector('english', coalesce("cards"."back_text", '')), 'C') ||
        setweight(to_tsvector('english', coalesce("cards"."traits_text", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("cards"."flavor", '')), 'D') ||
        setweight(to_tsvector('english', coalesce("cards"."back_flavor", '')), 'D')
        )) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_card_search" ON "cards" USING gin ("fullTextSearch");--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN IF EXISTS "name_search";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN IF EXISTS "content_search";--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN IF EXISTS "traits_search";