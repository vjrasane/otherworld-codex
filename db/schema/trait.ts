import { InferSelectModel, relations, sql, SQL } from "drizzle-orm";
import { index, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { tsVector } from "./common";
import { traitsToCards } from "./traitsToCards";


export const trait = pgTable('traits', {
    traitId: serial('trait_id').primaryKey(),
    traitName: varchar('trait_name', { length: 255 }).notNull().unique(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),

    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${trait.traitName}, '')), 'A')
        )`
    )
}, t => [index('idx_trait_search').using('gin', t.fullTextSearch)])

export const traitRelations = relations(trait, ({ many }) => ({
    traitsToCards: many(traitsToCards)
}))

export type Trait = InferSelectModel<typeof trait>;