import { and, eq, sql, asc } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { campaign } from "./campaign";
import { card } from "./card";
import { encounterSet } from "./encounter-set";
import { encounterSetsToScenarios } from "./encounterSetsToScenarios";
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
            imagesrc: sql`${card.imagesrc}`.as('imagesrc'),
            fullTextSearch: sql`${card.fullTextSearch}`.as('full_text_search'),
        }
    ).from(card).unionAll(
        qb.selectDistinctOn([pack.packId], {
            type: sql<string>`text 'pack'`.as('type'),
            id: pack.packId,
            code: pack.packCode,
            name: pack.packName,
            imagesrc: card.imagesrc,
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
            imagesrc: card.imagesrc,
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
            imagesrc: card.imagesrc,
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
            imagesrc: card.imagesrc,
            fullTextSearch: encounterSet.fullTextSearch,
        }).from(encounterSet).leftJoin(
            card, eq(encounterSet.encounterCode, card.encounterCode)
        )
    ).unionAll(
        qb.selectDistinctOn([trait.traitName], {
            type: sql<string>`text 'trait'`.as('type'),
            id: trait.traitId,
            code: trait.traitName,
            name: trait.traitName,
            imagesrc: card.imagesrc,
            fullTextSearch: trait.fullTextSearch,
        }).from(trait)
            .leftJoin(traitsToCards, eq(trait.traitName, traitsToCards.traitName))
            .leftJoin(card, eq(traitsToCards.cardCode, card.cardCode))
            .orderBy(asc(trait.traitName), asc(card.cardCode))
    )
)
