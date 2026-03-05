import { z } from "astro/zod";
import type { Card, RawCard } from "@/src/data/card";
import type { Meta } from "@/src/data/meta";

export const RawScenario = z
  .object({
    scenarioCode: z.string(),
    scenarioName: z.string(),
    scenarioHeader: z.string().optional(),
    scenarioOrder: z.number(),
    encounterCodes: z.array(z.string()),
  })
  .transform((s) => ({
    code: s.scenarioCode,
    name: s.scenarioName,
    order: s.scenarioOrder,
    header: s.scenarioHeader,
    encounterCodes: s.encounterCodes,
  }));

export type Scenario = RawScenario & {
  meta: Meta;
};

export const RawCampaign = z
  .object({
    campaignCode: z.string(),
    campaignName: z.string(),
    campaignOrder: z.number(),
    scenarios: z.array(RawScenario),
  })
  .transform((c) => ({
    code: c.campaignCode,
    name: c.campaignName,
    order: c.campaignOrder,
    scenarios: c.scenarios,
  }));

export type RawScenario = z.infer<typeof RawScenario>;
export type RawCampaign = z.infer<typeof RawCampaign>;

export type Campaign = RawCampaign & {
  scenarios: Scenario[];
  meta: Meta;
};

export const getCampaignCards = <
  TCampaign extends RawCampaign,
  TCard extends RawCard,
>(
  campaign: TCampaign,
  cards: TCard[],
) => {
  return campaign.scenarios.flatMap((s) => getScenarioCards(s, cards));
};

const getScenarioCards = <TScenario extends RawScenario, TCard extends RawCard>(
  scenario: TScenario,
  cards: TCard[],
): TCard[] => {
  const encounterCards = cards
    .filter((c) => !!c.encounter_code)
    .filter((c) => scenario.encounterCodes.includes(c.encounter_code!));
  return encounterCards;
};

const getScenarioTraits = (
  scenarios: RawScenario[],
  cards: Card[],
): string[] => {
  const getTraits = (s: RawScenario): string[] =>
    getScenarioCards(s, cards).flatMap((c) => c.traits ?? []);

  return [...new Set(scenarios.flatMap(getTraits)).values()];
};

const getScenarioTypes = (
  scenarios: RawScenario[],
  cards: Card[],
): string[] => {
  const getTypes = (s: RawScenario): string[] =>
    getScenarioCards(s, cards).map((c) => c.type_code);

  return [...new Set(scenarios.flatMap(getTypes)).values()];
};

const buildScenarioMeta = (
  scenario: RawScenario,
  campaigns: RawCampaign[],
  cards: Card[],
): Meta => {
  const campaignsMeta = campaigns
    .filter((c) => c.scenarios.some((s) => s.code === scenario.code))
    .map((c) => c.code);
  const traits = getScenarioTraits([scenario], cards);
  const types = getScenarioTypes([scenario], cards);
  return {
    campaigns: campaignsMeta,
    encounters: scenario.encounterCodes,
    traits,
    types,
  };
};

export const buildScenarios = (
  raw: RawScenario[],
  campaigns: RawCampaign[],
  cards: Card[],
): Scenario[] => {
  return raw.map((s) => {
    return {
      ...s,
      meta: buildScenarioMeta(s, campaigns, cards),
    };
  });
};

const buildCampaignMeta = (campaign: RawCampaign, cards: Card[]): Meta => {
  const scenariosMeta = campaign.scenarios.map((s) => s.code);
  const encountersMeta = campaign.scenarios.flatMap((s) => s.encounterCodes);
  const traits = getScenarioTraits(campaign.scenarios, cards);
  const types = getScenarioTypes(campaign.scenarios, cards);
  return {
    scenarios: scenariosMeta,
    encounters: encountersMeta,
    traits,
    types,
  };
};

export const buildCampaigns = (
  raw: RawCampaign[],
  cards: Card[],
): Campaign[] => {
  return raw.map((c) => {
    return {
      ...c,
      scenarios: buildScenarios(c.scenarios, raw, cards),
      meta: buildCampaignMeta(c, cards),
    };
  });
};
