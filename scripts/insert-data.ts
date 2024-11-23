import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { uniqBy, chunk, flatten, trimCharsEnd } from 'lodash/fp'
import { Card as ArkhamDBCard, getCards } from '../db/get-card-data'
import * as schema from "../db/schema"
import { campaigns } from '../db/data'

dotenv.config({ path: '.env' })

const { DATABASE_URL } = process.env

const db = drizzle(DATABASE_URL!)

const insertPacks = async (cards: ArkhamDBCard[]): Promise<Array<{ id: number, packCode: string }>> => {
    const packs = uniqBy('pack_code', cards).filter(c => !!c.pack_code).map((c) => {
        if (!c.pack_code) throw new Error(`Pack code not found for card ${c.code}`)
        if (!c.pack_name) throw new Error(`Pack name not found for card ${c.code}`)
        return ({
            packCode: c.pack_code,
            packName: c.pack_name
        })
    })
    const inserted = await db.insert(schema.pack)
        .values(packs)
        .onConflictDoUpdate({ target: schema.pack.packCode, set: { updatedAt: new Date() } })
        .returning({
            id: schema.pack.packId,
            packCode: schema.pack.packCode
        })
    return inserted
}

const insertEncounterSets = async (cards: ArkhamDBCard[]): Promise<Array<{ id: number, encounterCode: string }>> => {
    const sets = uniqBy('encounter_code', cards).filter(c => !!c.encounter_code).map((c) => {
        if (!c.encounter_code) throw new Error(`Encounter code not found for card ${c.code}`)
        if (!c.encounter_name) throw new Error(`Encounter name not found for card ${c.code}`)
        if (!c.pack_code) throw new Error(`Pack code not found for card ${c.code}`)
        return ({
            encounterCode: c.encounter_code,
            encounterName: c.encounter_name,
            packCode: c.pack_code
        })
    })
    return await db.insert(schema.encounterSet).values(sets)
        .onConflictDoUpdate({ target: schema.encounterSet.encounterCode, set: { updatedAt: new Date() } })
        .returning({
            id: schema.encounterSet.encounterId,
            encounterCode: schema.encounterSet.encounterCode
        })
}

const insertCards = async (cards: ArkhamDBCard[]): Promise<Array<{ id: number, cardCode: string }>> => {
    const cards_ = cards.map((c) => {
        if (!c.pack_code) throw new Error(`Pack code not found for card ${c.code}`)
        return ({
            cardName: c.name,
            realName: c.real_name,
            cardCode: c.code,
            typeCode: c.type_code,
            typeName: c.type_name,
            factionCode: c.faction_code,
            factionName: c.faction_name,
            encounterPosition: c.encounter_position,
            position: c.position,
            text: c.text,
            backText: c.back_text,
            flavor: c.flavor,
            traits: c.traits?.split(" ")
                .map(v => v.trim())
                .filter(v => v.length)
                .map(v => trimCharsEnd(".", v)),
            traitsText: c.traits,
            url: c.url,
            imagesrc: c.imagesrc,
            backimagesrc: c.backimagesrc,
            backflavor: c.back_flavor,
            rawData: c,
            quantity: c.quantity,
            packCode: c.pack_code,
            encounterCode: c.encounter_code,
        })
    })
    return flatten(
        await Promise.all(
            chunk(1000, cards_).map(
                (chunk) => db.insert(schema.card).values(chunk)
                    .onConflictDoUpdate({
                        target: schema.card.cardCode,
                        set: { updatedAt: new Date() }
                    })
                    .returning({
                        id: schema.card.cardId,
                        cardCode: schema.card.cardCode
                    })
            )))
}

const insertCampaigns = async () => {
    await db.insert(schema.campaign).values(campaigns)
        .onConflictDoUpdate({ target: schema.campaign.campaignCode, set: { updatedAt: new Date() } })
        .returning({
            id: schema.campaign.campaignId,
            name: schema.campaign.campaignName
        })

    await db.insert(schema.scenario).values(campaigns.flatMap(campaign => campaign.scenarios.map(
        scenario => ({
            ...scenario,
            packCode: campaign.packCode,
            campaignCode: campaign.campaignCode
        })
    ))).onConflictDoUpdate({ target: schema.scenario.scenarioCode, set: { updatedAt: new Date() } })

    await db.insert(schema.encounterSetsToScenarios).values(
        campaigns.flatMap(campaign => campaign.scenarios.flatMap(
            scenario => scenario.encounterCodes.map(
                encounterCode => ({
                    scenarioCode: scenario.scenarioCode,
                    encounterCode
                })
            )))
    ).onConflictDoNothing()
}

// const insertScenarios = async () => {
//     await db.insert(schema.scenario).values(scenarios)
//         .onConflictDoUpdate({ target: schema.scenario.scenarioCode, set: { updatedAt: new Date() } })
//         .returning({
//             id: schema.scenario.id,
//             name: schema.scenario.name
//         })

//     await db.insert(schema.encounterSetsToScenarios).values(
//         scenarios.flatMap(
//             scenario => scenario.encounterCodes.map(
//                 encounterCode => ({
//                     scenarioCode: scenario.scenarioCode,
//                     encounterCode
//                 })
//             ))
//     ).onConflictDoNothing()
// }

const main = async () => {
    const cards = await getCards()
    const packs = await insertPacks(cards)
    const sets = await insertEncounterSets(cards)
    await insertCards(cards)
    await insertCampaigns()
}

main()