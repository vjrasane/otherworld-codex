-- name: GetScenarioByCode :one
SELECT
    s.scenario_code,
    s.scenario_name,
    s.scenario_prefix,
    s.campaign_code,
    s.position,
    sv.image_url
FROM scenario s
JOIN scenario_view sv ON s.scenario_code = sv.scenario_code
WHERE s.scenario_code = $1;

-- name: GetScenarioEncounterSets :many
SELECT
    es.encounter_code,
    es.encounter_name,
    ess.position
FROM encounter_set_scenario ess
JOIN encounter_set es ON ess.encounter_code = es.encounter_code
WHERE ess.scenario_code = $1
ORDER BY ess.position;

-- name: GetScenarioCards :many
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
ORDER BY ess.position, c.card_code;
