CREATE TABLE IF NOT EXISTS "traits" (
	"trait_id" serial PRIMARY KEY NOT NULL,
	"trait_name" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"full_text_search" "tsvector" GENERATED ALWAYS AS ((
        setweight(to_tsvector('english', coalesce("traits"."trait_name", '')), 'A')
        )) STORED,
	CONSTRAINT "traits_trait_name_unique" UNIQUE("trait_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traits_to_cards" (
	"trait_name" varchar(255),
	"card_code" varchar,
	CONSTRAINT "traits_to_cards_trait_name_card_code_pk" PRIMARY KEY("trait_name","card_code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "traits_to_cards" ADD CONSTRAINT "traits_to_cards_trait_name_traits_trait_name_fk" FOREIGN KEY ("trait_name") REFERENCES "public"."traits"("trait_name") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "traits_to_cards" ADD CONSTRAINT "traits_to_cards_card_code_cards_card_code_fk" FOREIGN KEY ("card_code") REFERENCES "public"."cards"("card_code") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_trait_search" ON "traits" USING gin ("full_text_search");--> statement-breakpoint
ALTER TABLE "cards" DROP COLUMN IF EXISTS "traits";