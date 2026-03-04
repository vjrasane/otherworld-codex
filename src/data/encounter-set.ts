import { type Card } from "./card";
import type { Meta } from "./meta";

export interface EncounterSet {
  code: string;
  name: string;
  packCode: string;
  packName: string;
  cards: Card[];
  meta: Meta;
}

export const getEncounterSet = (
  encounterCode: string,
  cards: Card[],
): EncounterSet | null => {
  const encounterCards = cards.filter(
    (c) => c.encounter_code === encounterCode,
  );
  const [first] = encounterCards;
  if (!first) return null;
  return {
    code: encounterCode,
    name: first.encounter_name ?? encounterCode,
    packName: first.pack_name,
    packCode: first.pack_code,
    cards: encounterCards,
    meta: {},
  };
};
