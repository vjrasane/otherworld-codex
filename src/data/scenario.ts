import { z } from "astro/zod";
import type { RawCard } from "@/src/data/card";
import type { Meta } from "@/src/data/meta";
import type { RawCampaign } from "./campaign";

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

export type RawScenario = z.infer<typeof RawScenario>;

export type Scenario = RawScenario & {
  __type: "scenario";
  meta: Meta;
};

export const getScenarioCards = <
  TScenario extends RawScenario,
  TCard extends RawCard,
>(
  scenario: TScenario,
  cards: TCard[],
): TCard[] => {
  const encounterCards = cards
    .filter((c) => !!c.encounter_code)
    .filter((c) => scenario.encounterCodes.includes(c.encounter_code!));
  return encounterCards;
};

export const getScenarioTraits = (
  scenarios: RawScenario[],
  cards: RawCard[],
): string[] => {
  const getTraits = (s: RawScenario): string[] =>
    getScenarioCards(s, cards).flatMap((c) => c.traits ?? []);

  return [...new Set(scenarios.flatMap(getTraits)).values()];
};

export const getScenarioTypes = (
  scenarios: RawScenario[],
  cards: RawCard[],
): string[] => {
  const getTypes = (s: RawScenario): string[] =>
    getScenarioCards(s, cards).map((c) => c.type_code);

  return [...new Set(scenarios.flatMap(getTypes)).values()];
};

export const buildScenario = (
  scenario: RawScenario,
  campaign: RawCampaign,
  cards: RawCard[],
): Scenario => {
  return {
    ...scenario,
    __type: "scenario" as const,
    meta: {
      campaigns: [campaign.code],
      scenarios: [scenario.code],
      encounters: scenario.encounterCodes,
      traits: getScenarioTraits([scenario], cards),
      types: getScenarioTypes([scenario], cards),
      pools: ["mythos"],
    },
  };
};

export const buildStandalone = (
  standalone: RawScenario,
  cards: RawCard[],
): Scenario => {
  return {
    ...standalone,
    __type: "scenario" as const,
    meta: {
      campaigns: [],
      scenarios: [standalone.code],
      encounters: standalone.encounterCodes,
      traits: getScenarioTraits([standalone], cards),
      types: getScenarioTypes([standalone], cards),
      pools: ["mythos"],
    },
  };
};
