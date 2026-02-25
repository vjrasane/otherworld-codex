import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getScenarioByCodeQuery = `-- name: GetScenarioByCode :one
SELECT
    s.scenario_code,
    s.scenario_name,
    s.scenario_prefix,
    s.campaign_code,
    s.position,
    sv.image_url
FROM scenario s
JOIN scenario_view sv ON s.scenario_code = sv.scenario_code
WHERE s.scenario_code = $1`;

export interface GetScenarioByCodeArgs {
    scenarioCode: string;
}

export interface GetScenarioByCodeRow {
    scenarioCode: string;
    scenarioName: string;
    scenarioPrefix: string | null;
    campaignCode: string | null;
    position: number;
    imageUrl: string | null;
}

export async function getScenarioByCode(client: Client, args: GetScenarioByCodeArgs): Promise<GetScenarioByCodeRow | null> {
    const result = await client.query({
        text: getScenarioByCodeQuery,
        values: [args.scenarioCode],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        scenarioCode: row[0],
        scenarioName: row[1],
        scenarioPrefix: row[2],
        campaignCode: row[3],
        position: row[4],
        imageUrl: row[5]
    };
}

export const getScenarioEncounterSetsQuery = `-- name: GetScenarioEncounterSets :many
SELECT
    es.encounter_code,
    es.encounter_name,
    ess.position
FROM encounter_set_scenario ess
JOIN encounter_set es ON ess.encounter_code = es.encounter_code
WHERE ess.scenario_code = $1
ORDER BY ess.position`;

export interface GetScenarioEncounterSetsArgs {
    scenarioCode: string;
}

export interface GetScenarioEncounterSetsRow {
    encounterCode: string | null;
    encounterName: string | null;
    position: number;
}

export async function getScenarioEncounterSets(client: Client, args: GetScenarioEncounterSetsArgs): Promise<GetScenarioEncounterSetsRow[]> {
    const result = await client.query({
        text: getScenarioEncounterSetsQuery,
        values: [args.scenarioCode],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            encounterCode: row[0],
            encounterName: row[1],
            position: row[2]
        };
    });
}

export const getScenarioCardsQuery = `-- name: GetScenarioCards :many
SELECT
    c.card_code,
    c.card_name,
    c.type_code,
    c.type_name,
    c.encounter_code,
    c.traits,
    c.quantity,
    c.image_url
FROM encounter_set_scenario ess
JOIN card c ON ess.encounter_code = c.encounter_code
WHERE ess.scenario_code = $1
ORDER BY ess.position, c.card_code`;

export interface GetScenarioCardsArgs {
    scenarioCode: string;
}

export interface GetScenarioCardsRow {
    cardCode: string;
    cardName: string;
    typeCode: string;
    typeName: string;
    encounterCode: string | null;
    traits: string[];
    quantity: number | null;
    imageUrl: string | null;
}

export async function getScenarioCards(client: Client, args: GetScenarioCardsArgs): Promise<GetScenarioCardsRow[]> {
    const result = await client.query({
        text: getScenarioCardsQuery,
        values: [args.scenarioCode],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            cardCode: row[0],
            cardName: row[1],
            typeCode: row[2],
            typeName: row[3],
            encounterCode: row[4],
            traits: row[5],
            quantity: row[6],
            imageUrl: row[7]
        };
    });
}

