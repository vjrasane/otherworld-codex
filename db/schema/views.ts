import { and, asc, eq, not, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { campaign } from "./campaign";
import { card } from "./card";
import { encounterSet } from "./encounter-set";
import { encounterSetsToScenarios } from "./encounter-sets-to-scenarios";
import { pack } from "./pack";
import { scenario } from "./scenario";
import { trait } from "./trait";
import { traitsToCards } from "./traitsToCards";

export const searchView = pgView('search_view').as(
    qb => qb.select(
        {
            type: sql<string>`text 'card'`.as('type'),
            id: sql`${card.cardId}`.as('id'),
            code: sql`${card.cardCode}`.as('code'),
            name: sql`${card.cardName}`.as('name'),
            imageUrl: sql`${card.imageUrl}`.as('imageUrl'),
            fullTextSearch: sql`${card.fullTextSearch}`.as('full_text_search'),
        }
    ).from(card)
        /* exclude scenario cards */
        .where(not(eq(card.typeCode, "scenario")))
        .unionAll(
            qb.selectDistinctOn([pack.packId], {
                type: sql<string>`text 'pack'`.as('type'),
                id: pack.packId,
                code: pack.packCode,
                name: pack.packName,
                imageUrl: card.imageUrl,
                fullTextSearch: pack.fullTextSearch,
            }).from(pack).leftJoin(card,
                and(
                    eq(pack.packCode, card.packCode),
                    eq(card.typeCode, 'scenario')
                )
            )
        ).unionAll(
            qb.selectDistinctOn([campaign.campaignId], {
                type: sql<string>`text 'campaign'`.as('type'),
                id: campaign.campaignId,
                code: campaign.campaignCode,
                name: campaign.campaignName,
                imageUrl: card.imageUrl,
                fullTextSearch: campaign.fullTextSearch,
            }).from(campaign)
                .leftJoin(scenario, eq(campaign.campaignCode, scenario.campaignCode))
                .leftJoin(encounterSetsToScenarios, eq(scenario.scenarioCode, encounterSetsToScenarios.scenarioCode))
                .leftJoin(encounterSet, eq(encounterSetsToScenarios.encounterCode, encounterSet.encounterCode))
                .leftJoin(card, and(
                    eq(encounterSet.encounterCode, card.encounterCode),
                    eq(card.typeCode, 'scenario')
                ))
        ).unionAll(
            qb.selectDistinctOn([scenario.scenarioId], {
                type: sql<string>`text 'scenario'`.as('type'),
                id: scenario.scenarioId,
                code: scenario.scenarioCode,
                name: scenario.scenarioName,
                imageUrl: card.imageUrl,
                fullTextSearch: scenario.fullTextSearch,
            }).from(scenario)
                .leftJoin(encounterSetsToScenarios, eq(scenario.scenarioCode, encounterSetsToScenarios.scenarioCode))
                .leftJoin(encounterSet, eq(encounterSetsToScenarios.encounterCode, encounterSet.encounterCode))
                .leftJoin(card, and(
                    eq(encounterSet.encounterCode, card.encounterCode),
                    eq(card.typeCode, 'scenario')
                )
                )
        ).unionAll(
            qb.selectDistinctOn([encounterSet.encounterId], {
                type: sql<string>`text 'encounter'`.as('type'),
                id: encounterSet.encounterId,
                code: encounterSet.encounterCode,
                name: encounterSet.encounterName,
                imageUrl: card.imageUrl,
                fullTextSearch: encounterSet.fullTextSearch,
            }).from(encounterSet).leftJoin(
                card, eq(encounterSet.encounterCode, card.encounterCode)
            ).leftJoin(
                encounterSetsToScenarios, eq(encounterSet.encounterCode, encounterSetsToScenarios.encounterCode)
            ).where(
                /* exclude the first encounter set of each scenario */
                not(eq(encounterSetsToScenarios.position, 1))
            )
        ).unionAll(
            qb.selectDistinctOn([trait.traitName], {
                type: sql<string>`text 'trait'`.as('type'),
                id: trait.traitId,
                code: trait.traitName,
                name: trait.traitName,
                imageUrl: card.imageUrl,
                fullTextSearch: trait.fullTextSearch,
            }).from(trait)
                .leftJoin(traitsToCards, eq(trait.traitName, traitsToCards.traitName))
                .leftJoin(card, eq(traitsToCards.cardCode, card.cardCode))
                .orderBy(asc(trait.traitName), asc(card.cardCode))
        )
)
