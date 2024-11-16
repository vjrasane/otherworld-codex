import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { timestamp, integer, json, pgTable, serial, text, varchar, primaryKey } from 'drizzle-orm/pg-core';

export const pack = pgTable('packs', {
    id: serial('id').primaryKey(),
    packCode: varchar('pack_code', { length: 255 }).notNull().unique(),
    packName: varchar('pack_name', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const packRelations = relations(pack, ({ many }) => ({
    encounterSets: many(encounterSet),
    cards: many(card),
    scenarios: many(scenario)
}))

export const encounterSet = pgTable('encounter_sets', {
    id: serial('id').primaryKey(),
    encounterName: varchar('encounter_name', { length: 255 }).notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().unique(),
    packCode: varchar("pack_code", { length: 255 }).notNull().references(() => pack.packCode),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const encounterSetRelations = relations(encounterSet, ({ one, many }) => ({
    pack: one(pack, {
        fields: [encounterSet.packCode],
        references: [pack.packCode],
    }),
    cards: many(card),
    encounterSetsToScenarios: many(encounterSetsToScenarios)
}))

export const card = pgTable('cards', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    realName: varchar('real_name', { length: 255 }),
    cardCode: varchar('card_code', { length: 255 }).notNull().unique(),
    typeCode: varchar('type_code', { length: 255 }).notNull(),
    typeName: varchar('type_name', { length: 255 }).notNull(),
    factionCode: varchar('faction_code', { length: 255 }).notNull(),
    factionName: varchar('faction_name', { length: 255 }).notNull(),
    encounterPosition: integer('encounter_position'),
    position: integer('position'),
    text: text('text'),
    flavor: text('flavor'),
    traits: text("traits").array(),
    url: text('url').notNull(),
    imagesrc: text('imagesrc'),
    backimagesrc: text('backimagesrc'),
    backflavor: text('back_flavor'),
    rawData: json('raw_data').notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).references(() => encounterSet.encounterCode),
    packCode: varchar('pack_code', { length: 255 }).notNull().references(() => pack.packCode),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    quantity: integer('quantity')
})

export const cardRelations = relations(card, ({ one }) => ({
    encounterSet: one(encounterSet, {
        fields: [card.encounterCode],
        references: [encounterSet.encounterCode]
    }),
    pack: one(pack, {
        fields: [card.packCode],
        references: [pack.packCode]
    })
}))

export const scenario = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    packCode: varchar('pack_code', { length: 255 }).references(() => pack.packCode),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const scenarioRelations = relations(scenario, ({ one, many }) => ({
    pack: one(pack, {
        fields: [scenario.packCode],
        references: [pack.packCode]
    }),
    encounterSetsToScenarios: many(encounterSetsToScenarios)
}))

export const encounterSetsToScenarios = pgTable('encounter_sets_to_scenarios', {
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().references(() => encounterSet.encounterCode),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().references(() => scenario.scenarioCode)
},
    (t) => [primaryKey({ columns: [t.encounterCode, t.scenarioCode] })])

export const encounterSetsToScenariosRelations = relations(encounterSetsToScenarios, ({ one }) => ({
    encounterSet: one(encounterSet, {
        fields: [encounterSetsToScenarios.encounterCode],
        references: [encounterSet.encounterCode]
    }),
    scenario: one(scenario, {
        fields: [encounterSetsToScenarios.scenarioCode],
        references: [scenario.scenarioCode]
    })
}))

export type Pack = InferInsertModel<typeof pack>;
export type EncounterSet = InferSelectModel<typeof encounterSet>;
export type Card = InferSelectModel<typeof card>;
export type Scenario = InferSelectModel<typeof scenario>;
export type ScenarioInput = InferInsertModel<typeof scenario>;