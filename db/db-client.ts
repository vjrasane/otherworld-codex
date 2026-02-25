import { getClient } from "./client";
import { search as searchQuery } from "./generated/search_sql";
import { getCardByCode as getCardByCodeQuery, getCardScenarios } from "./generated/cards_sql";
import {
    getScenarioByCode as getScenarioByCodeQuery,
    getScenarioEncounterSets,
    getScenarioCards,
} from "./generated/scenarios_sql";
import {
    getCampaignByCode as getCampaignByCodeQuery,
    getCampaignScenarios,
} from "./generated/campaigns_sql";
import { groupBy } from "lodash/fp";

export interface SearchResult {
    type: string;
    code: string;
    name: string;
    imageUrl: string | null;
}

export const search = async (query: string, limit: number): Promise<SearchResult[]> => {
    const tsquery = query
        .split(" ")
        .map((w) => w.trim())
        .filter((w) => w.length)
        .map((w) => w + ":*")
        .join(" & ");
    const client = getClient();
    const results = await searchQuery(client, { toTsquery: tsquery, limit: String(limit) });
    return results.map((r) => ({
        type: r.type,
        code: r.code,
        name: r.name,
        imageUrl: r.imageUrl,
    }));
};

export const getCardByCode = async (code: string) => {
    const client = getClient();
    const card = await getCardByCodeQuery(client, { cardCode: code });
    if (!card) return null;

    const scenarios = card.encounterCode
        ? await getCardScenarios(client, { encounterCode: card.encounterCode })
        : [];

    return {
        ...card,
        scenarios,
    };
};

export const getScenarioByCode = async (code: string) => {
    const client = getClient();
    const scenario = await getScenarioByCodeQuery(client, { scenarioCode: code });
    if (!scenario) return null;

    const [encounterSetsRaw, cardsRaw] = await Promise.all([
        getScenarioEncounterSets(client, { scenarioCode: code }),
        getScenarioCards(client, { scenarioCode: code }),
    ]);

    const cardsByEncounter = groupBy("encounterCode", cardsRaw);

    const encounterSets = encounterSetsRaw.map((es) => ({
        ...es,
        cards: (es.encounterCode && cardsByEncounter[es.encounterCode]) ?? [],
    }));

    return {
        ...scenario,
        encounterSets,
    };
};

export const getCampaignByCode = async (code: string) => {
    const client = getClient();
    const campaign = await getCampaignByCodeQuery(client, { campaignCode: code });
    if (!campaign) return null;

    const scenarios = await getCampaignScenarios(client, { campaignCode: code });

    return {
        ...campaign,
        scenarios,
    };
};
