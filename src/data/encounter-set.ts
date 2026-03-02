import { type Card } from "./card";

export interface EncounterSet {
  code: string;
  name: string;
  packName: string;
  imageUrl?: string;
  cards: Card[];
}
