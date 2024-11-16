CREATE TABLE IF NOT EXISTS "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"real_name" varchar(255),
	"card_code" varchar(255) NOT NULL,
	"type_code" varchar(255) NOT NULL,
	"type_name" varchar(255) NOT NULL,
	"faction_code" varchar(255) NOT NULL,
	"faction_name" varchar(255) NOT NULL,
	"encounter_position" integer,
	"position" integer,
	"text" text,
	"flavor" text,
	"traits" text[],
	"url" text NOT NULL,
	"imagesrc" text,
	"backimagesrc" text,
	"back_flavor" text,
	"raw_data" json NOT NULL,
	"encounter_code" varchar(255),
	"pack_code" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"quantity" integer,
	CONSTRAINT "cards_card_code_unique" UNIQUE("card_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encounter_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"encounter_name" varchar(255) NOT NULL,
	"encounter_code" varchar(255) NOT NULL,
	"pack_code" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "encounter_sets_encounter_code_unique" UNIQUE("encounter_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encounter_sets_to_scenarios" (
	"encounter_code" varchar(255) NOT NULL,
	"scenario_code" varchar(255) NOT NULL,
	CONSTRAINT "encounter_sets_to_scenarios_encounter_code_scenario_code_pk" PRIMARY KEY("encounter_code","scenario_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pack_code" varchar(255) NOT NULL,
	"pack_name" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packs_pack_code_unique" UNIQUE("pack_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"scenario_code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"pack_code" varchar(255),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scenarios_scenario_code_unique" UNIQUE("scenario_code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_encounter_code_encounter_sets_encounter_code_fk" FOREIGN KEY ("encounter_code") REFERENCES "public"."encounter_sets"("encounter_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets" ADD CONSTRAINT "encounter_sets_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets_to_scenarios" ADD CONSTRAINT "encounter_sets_to_scenarios_encounter_code_encounter_sets_encounter_code_fk" FOREIGN KEY ("encounter_code") REFERENCES "public"."encounter_sets"("encounter_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encounter_sets_to_scenarios" ADD CONSTRAINT "encounter_sets_to_scenarios_scenario_code_scenarios_scenario_code_fk" FOREIGN KEY ("scenario_code") REFERENCES "public"."scenarios"("scenario_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_pack_code_packs_pack_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("pack_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
