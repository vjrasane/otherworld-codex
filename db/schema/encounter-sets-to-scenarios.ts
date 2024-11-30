import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { encounterSet } from "./encounter-set";
import { scenario } from "./scenario";


export const encounterSetsToScenarios = pgTable('encounter_sets_to_scenarios', {
    encounterCode: varchar('encounter_code', { length: 255 }).notNull().references(() => encounterSet.encounterCode, { onDelete: 'cascade' }),
    scenarioCode: varchar('scenario_code', { length: 255 }).notNull().references(() => scenario.scenarioCode, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(1),
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


