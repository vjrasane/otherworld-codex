import type { Campaign } from "./campaign";
import type { Scenario } from "./scenario";
import type { Card } from "./card";
import type { EncounterSet } from "./encounter-set";
import type { Trait } from "./trait";
import type { CardType } from "./card-type";
import type { Meta } from "./meta";

export type ViewMode = "cards" | "stats";
export type StatFilters = Record<string, string>;

export type Option = { label: string; value: string };

export interface FilterOptions {
  campaigns: Campaign[];
  scenarios: Scenario[];
  encounters: EncounterSet[];
  traits: Trait[];
  types: CardType[];
}

export type FilterOptionType = FilterOptions[keyof FilterOptions][number];

export interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
  text: string;
}

export const toOptionId = (item: FilterOptionType) => {
  switch (item.__type) {
    case "campaign":
    case "scenario":
    case "encounterSet":
    case "cardType":
      return item.code;
    case "trait":
      return item.name;
  }
};

export const toFilterOptions = (
  opts: FilterOptions,
): { [K in keyof FilterOptions]: Option[] } => {
  return Object.fromEntries(
    Object.entries(opts).map(([k, v]) => [k, v.map(toFilterOption)]),
  ) as { [K in keyof FilterOptions]: Option[] };
};

export const toFilterOption = (item: FilterOptionType): Option => {
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

export const restrictFilterOptions = (
  filters: Filters,
  opts: FilterOptions,
): FilterOptions => {
  const optKeys = Object.keys(opts) as (keyof FilterOptions)[];
  return Object.fromEntries(
    (
      Object.entries(opts) as [
        keyof FilterOptions,
        FilterOptions[keyof FilterOptions],
      ][]
    ).map(([optKey, optValues]) => {
      const filter: FilterFunc<FilterOptionType> = combineFilters(
        ...optKeys.filter((k) => k !== optKey).map(filterBy),
      );
      const filteredValues = optValues.filter((o) => filter(filters, o));
      return [optKey, filteredValues] as const;
    }),
  ) as unknown as FilterOptions;
};

type FilterFunc<TItem extends { meta: Meta }> = (
  filters: Filters,
  item: TItem,
) => boolean;

const filterBy =
  <K extends keyof Filters & keyof Meta>(key: K): FilterFunc<{ meta: Meta }> =>
  (filters, card) => {
    const filter = filters[key];
    if (!Array.isArray(filter)) return true;
    if (!filter.length) return true;
    const meta = card.meta[key];
    return filter.some((f) => meta?.includes(f.value));
  };

const filterByText: FilterFunc<Card> = (filters, card) => {
  if (!filters.text.length) return true;
  if (card.name.toLowerCase().includes(filters.text.toLowerCase())) return true;
  if (card.text?.toLowerCase().includes(filters.text.toLowerCase()))
    return true;
  return false;
};

const combineFilters =
  <TItem extends { meta: Meta }>(
    ...funcs: FilterFunc<TItem>[]
  ): FilterFunc<TItem> =>
  (filters, card) => {
    for (const func of funcs) {
      if (!func(filters, card)) return false;
    }
    return true;
  };

export const filterCard: FilterFunc<Card> = combineFilters(
  filterBy("campaigns"),
  filterBy("scenarios"),
  filterBy("encounters"),
  filterBy("traits"),
  filterBy("types"),
  filterByText,
);
