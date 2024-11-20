ALTER TABLE "cards" RENAME COLUMN "id" TO "card_id";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "name" TO "card_name";--> statement-breakpoint
ALTER TABLE "cards" drop column "fullTextSearch";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("cards"."card_name", '')), 'A') || 
        setweight(to_tsvector('english', coalesce("cards"."real_name", '')), 'A') ||
        setweight(to_tsvector('english', coalesce("cards"."text", '')), 'C') ||
        setweight(to_tsvector('english', coalesce("cards"."back_text", '')), 'C') ||
        setweight(to_tsvector('english', coalesce("cards"."traits_text", '')), 'B') ||
        setweight(to_tsvector('english', coalesce("cards"."flavor", '')), 'D') ||
        setweight(to_tsvector('english', coalesce("cards"."back_flavor", '')), 'D')
        )) STORED;