import type { CardPoolType } from "./card";

export interface Meta {
  pools: CardPoolType[];
  campaigns: string[];
  scenarios: string[];
  encounters: string[];
  traits: string[];
  types: string[];
}
