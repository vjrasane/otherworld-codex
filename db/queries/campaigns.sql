-- name: GetCampaignByCode :one
SELECT
    ca.campaign_code,
    ca.campaign_name,
    cv.image_url
FROM campaign ca
JOIN campaign_view cv ON ca.campaign_code = cv.campaign_code
WHERE ca.campaign_code = $1;

-- name: GetCampaignScenarios :many
SELECT
    sv.scenario_code,
    sv.scenario_name,
    sv.scenario_prefix,
    sv.position,
    sv.image_url
FROM scenario_view sv
WHERE sv.campaign_code = $1
ORDER BY sv.position;

-- name: UpsertCampaign :exec
INSERT INTO campaign (campaign_code, campaign_name)
VALUES ($1, $2)
ON CONFLICT (campaign_code) DO UPDATE SET
    campaign_name = EXCLUDED.campaign_name,
    updated_at = NOW();

-- name: UpsertScenario :exec
INSERT INTO scenario (scenario_code, scenario_name, scenario_prefix, campaign_code, position)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (scenario_code) DO UPDATE SET
    scenario_name = EXCLUDED.scenario_name,
    scenario_prefix = EXCLUDED.scenario_prefix,
    campaign_code = EXCLUDED.campaign_code,
    position = EXCLUDED.position,
    updated_at = NOW();

-- name: UpsertEncounterSetScenario :exec
INSERT INTO encounter_set_scenario (encounter_code, scenario_code, position)
VALUES ($1, $2, $3)
ON CONFLICT (encounter_code, scenario_code) DO UPDATE SET
    position = EXCLUDED.position;
