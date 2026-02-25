-- name: GetCardByCode :one
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
WHERE c.card_code = $1;

-- name: GetCardScenarios :many
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

-- name: UpsertCard :exec
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
    updated_at = NOW();
