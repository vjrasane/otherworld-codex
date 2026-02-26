-- name: GetEncounterSetByCode :one
SELECT
    es.encounter_code,
    es.encounter_name,
    es.image_url
FROM encounter_set es
WHERE es.encounter_code = $1;

-- name: GetEncounterSetScenarios :many
SELECT
    s.scenario_code,
    s.scenario_name,
    s.campaign_code,
    ca.campaign_name
FROM encounter_set_scenario ess
JOIN scenario s ON ess.scenario_code = s.scenario_code
JOIN campaign ca ON s.campaign_code = ca.campaign_code
WHERE ess.encounter_code = $1
ORDER BY s.position;

-- name: GetEncounterSetCards :many
SELECT
    c.card_code,
    c.card_name,
    c.type_code,
    c.type_name,
    c.traits,
    c.quantity,
    c.image_url
FROM card c
WHERE c.encounter_code = $1
ORDER BY c.card_code;
