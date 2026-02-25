-- migrate:up

CREATE FUNCTION immutable_to_tsvector(config regconfig, input text) RETURNS tsvector AS $$
SELECT to_tsvector(config, input);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

CREATE FUNCTION immutable_array_to_string(arr text[], sep text) RETURNS text AS $$
SELECT array_to_string(arr, sep);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;

CREATE TABLE campaign (
    campaign_code VARCHAR(255) PRIMARY KEY,
    campaign_name VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    full_text_search TSVECTOR GENERATED ALWAYS AS (
        setweight(immutable_to_tsvector('english', coalesce(campaign_name, '')), 'A')
    ) STORED
);

CREATE INDEX idx_campaign_search ON campaign USING gin(full_text_search);

CREATE TABLE scenario (
    scenario_code VARCHAR(255) PRIMARY KEY,
    scenario_name VARCHAR(255) NOT NULL,
    scenario_prefix VARCHAR(255),
    campaign_code VARCHAR(255) REFERENCES campaign(campaign_code) ON DELETE CASCADE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    position INTEGER NOT NULL DEFAULT 1,
    full_text_search TSVECTOR GENERATED ALWAYS AS (
        setweight(immutable_to_tsvector('english', coalesce(scenario_name, '')), 'A')
    ) STORED
);

CREATE INDEX idx_scenario_search ON scenario USING gin(full_text_search);
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
    ) STORED,
    full_text_search TSVECTOR GENERATED ALWAYS AS (
        setweight(immutable_to_tsvector('english', coalesce(card_name, '')), 'A') ||
        setweight(immutable_to_tsvector('english', coalesce(real_name, '')), 'A') ||
        setweight(immutable_to_tsvector('english', coalesce(text, '')), 'C') ||
        setweight(immutable_to_tsvector('english', coalesce(back_text, '')), 'C') ||
        setweight(immutable_to_tsvector('english', coalesce(immutable_array_to_string(traits, ' '), '')), 'B') ||
        setweight(immutable_to_tsvector('english', coalesce(flavor, '')), 'D') ||
        setweight(immutable_to_tsvector('english', coalesce(back_flavor, '')), 'D')
    ) STORED
);

CREATE INDEX idx_card_search ON card USING gin(full_text_search);
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
        pack_code, pack_name, image_url
    FROM card
    ORDER BY pack_code, card_code;

CREATE VIEW encounter_set AS
    SELECT DISTINCT ON (encounter_code)
        encounter_code, encounter_name, image_url
    FROM card
    WHERE encounter_code IS NOT NULL
    ORDER BY encounter_code, card_code;

CREATE VIEW trait AS
    SELECT DISTINCT ON (trait_name)
        trait_name, c.image_url
    FROM card c, unnest(c.traits) AS trait_name
    ORDER BY trait_name, c.card_code;

CREATE VIEW scenario_view AS
    SELECT DISTINCT ON (s.scenario_code)
        s.*,
        c.image_url
    FROM scenario s
    LEFT JOIN encounter_set_scenario ess ON s.scenario_code = ess.scenario_code
    LEFT JOIN card c ON ess.encounter_code = c.encounter_code AND c.type_code = 'scenario';

CREATE VIEW campaign_view AS
    SELECT DISTINCT ON (ca.campaign_code)
        ca.*,
        c.image_url
    FROM campaign ca
    LEFT JOIN scenario s ON ca.campaign_code = s.campaign_code
    LEFT JOIN encounter_set_scenario ess ON s.scenario_code = ess.scenario_code
    LEFT JOIN card c ON ess.encounter_code = c.encounter_code AND c.type_code = 'scenario';

CREATE VIEW search_view AS
    SELECT
        'card'::TEXT AS type,
        card_code AS code,
        card_name AS name,
        image_url,
        full_text_search
    FROM card
    WHERE type_code != 'scenario'

    UNION ALL

    SELECT
        'pack'::TEXT AS type,
        pack_code AS code,
        pack_name AS name,
        image_url,
        to_tsvector('english', coalesce(pack_name, ''))
    FROM pack

    UNION ALL

    SELECT
        'campaign'::TEXT AS type,
        campaign_code AS code,
        campaign_name AS name,
        image_url,
        full_text_search
    FROM campaign_view

    UNION ALL

    SELECT
        'scenario'::TEXT AS type,
        scenario_code AS code,
        scenario_name AS name,
        image_url,
        full_text_search
    FROM scenario_view

    UNION ALL

    SELECT
        'encounter'::TEXT AS type,
        es.encounter_code AS code,
        es.encounter_name AS name,
        es.image_url,
        to_tsvector('english', coalesce(es.encounter_name, ''))
    FROM encounter_set es
    JOIN encounter_set_scenario ess ON es.encounter_code = ess.encounter_code
    WHERE ess.position != 1

    UNION ALL

    SELECT
        'trait'::TEXT AS type,
        trait_name AS code,
        trait_name AS name,
        image_url,
        to_tsvector('english', coalesce(trait_name, ''))
    FROM trait;

-- migrate:down

DROP VIEW IF EXISTS search_view;
DROP VIEW IF EXISTS campaign_view;
DROP VIEW IF EXISTS scenario_view;
DROP VIEW IF EXISTS trait;
DROP VIEW IF EXISTS encounter_set;
DROP VIEW IF EXISTS pack;
DROP TABLE IF EXISTS encounter_set_scenario;
DROP TABLE IF EXISTS card;
DROP TABLE IF EXISTS scenario;
DROP TABLE IF EXISTS campaign;
DROP FUNCTION IF EXISTS immutable_array_to_string;
DROP FUNCTION IF EXISTS immutable_to_tsvector;
