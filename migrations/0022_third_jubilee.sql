DROP VIEW "public"."search_view";--> statement-breakpoint
CREATE VIEW "public"."search_view" AS ((((((select text 'card' as "type", "card_id" as "id", "card_code" as "code", "card_name" as "name", "image_url" as "imageUrl", "full_text_search" as "full_text_search" from "cards") union all (select distinct on ("packs"."pack_id") text 'pack' as "type", "packs"."pack_id", "packs"."pack_code", "packs"."pack_name", "cards"."image_url", "packs"."full_text_search" from "packs" left join "cards" on ("packs"."pack_code" = "cards"."pack_code" and "cards"."type_code" = 'scenario'))) union all (select distinct on ("campaigns"."campaign_id") text 'campaign' as "type", "campaigns"."campaign_id", "campaigns"."campaign_code", "campaigns"."campaign_name", "cards"."image_url", "campaigns"."full_text_search" from "campaigns" left join "scenarios" on "campaigns"."campaign_code" = "scenarios"."campaign_code" left join "encounter_sets_to_scenarios" on "scenarios"."scenario_code" = "encounter_sets_to_scenarios"."scenario_code" left join "encounter_sets" on "encounter_sets_to_scenarios"."encounter_code" = "encounter_sets"."encounter_code" left join "cards" on ("encounter_sets"."encounter_code" = "cards"."encounter_code" and "cards"."type_code" = 'scenario'))) union all (select distinct on ("scenarios"."scenario_id") text 'scenario' as "type", "scenarios"."scenario_id", "scenarios"."scenario_code", "scenarios"."scenario_name", "cards"."image_url", "scenarios"."full_text_search" from "scenarios" left join "encounter_sets_to_scenarios" on "scenarios"."scenario_code" = "encounter_sets_to_scenarios"."scenario_code" left join "encounter_sets" on "encounter_sets_to_scenarios"."encounter_code" = "encounter_sets"."encounter_code" left join "cards" on ("encounter_sets"."encounter_code" = "cards"."encounter_code" and "cards"."type_code" = 'scenario'))) union all (select distinct on ("encounter_sets"."encounter_id") text 'encounter' as "type", "encounter_sets"."encounter_id", "encounter_sets"."encounter_code", "encounter_sets"."encounter_name", "cards"."image_url", "encounter_sets"."full_text_search" from "encounter_sets" left join "cards" on "encounter_sets"."encounter_code" = "cards"."encounter_code")) union all (select distinct on ("traits"."trait_name") text 'trait' as "type", "traits"."trait_id", "traits"."trait_name", "traits"."trait_name", "cards"."image_url", "traits"."full_text_search" from "traits" left join "traits_to_cards" on "traits"."trait_name" = "traits_to_cards"."trait_name" left join "cards" on "traits_to_cards"."card_code" = "cards"."card_code" order by "traits"."trait_name" asc, "cards"."card_code" asc));