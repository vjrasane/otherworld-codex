import {
  campaigns,
  scenariosByCode,
  standalones,
  type Campaign,
} from "./campaign";
import { encounterCards, cardsByEncounter, type Card } from "./card";
import { encounterSets } from "./encounter-set";

export interface SearchEntry {
  id: string;
  type: "card" | "encounter" | "scenario" | "campaign";
  code: string;
  name: string;
  xp?: number;
  subname?: string;
  imageUrl?: string;
  typeCode?: string;
  packName?: string;
  campaignName?: string;
}

export const searchIndex: SearchEntry[] = [];

for (const card of encounterCards) {
  searchIndex.push({
    id: `card:${card.code}`,
    type: "card",
    code: card.code,
    name: card.name,
    xp: card.xp,
    subname: card.subname,
    imageUrl: card.imageUrl,
    typeCode: card.typeCode,
    packName: card.packName,
  });
}

for (const es of encounterSets.values()) {
  searchIndex.push({
    id: `encounter:${es.code}`,
    type: "encounter",
    code: es.code,
    name: es.name,
    imageUrl: es.imageUrl,
    packName: es.packName,
  });
}

for (const s of scenariosByCode.values()) {
  searchIndex.push({
    id: `scenario:${s.code}`,
    type: "scenario",
    code: s.code,
    name: s.name,
    imageUrl: s.imageUrl,
    campaignName: s.campaignName,
  });
}

for (const s of standalones) {
  searchIndex.push({
    id: `scenario:${s.code}`,
    type: "scenario",
    code: s.code,
    name: s.name,
    imageUrl: s.imageUrl,
  });
}

for (const c of campaigns) {
  searchIndex.push({
    id: `campaign:${c.code}`,
    type: "campaign",
    code: c.code,
    name: c.name,
    imageUrl: c.imageUrl,
  });
}

export function getCampaignCards(campaign: Campaign): Card[] {
  const seen = new Set<string>();
  const cards: Card[] = [];
  for (const s of campaign.scenarios) {
    for (const ec of s.encounterCodes) {
      for (const card of cardsByEncounter.get(ec) ?? []) {
        if (!seen.has(card.code)) {
          seen.add(card.code);
          cards.push(card);
        }
      }
    }
  }
  return cards;
}
