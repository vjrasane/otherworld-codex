import type { Campaign } from "./campaign";
import { type Card } from "./card";
import { type EncounterSet } from "./encounter-set";
import type { Scenario } from "./scenario";

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
//
// const getScenariosByCode = (campaigns: Campaign[]): Map<string, Scenario> => {
//   const scenariosByCode = new Map<string, Scenario>();
//   for (const c of campaigns) {
//     for (const s of c.scenarios) {
//       scenariosByCode.set(s.code, s);
//     }
//   }
//   return scenariosByCode;
// };
//
// const getCardsByEncounter = (cards: Card[]): Map<string, Card[]> => {
//   const cardsByEncounter = new Map<string, Card[]>();
//   for (const card of cards) {
//     if (card.encounterCode) {
//       const list = cardsByEncounter.get(card.encounterCode) ?? [];
//       list.push(card);
//       cardsByEncounter.set(card.encounterCode, list);
//     }
//   }
//   return cardsByEncounter;
// };
//
// const getEncounterSets = (cards: Card[]): Map<string, EncounterSet> => {
//   const encounterSets = new Map<string, EncounterSet>();
//   const cardsByEncounter = getCardsByEncounter(cards);
//   for (const card of cards) {
//     if (card.encounterCode && !encounterSets.has(card.encounterCode)) {
//       const cards = cardsByEncounter.get(card.encounterCode) ?? [];
//       const imageCard = cards.find((c) => c.imageUrl);
//       encounterSets.set(card.encounterCode, {
//         code: card.encounterCode,
//         name: card.encounterName!,
//         imageUrl: imageCard?.imageUrl,
//         packName: card.packName,
//         cards,
//       });
//     }
//   }
//   return encounterSets;
// };

export const buildSearchIndex = (
  cards: Card[],
  campaigns: Campaign[],
  scenarios: Scenario[],
  encounters: EncounterSet[],
): SearchEntry[] => {
  const searchIndex: SearchEntry[] = [];

  for (const card of cards) {
    searchIndex.push({
      id: `card:${card.code}`,
      type: "card",
      code: card.code,
      name: card.name,
      xp: card.xp ?? undefined,
      subname: card.subname ?? undefined,
      imageUrl: card.meta.imageUrl ?? undefined,
      typeCode: card.type_code,
      packName: card.pack_name,
    });
  }

  for (const es of encounters) {
    searchIndex.push({
      id: `encounter:${es.code}`,
      type: "encounter",
      code: es.code,
      name: es.name,
      packName: es.packName,
    });
  }

  for (const s of scenarios) {
    searchIndex.push({
      id: `scenario:${s.code}`,
      type: "scenario",
      code: s.code,
      name: s.name,
    });
  }

  for (const c of campaigns) {
    searchIndex.push({
      id: `campaign:${c.code}`,
      type: "campaign",
      code: c.code,
      name: c.name,
    });
  }

  return searchIndex;
};
