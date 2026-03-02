import type { Campaign, Standalone } from "./campaign";
import type { Card } from "./card";

export const buildCardMeta = (
  cards: Card[],
  campaigns: Campaign[],
  standalones: Standalone[],
) => {
  // Reverse maps: encounterCode → campaign/scenario codes
  const encounterToCampaigns = new Map<string, Set<string>>();
  const encounterToScenarios = new Map<string, Set<string>>();

  for (const campaign of campaigns) {
    for (const scenario of campaign.scenarios) {
      for (const ec of scenario.encounterCodes) {
        if (!encounterToCampaigns.has(ec))
          encounterToCampaigns.set(ec, new Set());
        encounterToCampaigns.get(ec)!.add(campaign.code);

        if (!encounterToScenarios.has(ec))
          encounterToScenarios.set(ec, new Set());
        encounterToScenarios.get(ec)!.add(scenario.code);
      }
    }
  }

  for (const standalone of standalones) {
    for (const ec of standalone.encounterCodes) {
      if (!encounterToScenarios.has(ec))
        encounterToScenarios.set(ec, new Set());
      encounterToScenarios.get(ec)!.add(standalone.code);
    }
  }

  // Per-card metadata for filter matching
  const cardMeta: Record<
    string,
    {
      campaignCodes: string[];
      scenarioCodes: string[];
      encounterCode: string;
      traits: string[];
    }
  > = {};
  for (const card of cards) {
    const ec = card.encounterCode!;
    const traits = card.traits
      ? card.traits
          .split(".")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    cardMeta[card.code] = {
      campaignCodes: [...(encounterToCampaigns.get(ec) ?? [])],
      scenarioCodes: [...(encounterToScenarios.get(ec) ?? [])],
      encounterCode: ec,
      traits,
    };
  }
  return cardMeta;
};
