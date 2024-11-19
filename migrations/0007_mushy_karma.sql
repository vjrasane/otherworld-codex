ALTER TABLE "cards" drop column "content_search";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "content_search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "cards"."text" || "cards"."back_text"), 'C')) STORED;--> statement-breakpoint
ALTER TABLE "cards" drop column "traits_search";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "traits_search" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', "cards"."traits_text"), 'B')) STORED;