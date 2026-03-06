import { z } from "astro/zod";
import type { Card, RawCard } from "@/src/data/card";
import type { Meta } from "@/src/data/meta";
import {
  RawScenario,
  getScenarioCards,
  getScenarioTraits,
  getScenarioTypes,
} from "./scenario";

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

export type RawCampaign = z.infer<typeof RawCampaign>;

export type Campaign = Omit<RawCampaign, "scenarios"> & {
  __type: "campaign";
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

const buildCampaignMeta = (campaign: RawCampaign, cards: Card[]) => {
  const scenariosMeta = campaign.scenarios.map((s) => s.code);
  const encountersMeta = campaign.scenarios.flatMap((s) => s.encounterCodes);
  const traits = getScenarioTraits(campaign.scenarios, cards);
  const types = getScenarioTypes(campaign.scenarios, cards);
  return {
    type: "campaign" as const,
    campaigns: [campaign.code],
    scenarios: scenariosMeta,
    encounters: encountersMeta,
    traits,
    types,
    pools: ["mythos"],
  };
};

export const buildCampaigns = (
  raw: RawCampaign[],
  cards: Card[],
): Campaign[] => {
  return raw.map((c) => {
    return {
      ...c,
      __type: "campaign" as const,
      meta: buildCampaignMeta(c, cards),
    };
  });
};
