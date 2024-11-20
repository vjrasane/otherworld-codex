import { pgView } from "drizzle-orm/pg-core";
import { card } from "./card";
import { sql } from "drizzle-orm";
import { pack } from "./pack";
import { campaign } from "./campaign";
import { scenario } from "./scenario";
import { encounterSet } from "./encounter-set";

export const searchView = pgView('search_view').as(
    qb => qb.select(
        {
            type: sql<string>`text 'card'`.as('type'),
            id: sql`${card.cardId}`.as('id'),
            code: sql`${card.cardCode}`.as('code'),
            name: sql`${card.cardName}`.as('name'),
            fullTextSearch: sql`${card.fullTextSearch}`.as('full_text_search'),
        }
    ).from(card).unionAll(
        qb.select({
            type: sql<string>`text 'pack'`.as('type'),
            id: pack.packId,
            code: pack.packCode,
            name: pack.packName,
            fullTextSearch: pack.fullTextSearch,
        }).from(pack)
    ).unionAll(
        qb.select({
            type: sql<string>`text 'campaign'`.as('type'),
            id: campaign.campaignId,
            code: campaign.campaignCode,
            name: campaign.campaignName,
            fullTextSearch: campaign.fullTextSearch,
        }).from(campaign)
    ).unionAll(
        qb.select({
            type: sql<string>`text 'scenario'`.as('type'),
            id: scenario.scenarioId,
            code: scenario.scenarioCode,
            name: scenario.scenarioName,
            fullTextSearch: scenario.fullTextSearch,
        }).from(scenario)
    ).unionAll(
        qb.select({
            type: sql<string>`text 'encounter_set'`.as('type'),
            id: encounterSet.encounterId,
            code: encounterSet.encounterCode,
            name: encounterSet.encounterName,
            fullTextSearch: encounterSet.fullTextSearch,
        }).from(encounterSet)
    )
)