import { drizzle } from 'drizzle-orm/node-postgres'
import { desc, eq, getTableColumns, sql } from 'drizzle-orm'
import * as s from './schema'
import { Card } from './schema'

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


export const search = async (query: string) => {
    // const matchQuery = sql`(
    //         setweight(to_tsvector('english', ${s.card.name}), 'A') || 
    //         setweight(to_tsvector('english', ${s.card.realName}), 'A') || 
    //         setweight(to_tsvector('english', ${s.card.text}), 'B') || 
    //         setweight(to_tsvector('english', ${s.card.traitsText}), 'C') || 
    //         setweight(to_tsvector('english', ${s.card.backflavor}), 'D') ||
    //         setweight(to_tsvector('english', ${s.card.flavor}), 'D'),
    //         to_tsquery('english', ${query})
    // )`
    //     const matchQuery = sql`
    //   setweight(to_tsvector('english', ${s.card.name}), 'A') ||
    //   setweight(to_tsvector('english', ${s.card.text}), 'B')), to_tsquery('english', ${query})`;

    const results = await db.select({
        type: s.searchView.type,
        id: s.searchView.id,
        code: s.searchView.code,
        name: s.searchView.name,
        // rank: sql`ts_rank(${s.card.nameSearch} || ${s.card.contentSearch}, plainto_tsquery('english', ${query}))`,
        // rankCd: sql`ts_rank_cd(${s.card.nameSearch} || ${s.card.contentSearch}, plainto_tsquery('english', ${query}))`
        rank: sql`ts_rank(${s.searchView.fullTextSearch}, plainto_tsquery('english', ${query}))`
    })
        .from(s.searchView)
        .where(sql`${s.searchView.fullTextSearch} @@ plainto_tsquery('english', ${query})`)
        // .where(sql`(${s.card.nameSearch} || ${s.card.contentSearch}) @@ plainto_tsquery('english', ${query})`)
        // .where(sql`(
        //     setweight(to_tsvector('english', ${s.card.name}), 'A') || 
        //     setweight(to_tsvector('english', ${s.card.realName}), 'A') || 
        //     setweight(to_tsvector('english', ${s.card.text}), 'B') || 
        //     setweight(to_tsvector('english', ${s.card.traitsText}), 'C') || 
        //     setweight(to_tsvector('english', ${s.card.backflavor}), 'D') ||
        //     setweight(to_tsvector('english', ${s.card.flavor}), 'D')
        //     @@ websearch_to_tsquery('english', ${query})
        // )`)
        .orderBy(t => desc(t.rank))
        .limit(3)
    // return results.map(c => c.name)
    return results
}