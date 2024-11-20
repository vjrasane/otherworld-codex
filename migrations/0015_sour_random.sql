DROP VIEW "public"."search_view";--> statement-breakpoint
ALTER TABLE "campaigns" RENAME COLUMN "fullTextSearch" TO "full_text_search";--> statement-breakpoint
ALTER TABLE "packs" RENAME COLUMN "fullTextSearch" TO "full_text_search";--> statement-breakpoint
ALTER TABLE "scenarios" RENAME COLUMN "fullTextSearch" TO "full_text_search";--> statement-breakpoint
ALTER TABLE "encounter_sets" RENAME COLUMN "fullTextSearch" TO "full_text_search";--> statement-breakpoint
ALTER TABLE "cards" RENAME COLUMN "fullTextSearch" TO "full_text_search";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_campaign_search";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_pack_search";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_scenario_search";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_card_search";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_campaign_search" ON "campaigns" USING gin ("full_text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pack_search" ON "packs" USING gin ("full_text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_scenario_search" ON "scenarios" USING gin ("full_text_search");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_card_search" ON "cards" USING gin ("full_text_search");--> statement-breakpoint
CREATE VIEW "public"."search_view" AS (((((select text 'card' as "type", "card_id" as "id", "card_code" as "code", "card_name" as "name", "full_text_search" as "full_text_search" from "cards") union all (select text 'pack' as "type", "pack_id", "pack_code", "pack_name", "full_text_search" from "packs")) union all (select text 'campaign' as "type", "campaign_id", "campaign_code", "campaign_name", "full_text_search" from "campaigns")) union all (select text 'scenario' as "type", "scenario_id", "scenario_code", "scenario_name", "full_text_search" from "scenarios")) union all (select text 'encounter_set' as "type", "encounter_id", "encounter_code", "encounter_name", "full_text_search" from "encounter_sets"));