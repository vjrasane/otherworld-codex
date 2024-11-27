import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { trait } from "./trait";
import { card } from "./card";
import { relations } from "drizzle-orm";

export const traitsToCards = pgTable('traits_to_cards', {
    traitName: varchar('trait_name', { length: 255 }).references(() => trait.traitName, { onDelete: 'cascade' }),
    cardCode: varchar('card_code').references(() => card.cardCode, { onDelete: 'cascade' }),
},
    (t) => [primaryKey({ columns: [t.traitName, t.cardCode] })])

export const traitsToCardsRelations = relations(traitsToCards, ({ one }) => ({
    trait: one(trait, {
        fields: [traitsToCards.traitName],
        references: [trait.traitName]
    }),
    card: one(card, {
        fields: [traitsToCards.cardCode],
        references: [card.cardCode]
    })
}))