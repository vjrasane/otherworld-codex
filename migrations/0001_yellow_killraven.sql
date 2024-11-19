CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_code" varchar(255) NOT NULL,
	"pack_code" varchar(255),
	"name" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_campaign_code_unique" UNIQUE("campaign_code")
);
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_encounter_code_encounter_sets_encounter_code_fk";
--> statement-breakpoint
ALTER TABLE "cards" DROP CONSTRAINT "cards_pack_code_packs_pack_code_fk";
--> statement-breakpoint
ALTER TABLE "encounter_sets" DROP CONSTRAINT "encounter_sets_pack_code_packs_pack_code_fk";
--> statement-breakpoint
ALTER TABLE "encounter_sets_to_scenarios" DROP CONSTRAINT "encounter_sets_to_scenarios_encounter_code_encounter_sets_encounter_code_fk";
--> statement-breakpoint
ALTER TABLE "encounter_sets_to_scenarios" DROP CONSTRAINT "encounter_sets_to_scenarios_scenario_code_scenarios_scenario_code_fk";
--> statement-breakpoint
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_pack_code_packs_pack_code_fk";
--> statement-breakpoint
ALTER TABLE "scenarios" ADD COLUMN "campaign_code" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_encounter_code_encounter_sets_encounter_code_fk" FOREIGN KEY ("encounter_code") REFERENCES "public"."encounter_sets"("encounter_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets" ADD CONSTRAINT "encounter_sets_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets_to_scenarios" ADD CONSTRAINT "encounter_sets_to_scenarios_encounter_code_encounter_sets_encounter_code_fk" FOREIGN KEY ("encounter_code") REFERENCES "public"."encounter_sets"("encounter_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets_to_scenarios" ADD CONSTRAINT "encounter_sets_to_scenarios_scenario_code_scenarios_scenario_code_fk" FOREIGN KEY ("scenario_code") REFERENCES "public"."scenarios"("scenario_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_campaign_code_campaigns_campaign_code_fk" FOREIGN KEY ("campaign_code") REFERENCES "public"."campaigns"("campaign_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
