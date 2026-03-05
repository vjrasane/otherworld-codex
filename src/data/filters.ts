import type { Campaign, Scenario } from "./campaign";
import type { Card } from "./card";
import type { EncounterSet } from "./encounter-set";
import type { Trait } from "./trait";
import type { CardType } from "./card-type";

export type ViewMode = "cards" | "stats";
export type StatFilters = Record<string, string>;

export type Option = { label: string; value: string };

export interface FilterOptions {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

export interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

export const toFilterOption = (
  item: Campaign | Scenario | EncounterSet | Trait | CardType,
): Option => {
  switch (item.__type) {
    case "campaign":
    case "scenario":
    case "encounterSet":
    case "cardType":
      return {
        label: item.name,
        value: item.code,
      };
    case "trait":
      return {
        label: item.name,
        value: item.name,
      };
  }
};
