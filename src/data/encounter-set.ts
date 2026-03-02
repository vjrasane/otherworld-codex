import { cardsByEncounter, encounterCards, type Card } from "./card";

export interface EncounterSet {
  code: string;
  name: string;
  packName: string;
  imageUrl?: string;
  cards: Card[];
}

export const encounterSets = new Map<string, EncounterSet>();
for (const card of encounterCards) {
  if (card.encounterCode && !encounterSets.has(card.encounterCode)) {
    const cards = cardsByEncounter.get(card.encounterCode) ?? [];
    const imageCard = cards.find((c) => c.imageUrl);
    encounterSets.set(card.encounterCode, {
      code: card.encounterCode,
      name: card.encounterName!,
      imageUrl: imageCard?.imageUrl,
      packName: card.packName,
      cards,
    });
  }
}
