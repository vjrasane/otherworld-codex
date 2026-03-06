import { z } from "astro/zod";
import type { RawCard } from "@/src/data/card";

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

export const buildScenario = (scenario: RawScenario): Scenario => {
  return {
    ...scenario,
    __type: "scenario" as const,
  };
};

export const buildStandalone = (standalone: RawScenario): Scenario => {
  return {
    ...standalone,
    __type: "scenario" as const,
  };
};
