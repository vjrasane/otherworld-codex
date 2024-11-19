ALTER TABLE "cards" ADD COLUMN "traits_text" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "campaign_name_search_index" ON "campaigns" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "card_search_index" ON "cards" USING gin ((
   setweight(to_tsvector('english', "name"), 'A') || 
   setweight(to_tsvector('english', "real_name"), 'A') || 
   setweight(to_tsvector('english', "text"), 'B') || 
   setweight(to_tsvector('english', "traits_text"), 'C') || 
   setweight(to_tsvector('english', "back_flavor"), 'D') ||
   setweight(to_tsvector('english', "flavor"), 'D') 
    ));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "encounter_name_search_index" ON "encounter_sets" USING gin (to_tsvector('english', "encounter_name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pack_name_search_index" ON "packs" USING gin (to_tsvector('english', "pack_name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scenario_name_search_index" ON "scenarios" USING gin (to_tsvector('english', "name"));