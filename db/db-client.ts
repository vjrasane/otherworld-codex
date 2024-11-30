import { drizzle } from 'drizzle-orm/node-postgres'
import { count, desc, eq, sql } from 'drizzle-orm'
import * as s from './schema'
import { Card } from './schema'
import { array, DecoderType, nullable, number, object, string } from 'decoders'
import "dotenv/config"
import { first, groupBy, uniqBy } from 'lodash/fp'

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
    // const results = await db.select({
    //     scenario: s.scenario,
    //     // campaign: s.campaign,
    //     // card: s.card,
    //     encounterSet: s.encounterSet,
    //     // traitName: s.trait.traitName,
    //     // cardCount: count(s.card.cardId),
    //     // traitCount: count(s.trait.traitName)
    //     encounterSetsToScenarios: s.encounterSetsToScenarios
    // }).from(s.scenario)
    //     // .leftJoin(s.campaign, eq(s.scenario.campaignCode, s.campaign.campaignCode))
    //     .leftJoin(
    //         s.encounterSetsToScenarios, eq(s.scenario.scenarioCode, s.encounterSetsToScenarios.scenarioCode)
    //     ).leftJoin(
    //         s.encounterSet, eq(s.encounterSetsToScenarios.encounterCode, s.encounterSet.encounterCode)
    //         // ).leftJoin(
    //         //     s.card, eq(s.encounterSet.encounterCode, s.card.encounterCode)
    //         // ).leftJoin(
    //         //     s.traitsToCards, eq(s.card.cardCode, s.traitsToCards.cardCode)
    //         // ).leftJoin(
    //         //     s.trait, eq(s.traitsToCards.traitName, s.trait.traitName)
    //         // ).groupBy(
    //         //     s.trait.traitName
    //     ).where(eq(s.scenario.scenarioCode, code))

    // const scenario = first(results)?.scenario
    // if (!scenario) return null

    // // const campaigns = uniqBy("campaignCode", results.map(({ campaign }) => campaign).filter((c) => !!c))
    // const campaigns: never[] = []

    // // const cards = values(groupBy(({ card }) => card?.cardCode, results)).map((cardResults) => {
    // //     const card = first(cardResults)?.card
    // //     if (!card) return
    // //     // const traits = uniq(cardResults.map(({ trait }) => trait?.traitName).filter((t) => !!t))
    // //     return { ...card, traits }
    // // }).filter((c) => !!c)

    // // const cardsByEncounterCode = groupBy("encounterCode", uniqBy("cardCode", results.map(({ card }) => card).filter((c) => !!c)))

    // // const encounterSets = uniqBy("encounterCode", results.map(({ encounterSet }) => encounterSet).filter((e) => !!e)).map(
    // //     (encounterSet) => ({ ...encounterSet, cards: cardsByEncounterCode[encounterSet.encounterCode] ?? [] })
    // // )
    // const encounterSets = results.map(({ encounterSet }) => encounterSet).filter((e) => !!e)
    // const encounterSetsToScenarios = results.map(({ encounterSetsToScenarios }) => encounterSetsToScenarios).filter((e) => !!e)
    // console.log({ scenario, campaigns, encounterSets, encounterSetsToScenarios })

    // return { ...scenario, campaigns, encounterSets, encounterSetsToScenarios }



    const scenario = await db.query.scenario.findFirst({
        where: eq(s.scenario.scenarioCode, code),
        with: {
            campaign: true,
            pack: true,
            encounterSetsToScenarios: {
                with: {
                    encounterSet: {
                        with: {
                            cards: {
                                // with: {
                                //     traitsToCards: {
                                //         with: {
                                //             trait: true
                                //         }
                                //     }
                                // }
                            }
                        }
                    }
                }
            }
        }
    })
    return scenario
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
