CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE campaign (
    campaign_code VARCHAR(255) PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE scenario (
    scenario_code VARCHAR(255) PRIMARY KEY,
    scenario_name VARCHAR(255) NOT NULL,
    scenario_prefix VARCHAR(255),
    campaign_code VARCHAR(255) REFERENCES campaign(campaign_code) ON DELETE CASCADE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    position INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_scenario_campaign ON scenario (campaign_code);

CREATE TABLE card (
    card_code VARCHAR(255) PRIMARY KEY,
    card_name VARCHAR(255) NOT NULL,
    real_name VARCHAR(255),
    type_code VARCHAR(255) NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    faction_code VARCHAR(255) NOT NULL,
    faction_name VARCHAR(255) NOT NULL,
    encounter_code VARCHAR(255),
    encounter_name VARCHAR(255),
    encounter_position INTEGER,
    position INTEGER,
    text TEXT,
    back_text TEXT,
    flavor TEXT,
    traits TEXT[] NOT NULL DEFAULT '{}',
    url TEXT NOT NULL,
    imagesrc TEXT,
    backimagesrc TEXT,
    back_flavor TEXT,
    raw_data JSON NOT NULL,
    pack_code VARCHAR(255) NOT NULL,
    pack_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    quantity INTEGER,
    image_url TEXT GENERATED ALWAYS AS (
        CASE WHEN imagesrc IS NOT NULL THEN 'https://arkhamdb.com' || imagesrc ELSE NULL END
    ) STORED
);

CREATE INDEX idx_card_name_trgm ON card USING gin(card_name gin_trgm_ops);
CREATE INDEX idx_card_traits ON card USING gin(traits);
CREATE INDEX idx_card_pack ON card (pack_code, pack_name);
CREATE INDEX idx_card_encounter ON card (encounter_code, encounter_name) WHERE encounter_code IS NOT NULL;
CREATE INDEX idx_card_encounter_type ON card (encounter_code, type_code);
CREATE INDEX idx_card_type ON card (type_code);

CREATE TABLE encounter_set_scenario (
    encounter_code VARCHAR(255) NOT NULL,
    scenario_code VARCHAR(255) NOT NULL REFERENCES scenario(scenario_code) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (encounter_code, scenario_code)
);

CREATE INDEX idx_ess_scenario ON encounter_set_scenario (scenario_code);

CREATE VIEW pack AS
    SELECT DISTINCT ON (pack_code)
        pack_code, pack_name, image_url, type_code
    FROM card
    ORDER BY pack_code, card_code;

CREATE VIEW encounter_set AS
    SELECT DISTINCT ON (encounter_code)
        encounter_code, encounter_name, image_url, type_code, pack_name
    FROM card
    WHERE encounter_code IS NOT NULL
    ORDER BY encounter_code, card_code;

CREATE VIEW trait AS
    SELECT DISTINCT ON (trait_name)
        trait_name, c.image_url, c.type_code, c.pack_name
    FROM card c, unnest(c.traits) AS trait_name
    ORDER BY trait_name, c.card_code;

CREATE VIEW scenario_view AS
    SELECT DISTINCT ON (s.scenario_code)
        s.*,
        c.image_url,
        c.type_code,
        c.pack_name
    FROM scenario s
    LEFT JOIN encounter_set_scenario ess ON s.scenario_code = ess.scenario_code
    LEFT JOIN card c ON ess.encounter_code = c.encounter_code AND c.type_code = 'scenario'
    ORDER BY s.scenario_code, c.image_url NULLS LAST;

CREATE VIEW campaign_view AS
    SELECT DISTINCT ON (ca.campaign_code)
        ca.*,
        c.image_url,
        c.type_code,
        c.pack_name
    FROM campaign ca
    LEFT JOIN scenario s ON ca.campaign_code = s.campaign_code
    LEFT JOIN encounter_set_scenario ess ON s.scenario_code = ess.scenario_code
    LEFT JOIN card c ON ess.encounter_code = c.encounter_code AND c.type_code = 'scenario'
    ORDER BY ca.campaign_code, c.image_url NULLS LAST;

CREATE VIEW search_view AS
    SELECT
        'card'::TEXT AS type,
        card_code AS code,
        card_name AS name,
        image_url,
        type_code,
        pack_name
    FROM card
    WHERE type_code != 'scenario'

    UNION ALL

    SELECT
        'pack'::TEXT AS type,
        pack_code AS code,
        pack_name AS name,
        image_url,
        type_code,
        pack_name
    FROM pack

    UNION ALL

    SELECT
        'campaign'::TEXT AS type,
        campaign_code AS code,
        campaign_name AS name,
        image_url,
        type_code,
        pack_name
    FROM campaign_view

    UNION ALL

    SELECT
        'scenario'::TEXT AS type,
        scenario_code AS code,
        scenario_name AS name,
        image_url,
        type_code,
        pack_name
    FROM scenario_view

    UNION ALL

    SELECT
        'encounter'::TEXT AS type,
        es.encounter_code AS code,
        es.encounter_name AS name,
        es.image_url,
        es.type_code,
        es.pack_name
    FROM encounter_set es
    WHERE NOT EXISTS (
        SELECT 1 FROM scenario s WHERE s.scenario_code = es.encounter_code
    )

    UNION ALL

    SELECT
        'trait'::TEXT AS type,
        trait_name AS code,
        trait_name AS name,
        image_url,
        type_code,
        pack_name
    FROM trait;
