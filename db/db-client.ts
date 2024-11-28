import { drizzle } from 'drizzle-orm/node-postgres'
import { desc, eq, sql } from 'drizzle-orm'
import * as s from './schema'
import { Card } from './schema'
import { array, DecoderType, nullable, number, object, string } from 'decoders'
import "dotenv/config"

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

export const search = async (query: string): Promise<SearchResult[]> => {
    const results = await db.select({
        type: s.searchView.type,
        id: s.searchView.id,
        code: s.searchView.code,
        name: s.searchView.name,
        imageUrl: s.searchView.imageUrl,
        rank: sql`ts_rank(${s.searchView.fullTextSearch}, plainto_tsquery('english', ${query}))`
    })
        .from(s.searchView)
        .where(sql`${s.searchView.fullTextSearch} @@ plainto_tsquery('english', ${query})`)
        .orderBy(t => desc(t.rank))
        .limit(10)
    return array(SearchResult).verify(results)
}
