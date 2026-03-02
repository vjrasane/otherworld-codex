import standalonesJson from "../../data/standalones.json";
import type { Card } from "./card";

export interface Standalone {
  code: string;
  name: string;
  order: number;
  encounterCodes: string[];
  imageUrl?: string;
}

export interface Scenario {
  code: string;
  name: string;
  header?: string;
  order: number;
  campaignCode: string;
  campaignName: string;
  encounterCodes: string[];
  imageUrl?: string;
}

export interface Campaign {
  code: string;
  name: string;
  order: number;
  scenarios: Scenario[];
  imageUrl?: string;
}

const getCardsByEncounter = (cards: Card[]): Map<string, Card[]> => {
  const cardsByEncounter = new Map<string, Card[]>();
  for (const card of cards) {
    if (card.encounterCode) {
      const list = cardsByEncounter.get(card.encounterCode) ?? [];
      list.push(card);
      cardsByEncounter.set(card.encounterCode, list);
    }
  }
  return cardsByEncounter;
};

export const parseCampaigns = (rawArray: any[], cards: Card[]): Campaign[] => {
  const cardsByEncounter = getCardsByEncounter(cards);
  const campaigns: Campaign[] = rawArray.map((raw) => {
    const scenarios: Scenario[] = raw.scenarios.map((s) => {
      const encounterCards: Card[] = s.encounterCodes.flatMap(
        (ec: string) => cardsByEncounter.get(ec) ?? [],
      );
      const imageCard = encounterCards.find((c) => c.imageUrl);
      return {
        code: s.scenarioCode,
        name: s.scenarioName,
        header: s.scenarioHeader || undefined,
        order: s.scenarioOrder,
        campaignCode: raw.campaignCode,
        campaignName: raw.campaignName,
        encounterCodes: s.encounterCodes,
        imageUrl: imageCard?.imageUrl,
      };
    });
    scenarios.sort((a, b) => a.order - b.order);
    const imageUrl = scenarios[0]?.imageUrl;
    return {
      code: raw.campaignCode,
      name: raw.campaignName,
      order: raw.campaignOrder,
      scenarios,
      imageUrl,
    };
  });
  campaigns.sort((a, b) => a.order - b.order);
  return campaigns;
};

export const parseStandalones = (
  rawArray: any[],
  cards: Card[],
): Standalone[] => {
  const cardsByEncounter = getCardsByEncounter(cards);
  const standalones: Standalone[] = rawArray.map((raw) => {
    const encounterCards: Card[] = raw.encounterCodes.flatMap(
      (ec: string) => cardsByEncounter.get(ec) ?? [],
    );
    const imageCard = encounterCards.find((c) => c.imageUrl);
    return {
      code: raw.scenarioCode,
      name: raw.scenarioName,
      order: raw.scenarioOrder,
      encounterCodes: raw.encounterCodes,
      imageUrl: imageCard?.imageUrl,
    };
  });
  standalones.sort((a, b) => a.order - b.order);
  return standalones;
};
