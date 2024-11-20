import { sql, relations, SQL, InferSelectModel, InferInsertModel } from "drizzle-orm"
import { index, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core"
import { tsVector } from "./common"
import { campaign } from "./campaign"
import { pack } from "./pack"
import { encounterSetsToScenarios } from "./encounterSetsToScenarios"

export const scenario = pgTable('scenarios', {
    scenarioId: serial('scenario_id').primaryKey(),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().unique(),
    scenarioName: varchar('scenario_name', { length: 255 }).notNull(),
    packCode: varchar('pack_code', { length: 255 }).references(() => pack.packCode, { onDelete: 'cascade' }),
    campaignCode: varchar('campaign_code', { length: 255 }).references(() => campaign.campaignCode, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    fullTextSearch: tsVector("full_text_search", { dimensions: 3 }).generatedAlwaysAs(
        (): SQL => sql`(
        setweight(to_tsvector('english', coalesce(${scenario.scenarioName}, '')), 'A')
        )`
    )
},
    t => [index('idx_scenario_search').using(
        'gin', t.fullTextSearch
    )]
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

export type Scenario = InferSelectModel<typeof scenario>;
export type ScenarioInput = InferInsertModel<typeof scenario>;