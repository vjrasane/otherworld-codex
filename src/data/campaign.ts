import { z } from "astro/zod";
import type { RawCard } from "@/src/data/card";
import { RawScenario, getScenarioCards } from "./scenario";

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

export const buildCampaigns = (raw: RawCampaign[]): Campaign[] => {
  return raw.map((c) => {
    const { scenarios, ...rest } = c;
    return {
      ...rest,
      __type: "campaign" as const,
    };
  });
};
