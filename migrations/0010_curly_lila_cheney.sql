ALTER TABLE "campaigns" RENAME COLUMN "id" TO "campaign_id";--> statement-breakpoint
ALTER TABLE "campaigns" RENAME COLUMN "name" TO "campaign_name";--> statement-breakpoint
ALTER TABLE "encounter_sets" RENAME COLUMN "id" TO "encounter_id";--> statement-breakpoint
ALTER TABLE "packs" RENAME COLUMN "id" TO "pack_id";--> statement-breakpoint
ALTER TABLE "scenarios" RENAME COLUMN "id" TO "scenario_id";--> statement-breakpoint
ALTER TABLE "scenarios" RENAME COLUMN "name" TO "scenario_name";--> statement-breakpoint
DROP INDEX IF EXISTS "campaign_name_search_index";--> statement-breakpoint
DROP INDEX IF EXISTS "encounter_name_search_index";--> statement-breakpoint
DROP INDEX IF EXISTS "pack_name_search_index";--> statement-breakpoint
DROP INDEX IF EXISTS "scenario_name_search_index";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("campaigns"."campaign_name", '')), 'A')
        )) STORED;--> statement-breakpoint
ALTER TABLE "encounter_sets" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("encounter_sets"."encounter_name", '')), 'A')
        )) STORED;--> statement-breakpoint
ALTER TABLE "packs" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("packs"."pack_name", '')), 'A')
        )) STORED;--> statement-breakpoint
ALTER TABLE "scenarios" ADD COLUMN "fullTextSearch" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("scenarios"."scenario_name", '')), 'A')
        )) STORED;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_search" ON "campaigns" USING gin ("fullTextSearch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_encounter_set_search" ON "encounter_sets" USING gin (to_tsvector('english', "encounter_name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pack_search" ON "packs" USING gin ("fullTextSearch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scenario_search" ON "scenarios" USING gin ("fullTextSearch");