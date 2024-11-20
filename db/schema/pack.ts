import { InferInsertModel, relations, SQL, sql } from "drizzle-orm";
import { serial, varchar, timestamp, index, pgTable } from "drizzle-orm/pg-core";
import { tsVector } from "./common";
import { scenario } from "./scenario";
import { encounterSet } from "./encounter-set";
import { card } from "./card";

export const pack = pgTable('packs', {
    packId: serial('pack_id').primaryKey(),
    packCode: varchar('pack_code', { length: 255 }).notNull().unique(),
    packName: varchar('pack_name', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${pack.packName}, '')), 'A')
        )`
    )
},
    t => [index('idx_pack_search').using('gin', t.fullTextSearch)]
);

export const packRelations = relations(pack, ({ many }) => ({
    encounterSets: many(encounterSet),
    cards: many(card),
    scenarios: many(scenario)
}))

export type Pack = InferInsertModel<typeof pack>;