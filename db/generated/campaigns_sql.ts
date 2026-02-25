import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getCampaignByCodeQuery = `-- name: GetCampaignByCode :one
SELECT
    ca.campaign_code,
    ca.campaign_name,
    cv.image_url
FROM campaign ca
JOIN campaign_view cv ON ca.campaign_code = cv.campaign_code
WHERE ca.campaign_code = $1`;

export interface GetCampaignByCodeArgs {
    campaignCode: string;
}

export interface GetCampaignByCodeRow {
    campaignCode: string;
    campaignName: string;
    imageUrl: string | null;
}

export async function getCampaignByCode(client: Client, args: GetCampaignByCodeArgs): Promise<GetCampaignByCodeRow | null> {
    const result = await client.query({
        text: getCampaignByCodeQuery,
        values: [args.campaignCode],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        campaignCode: row[0],
        campaignName: row[1],
        imageUrl: row[2]
    };
}

export const getCampaignScenariosQuery = `-- name: GetCampaignScenarios :many
SELECT
    sv.scenario_code,
    sv.scenario_name,
    sv.scenario_prefix,
    sv.position,
    sv.image_url
FROM scenario_view sv
WHERE sv.campaign_code = $1
ORDER BY sv.position`;

export interface GetCampaignScenariosArgs {
    campaignCode: string | null;
}

export interface GetCampaignScenariosRow {
    scenarioCode: string;
    scenarioName: string;
    scenarioPrefix: string | null;
    position: number;
    imageUrl: string | null;
}

export async function getCampaignScenarios(client: Client, args: GetCampaignScenariosArgs): Promise<GetCampaignScenariosRow[]> {
    const result = await client.query({
        text: getCampaignScenariosQuery,
        values: [args.campaignCode],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            scenarioCode: row[0],
            scenarioName: row[1],
            scenarioPrefix: row[2],
            position: row[3],
            imageUrl: row[4]
        };
    });
}

export const upsertCampaignQuery = `-- name: UpsertCampaign :exec
INSERT INTO campaign (campaign_code, campaign_name)
VALUES ($1, $2)
ON CONFLICT (campaign_code) DO UPDATE SET
    campaign_name = EXCLUDED.campaign_name,
    updated_at = NOW()`;

export interface UpsertCampaignArgs {
    campaignCode: string;
    campaignName: string;
}

export async function upsertCampaign(client: Client, args: UpsertCampaignArgs): Promise<void> {
    await client.query({
        text: upsertCampaignQuery,
        values: [args.campaignCode, args.campaignName],
        rowMode: "array"
    });
}

export const upsertScenarioQuery = `-- name: UpsertScenario :exec
INSERT INTO scenario (scenario_code, scenario_name, scenario_prefix, campaign_code, position)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (scenario_code) DO UPDATE SET
    scenario_name = EXCLUDED.scenario_name,
    scenario_prefix = EXCLUDED.scenario_prefix,
    campaign_code = EXCLUDED.campaign_code,
    position = EXCLUDED.position,
    updated_at = NOW()`;

export interface UpsertScenarioArgs {
    scenarioCode: string;
    scenarioName: string;
    scenarioPrefix: string | null;
    campaignCode: string | null;
    position: number;
}

export async function upsertScenario(client: Client, args: UpsertScenarioArgs): Promise<void> {
    await client.query({
        text: upsertScenarioQuery,
        values: [args.scenarioCode, args.scenarioName, args.scenarioPrefix, args.campaignCode, args.position],
        rowMode: "array"
    });
}

export const upsertEncounterSetScenarioQuery = `-- name: UpsertEncounterSetScenario :exec
INSERT INTO encounter_set_scenario (encounter_code, scenario_code, position)
VALUES ($1, $2, $3)
ON CONFLICT (encounter_code, scenario_code) DO UPDATE SET
    position = EXCLUDED.position`;

export interface UpsertEncounterSetScenarioArgs {
    encounterCode: string;
    scenarioCode: string;
    position: number;
}

export async function upsertEncounterSetScenario(client: Client, args: UpsertEncounterSetScenarioArgs): Promise<void> {
    await client.query({
        text: upsertEncounterSetScenarioQuery,
        values: [args.encounterCode, args.scenarioCode, args.position],
        rowMode: "array"
    });
}

