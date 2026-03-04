import { z } from "astro/zod";
import type { Card } from "@/src/data/card";

export const RawScenario = z.object({
  code: z.string(),
  name: z.string(),
  header: z.string().optional(),
  order: z.number(),
  campaignCode: z.string(),
  campaignName: z.string(),
  encounterCodes: z.array(z.string()),
});

export type Scenario = RawScenario & {
  imageUrl?: string;
};

export const RawCampaign = z.object({
  code: z.string(),
  name: z.string(),
  order: z.number(),
  scenarios: z.array(RawScenario),
});

export type RawScenario = z.infer<typeof RawScenario>;
export type RawCampaign = z.infer<typeof RawCampaign>;

export interface Campaign {
  code: string;
  name: string;
  order: number;
  scenarios: Scenario[];
  imageUrl?: string;
}

export const buildScenarios = (
  raw: RawScenario[],
  cards: Card[],
): Scenario[] => {
  return raw.map((s) => {
    const imageCard = cards.find((c) => c.meta.scenarios?.includes(s.code));
    return { ...s, imageUrl: imageCard?.meta.imageUrl };
  });
};

export const buildCampaigns = (
  raw: RawCampaign[],
  cards: Card[],
): Campaign[] => {
  return raw.map((c) => {
    return {
      ...c,
      scenarios: buildScenarios(c.scenarios, cards),
    };
  });
};
