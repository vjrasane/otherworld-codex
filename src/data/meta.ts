import type { CardPoolType } from "./card-pool";

export interface Meta {
  pools: CardPoolType[];
  campaigns: string[];
  scenarios: string[];
  encounters: string[];
  traits: string[];
  types: string[];
}
