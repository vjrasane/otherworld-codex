import { InferInsertModel, InferSelectModel, relations, SQL, sql } from 'drizzle-orm';
import { timestamp, integer, json, pgTable, serial, text, varchar, primaryKey, index, customType } from 'drizzle-orm/pg-core';

const tsVector = customType<{ data: string }>({
    dataType() {
        return "tsvector";
    },
});

export const pack = pgTable('packs', {
    id: serial('id').primaryKey(),
    packCode: varchar('pack_code', { length: 255 }).notNull().unique(),
    packName: varchar('pack_name', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
},
    t => ({
        packNameSearchIndex: index('pack_name_search_index').using(
            'gin', sql`to_tsvector('english', ${t.packName})`
        ),
    })
);

export const packRelations = relations(pack, ({ many }) => ({
    encounterSets: many(encounterSet),
    cards: many(card),
    scenarios: many(scenario)
}))

export const encounterSet = pgTable('encounter_sets', {
    id: serial('id').primaryKey(),
    encounterName: varchar('encounter_name', { length: 255 }).notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().unique(),
    packCode: varchar("pack_code", { length: 255 }).notNull().references(() => pack.packCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
},
    t => [index('encounter_name_search_index').using(
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
    backText: text('back_text'),
    flavor: text('flavor'),
    traits: text("traits").array(),
    traitsText: text("traits_text"),
    url: text('url').notNull(),
    imagesrc: text('imagesrc'),
    backimagesrc: text('backimagesrc'),
    backflavor: text('back_flavor'),
    rawData: json('raw_data').notNull(),
    encounterCode: varchar('encounter_code', { length: 255 }).references(() => encounterSet.encounterCode, { onDelete: 'cascade' }),
    packCode: varchar('pack_code', { length: 255 }).notNull().references(() => pack.packCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    quantity: integer('quantity'),


    // nameSearch: tsVector("name_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', ${card.name}), 'A')`
    // ),
    // contentSearch: tsVector("content_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', coalesce(${card.text}, '') || coalesce(${card.backText}, '')), 'D')`
    // ),
    // traitsSearch: tsVector("traits_search", { dimensions: 3 }).generatedAlwaysAs(
    //     (): SQL => sql`setweight(to_tsvector('english', coalesce(${card.traitsText}, '')), 'B')`
    // )
    fullTextSearch: tsVector("fullTextSearch", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${card.name}, '')), 'A') || 
        setweight(to_tsvector('english', coalesce(${card.realName}, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(${card.text}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${card.backText}, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(${card.traitsText}, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(${card.flavor}, '')), 'D') ||
        setweight(to_tsvector('english', coalesce(${card.backflavor}, '')), 'D')
        )`
    )

},
    t => [index('idx_card_search').using("gin", t.fullTextSearch)

        // sql`(${t.nameSearch} || ${t.contentSearch})`)
    ]

    //     t => ({
    //         searchIndex: index('card_search_index').using('gin', sql`(
    //    setweight(to_tsvector('english', ${t.name}), 'A') ||
    //    setweight(to_tsvector('english', ${t.realName}), 'A') ||
    //    setweight(to_tsvector('english', ${t.text}), 'B') ||
    //    setweight(to_tsvector('english', ${t.traitsText}), 'C') ||
    //    setweight(to_tsvector('english', ${t.backflavor}), 'D') ||
    //    setweight(to_tsvector('english', ${t.flavor}), 'D')
    //     )`)
    // })
)

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

export const campaign = pgTable('campaigns', {
    id: serial('id').primaryKey(),
    campaignCode: varchar('campaign_code', { length: 255 }).notNull().unique(),
    packCode: varchar('pack_code', { length: 255 }).references(() => pack.packCode, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
},
    t => ({
        campaignNameSearchIndex: index('campaign_name_search_index').using(
            'gin', sql`to_tsvector('english', ${t.name})`
        ),
    })
)

export const campaignRelations = relations(campaign, ({ one, many }) => ({
    pack: one(pack, {
        fields: [campaign.packCode],
        references: [pack.packCode]
    }),
    scenarios: many(scenario)
}))

export const scenario = pgTable('scenarios', {
    id: serial('id').primaryKey(),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    packCode: varchar('pack_code', { length: 255 }).references(() => pack.packCode, { onDelete: 'cascade' }),
    campaignCode: varchar('campaign_code', { length: 255 }).references(() => campaign.campaignCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
},
    t => ({
        scenarioNameSearchIndex: index('scenario_name_search_index').using(
            'gin', sql`to_tsvector('english', ${t.name})`
        ),
    })
)

export const scenarioRelations = relations(scenario, ({ one, many }) => ({
    pack: one(pack, {
        fields: [scenario.packCode],
        references: [pack.packCode]
    }),
    campaign: one(campaign, {
        fields: [scenario.campaignCode],
        references: [campaign.campaignCode]
    }),
    encounterSetsToScenarios: many(encounterSetsToScenarios)
}))

export const encounterSetsToScenarios = pgTable('encounter_sets_to_scenarios', {
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().references(() => encounterSet.encounterCode, { onDelete: 'cascade' }),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().references(() => scenario.scenarioCode, { onDelete: 'cascade' }),
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
export type Campaign = InferSelectModel<typeof campaign>;
export type CampaignInput = InferInsertModel<typeof campaign>;
export type Scenario = InferSelectModel<typeof scenario>;
export type ScenarioInput = InferInsertModel<typeof scenario>;