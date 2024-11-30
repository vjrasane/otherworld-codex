import { array, DecoderType, nullable, number, object, string } from 'decoders'
import "dotenv/config"
import { asc, desc, eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { first, groupBy, uniqBy, values } from 'lodash/fp'
import * as s from './schema'
import { Card } from './schema'
import { mapValues } from 'lodash'

const { DATABASE_URL } = process.env

const db = drizzle(DATABASE_URL!, { schema: s })

export const getScenarioEncounterCards = async (scenarioCode: string): Promise<Card[]> => {
    const results = await db.select().from(s.scenario)
        .leftJoin(s.encounterSetsToScenarios, eq(s.scenario.scenarioCode, s.encounterSetsToScenarios.scenarioCode))
        .leftJoin(s.encounterSet, eq(s.encounterSetsToScenarios.encounterCode, s.encounterSet.encounterCode))
        .leftJoin(s.card, eq(s.encounterSet.encounterCode, s.card.encounterCode))
        .where(eq(s.scenario.scenarioCode, scenarioCode))
    const cards = results.map(({ cards }) => cards).filter((c) => !!c)
    return cards
}

export const getScenarioByCode = async (code: string) => {
    const results = await db.select({
        scenario: s.scenario,
        campaign: s.campaign,
        card: s.card,
        encounterSet: s.encounterSet,
        trait: s.trait,
        // cardCount: count(s.card.cardId),
        // traitCount: count(s.trait.traitName)
        encounterSetsToScenarios: s.encounterSetsToScenarios
    }).from(s.scenario)
        .leftJoin(s.campaign, eq(s.scenario.campaignCode, s.campaign.campaignCode))
        .leftJoin(
            s.encounterSetsToScenarios, eq(s.scenario.scenarioCode, s.encounterSetsToScenarios.scenarioCode)
        ).leftJoin(
            s.encounterSet, eq(s.encounterSetsToScenarios.encounterCode, s.encounterSet.encounterCode)
        ).leftJoin(
            s.card, eq(s.encounterSet.encounterCode, s.card.encounterCode)
        ).leftJoin(
            s.traitsToCards, eq(s.card.cardCode, s.traitsToCards.cardCode)
        ).leftJoin(
            s.trait, eq(s.traitsToCards.traitName, s.trait.traitName)
        ).orderBy(
            asc(s.encounterSetsToScenarios.position), asc(s.card.cardCode)
        ).where(eq(s.scenario.scenarioCode, code))

    const scenario = first(results)?.scenario
    if (!scenario) return null

    const campaigns = uniqBy("campaignCode", results.map(({ campaign }) => campaign).filter((c) => !!c))
    const traitsByCardCode = groupBy(
        ({ card }) => card?.cardCode,
        results
            .map(({ trait, card }) => ({ trait, card }))
            .filter(({ trait }) => !!trait)
    )

    const cards = values(groupBy(({ card }) => card?.cardCode, results)).map((cardResults) => {
        const card = first(cardResults)?.card
        if (!card) return
        return {
            ...card,
            traits: traitsByCardCode[card.cardCode]?.map(({ trait }) => trait?.traitName) ?? []
        }
    }).filter((c) => !!c)

    const cardsByEncounterCode = groupBy("encounterCode", cards)

    const encounterSets = uniqBy("encounterCode", results.map(({ encounterSet }) => encounterSet).filter((e) => !!e)).map(
        (encounterSet) => ({ ...encounterSet, cards: cardsByEncounterCode[encounterSet.encounterCode] ?? [] })
    )

    // const traits = uniqBy("traitName", results.map(({ trait }) => trait).filter((t) => !!t))
    // const encounterSets = results.map(({ encounterSet }) => encounterSet).filter((e) => !!e)
    // const encounterSetsToScenarios = results.map(({ encounterSetsToScenarios }) => encounterSetsToScenarios).filter((e) => !!e)
    // console.log({ scenario, campaigns, encounterSets, encounterSetsToScenarios })

    return { ...scenario, campaigns, encounterSets }



    // const scenario = await db.query.scenario.findFirst({
    //     where: eq(s.scenario.scenarioCode, code),
    //     with: {
    //         // campaign: true,
    //         // pack: true,
    //         encounterSetsToScenarios: {
    //             with: {
    //                 encounterSet: {
    //                     with: {
    //                         cards: {
    //                             with: {
    //                                 // traitsToCards: true
    //                                 traitsToCards: {
    //                                     with: {
    //                                         trait: true
    //                                     }
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // })
    // return scenario

}

// const aggregate = () => { }

// aggregate(
//     {
//         entity: (row) => row.campaign,
//         with: {
//             pack: row => one(row.pack),
//             scenarios: row => many(row.scenario.scenarioCode, {
//                 entity: row => row.scenario,
//                 with: {
//                     encounterSets: row => many(row.encounterSet.encounterCode, {
//                         entity: row => row.encounterSet,
//                         with: {
//                             cards: row => many(row.card.cardCode, {
//                                 entity: row => row.card,
//                                 with: {
//                                     traits: row => many(row.trait.traitName)
//                                 }
//                             })
//                         }
//                     })
//                 }
//             })
//         }
//     }
// )

export const getCampaignByCode = async (code: string) => {
    const result = await db.select({
        campaign: s.campaign,
        pack: s.pack,
        scenario: s.scenario,
        encounterSet: s.encounterSet,
        card: s.card,
        trait: s.trait
    }).from(s.campaign).
        innerJoin(
            s.pack, eq(s.campaign.packCode, s.pack.packCode)
        ).innerJoin(
            s.scenario, eq(s.campaign.campaignCode, s.scenario.campaignCode)
        ).innerJoin(
            s.encounterSetsToScenarios, eq(s.scenario.scenarioCode, s.encounterSetsToScenarios.scenarioCode)
        ).innerJoin(
            s.encounterSet, eq(s.encounterSetsToScenarios.encounterCode, s.encounterSet.encounterCode)
        ).innerJoin(
            s.card, eq(s.encounterSet.encounterCode, s.card.encounterCode)
        ).innerJoin(
            s.traitsToCards, eq(s.card.cardCode, s.traitsToCards.cardCode)
        ).innerJoin(
            s.trait, eq(s.traitsToCards.traitName, s.trait.traitName)
        )
        .orderBy(asc(s.scenario.position))
        .where(eq(s.campaign.campaignCode, code))
    type Card = s.Card & { traits: Record<string, string> }
    type EncounterSet = s.EncounterSet & { cards: Record<string, Card> }
    type Scenario = s.Scenario & { encounterSets: Record<string, EncounterSet> }
    type Campaign = s.Campaign & { pack: s.Pack, scenarios: Record<string, Scenario> }
    const campaigns = result.reduce((acc: Record<string, Campaign>, row) => {
        const campaign: Campaign = acc[row.campaign.campaignCode] =
            acc[row.campaign.campaignCode] ?? {
                ...row.campaign,
                pack: row.pack,
                scenarios: {}
            }

        const scenario: Scenario = campaign.scenarios[row.scenario.scenarioCode] =
            campaign.scenarios[row.scenario.scenarioCode] ?? {
                ...row.scenario,
                encounterSets: {}
            }

        const encounterSet: EncounterSet = scenario.encounterSets[row.encounterSet.encounterCode] =
            scenario.encounterSets[row.encounterSet.encounterCode] ?? {
                ...row.encounterSet,
                cards: {}
            }

        const card: Card = encounterSet.cards[row.card.cardCode] =
            encounterSet.cards[row.card.cardCode] ?? {
                ...row.card,
                traits: {}
            }

        card.traits[row.trait.traitName]
            = card.traits[row.trait.traitName] ?? row.trait.traitName

        return acc
    }, {})

    const [campaign, ...rest] = values(campaigns)
    if (!campaign || rest.length) return null
    return {
        ...campaign,
        scenarios: values(campaign.scenarios).map((scenario) => ({
            ...scenario,
            encounterSets: values(scenario.encounterSets).map((encounterSet) => ({
                ...encounterSet,
                cards: values(encounterSet.cards).map((card) => ({
                    ...card,
                    traits: values(card.traits)
                }))
            }))
        }))
    }
}

export const getCardByCode = async (code: string) => {
    const card = await db.query.card.findFirst({
        where: eq(s.card.cardCode, code),
        with: {
            traitsToCards: {
                with: {
                    trait: true
                }
            },
            encounterSet: {
                with: {
                    encounterSetsToScenarios: {
                        with: {
                            scenario: {
                                with: {
                                    campaign: true
                                }
                            }
                        }
                    }
                }
            },
            pack: true
        }
    })

    return card ?? null
}

const SearchResult = object({
    id: number,
    type: string,
    code: string,
    name: string,
    imageUrl: nullable(string)
})
export type SearchResult = DecoderType<typeof SearchResult>

export const search = async (query: string, limit: number): Promise<SearchResult[]> => {
    const searchValue = query.split(" ").map(w => w.trim()).filter(w => w.length).map(w => w + ":*").join(" & ")
    const results = await db.select({
        type: s.searchView.type,
        id: s.searchView.id,
        code: s.searchView.code,
        name: s.searchView.name,
        imageUrl: s.searchView.imageUrl,
        rank: sql`ts_rank(${s.searchView.fullTextSearch}, to_tsquery('english', ${searchValue}))`
    })
        .from(s.searchView)
        .where(sql`${s.searchView.fullTextSearch} @@ to_tsquery('english', ${searchValue})`)
        .orderBy(t => desc(t.rank))
        .limit(limit)
    return array(SearchResult).verify(results)
}
