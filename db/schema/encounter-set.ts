import { sql, relations, SQL, InferSelectModel } from "drizzle-orm";
import { serial, varchar, timestamp, index, pgTable } from "drizzle-orm/pg-core";
import { tsVector } from "./common";
import { pack } from "./pack";
import { card } from "./card";
import { encounterSetsToScenarios } from "./encounterSetsToScenarios";

export const encounterSet = pgTable('encounter_sets', {
    encounterId: serial('encounter_id').primaryKey(),
    encounterName: varchar('encounter_name', { length: 255 }).notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().unique(),
    packCode: varchar("pack_code", { length: 255 }).notNull().references(() => pack.packCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${encounterSet.encounterName}, '')), 'A')
        )`
    )
},
    t => [index('idx_encounter_set_search').using(
        'gin', sql`to_tsvector('english', ${t.encounterName})`
    )]
);

export const encounterSetRelations = relations(encounterSet, ({ one, many }) => ({
    pack: one(pack, {
        fields: [encounterSet.packCode],
        references: [pack.packCode],
    }),
    cards: many(card),
    encounterSetsToScenarios: many(encounterSetsToScenarios)
}))



export type EncounterSet = InferSelectModel<typeof encounterSet>;