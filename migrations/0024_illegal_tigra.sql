ALTER TABLE "cards" ADD COLUMN "image_url" text GENERATED ALWAYS AS (case when "cards"."imagesrc" is not null then 'https://arkhamdb.com' || "cards"."imagesrc" else null end) STORED;