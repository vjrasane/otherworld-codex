import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getCardByCodeQuery = `-- name: GetCardByCode :one
SELECT
    c.card_code,
    c.card_name,
    c.real_name,
    c.type_code,
    c.type_name,
    c.faction_code,
    c.faction_name,
    c.encounter_code,
    c.encounter_name,
    c.encounter_position,
    c.position,
    c.text,
    c.back_text,
    c.flavor,
    c.traits,
    c.url,
    c.imagesrc,
    c.backimagesrc,
    c.back_flavor,
    c.pack_code,
    c.pack_name,
    c.quantity,
    c.image_url
FROM card c
WHERE c.card_code = $1`;

export interface GetCardByCodeArgs {
    cardCode: string;
}

export interface GetCardByCodeRow {
    cardCode: string;
    cardName: string;
    realName: string | null;
    typeCode: string;
    typeName: string;
    factionCode: string;
    factionName: string;
    encounterCode: string | null;
    encounterName: string | null;
    encounterPosition: number | null;
    position: number | null;
    text: string | null;
    backText: string | null;
    flavor: string | null;
    traits: string[];
    url: string;
    imagesrc: string | null;
    backimagesrc: string | null;
    backFlavor: string | null;
    packCode: string;
    packName: string;
    quantity: number | null;
    imageUrl: string | null;
}

export async function getCardByCode(client: Client, args: GetCardByCodeArgs): Promise<GetCardByCodeRow | null> {
    const result = await client.query({
        text: getCardByCodeQuery,
        values: [args.cardCode],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        cardCode: row[0],
        cardName: row[1],
        realName: row[2],
        typeCode: row[3],
        typeName: row[4],
        factionCode: row[5],
        factionName: row[6],
        encounterCode: row[7],
        encounterName: row[8],
        encounterPosition: row[9],
        position: row[10],
        text: row[11],
        backText: row[12],
        flavor: row[13],
        traits: row[14],
        url: row[15],
        imagesrc: row[16],
        backimagesrc: row[17],
        backFlavor: row[18],
        packCode: row[19],
        packName: row[20],
        quantity: row[21],
        imageUrl: row[22]
    };
}

export const getCardScenariosQuery = `-- name: GetCardScenarios :many
SELECT
    s.scenario_code,
    s.scenario_name,
    s.campaign_code,
    ca.campaign_name
FROM encounter_set_scenario ess
JOIN scenario s ON ess.scenario_code = s.scenario_code
JOIN campaign ca ON s.campaign_code = ca.campaign_code
WHERE ess.encounter_code = $1
ORDER BY s.position`;

export interface GetCardScenariosArgs {
    encounterCode: string;
}

export interface GetCardScenariosRow {
    scenarioCode: string;
    scenarioName: string;
    campaignCode: string | null;
    campaignName: string;
}

export async function getCardScenarios(client: Client, args: GetCardScenariosArgs): Promise<GetCardScenariosRow[]> {
    const result = await client.query({
        text: getCardScenariosQuery,
        values: [args.encounterCode],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            scenarioCode: row[0],
            scenarioName: row[1],
            campaignCode: row[2],
            campaignName: row[3]
        };
    });
}

export const upsertCardQuery = `-- name: UpsertCard :exec
INSERT INTO card (
    card_code, card_name, real_name, type_code, type_name,
    faction_code, faction_name, encounter_code, encounter_name,
    encounter_position, position, text, back_text, flavor, traits,
    url, imagesrc, backimagesrc, back_flavor, raw_data,
    pack_code, pack_name, quantity
) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9,
    $10, $11, $12, $13, $14, $15,
    $16, $17, $18, $19, $20,
    $21, $22, $23
) ON CONFLICT (card_code) DO UPDATE SET
    card_name = EXCLUDED.card_name,
    real_name = EXCLUDED.real_name,
    type_code = EXCLUDED.type_code,
    type_name = EXCLUDED.type_name,
    faction_code = EXCLUDED.faction_code,
    faction_name = EXCLUDED.faction_name,
    encounter_code = EXCLUDED.encounter_code,
    encounter_name = EXCLUDED.encounter_name,
    encounter_position = EXCLUDED.encounter_position,
    position = EXCLUDED.position,
    text = EXCLUDED.text,
    back_text = EXCLUDED.back_text,
    flavor = EXCLUDED.flavor,
    traits = EXCLUDED.traits,
    url = EXCLUDED.url,
    imagesrc = EXCLUDED.imagesrc,
    backimagesrc = EXCLUDED.backimagesrc,
    back_flavor = EXCLUDED.back_flavor,
    raw_data = EXCLUDED.raw_data,
    pack_code = EXCLUDED.pack_code,
    pack_name = EXCLUDED.pack_name,
    quantity = EXCLUDED.quantity,
    updated_at = NOW()`;

export interface UpsertCardArgs {
    cardCode: string;
    cardName: string;
    realName: string | null;
    typeCode: string;
    typeName: string;
    factionCode: string;
    factionName: string;
    encounterCode: string | null;
    encounterName: string | null;
    encounterPosition: number | null;
    position: number | null;
    text: string | null;
    backText: string | null;
    flavor: string | null;
    traits: string[];
    url: string;
    imagesrc: string | null;
    backimagesrc: string | null;
    backFlavor: string | null;
    rawData: any;
    packCode: string;
    packName: string;
    quantity: number | null;
}

export async function upsertCard(client: Client, args: UpsertCardArgs): Promise<void> {
    await client.query({
        text: upsertCardQuery,
        values: [args.cardCode, args.cardName, args.realName, args.typeCode, args.typeName, args.factionCode, args.factionName, args.encounterCode, args.encounterName, args.encounterPosition, args.position, args.text, args.backText, args.flavor, args.traits, args.url, args.imagesrc, args.backimagesrc, args.backFlavor, args.rawData, args.packCode, args.packName, args.quantity],
        rowMode: "array"
    });
}

