import type { Campaign } from "./campaign";
import type { Scenario } from "./scenario";
import type { Card } from "./card";
import type { EncounterSet } from "./encounter-set";
import type { CardPoolType } from "./card";
import type { Meta } from "./meta";
import { capitalize } from "lodash-es";

export type ViewMode = "cards" | "stats";
export type StatFilters = Record<string, string>;

export type Option = { label: string; value: string };

export interface FilterOptions {
  campaigns: Campaign[];
  scenarios: Scenario[];
  encounters: EncounterSet[];
  traits: string[];
  pools: CardPoolType[];
  types: string[];
}

export type FilterOptionType = FilterOptions[keyof FilterOptions][number];

export interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
  pools: Option[];
  text: string;
}

export const toOptionId = (item: FilterOptionType): string => {
  if (typeof item === "string") return item;
  switch (item.__type) {
    case "campaign":
    case "scenario":
    case "encounterSet":
      return item.code;
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
  if (typeof item === "string") {
    return { label: capitalize(item), value: item };
  }
  switch (item.__type) {
    case "campaign":
    case "scenario":
    case "encounterSet":
      return {
        label: item.name,
        value: item.code,
      };
  }
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
    return filter.some((f) => meta?.includes(f.value as any));
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

export const restrictFromCards = (
  filters: Filters,
  opts: FilterOptions,
  cards: Card[],
): FilterOptions => {
  const metaKeys: (keyof FilterOptions & keyof Meta)[] = [
    "campaigns",
    "scenarios",
    "encounters",
    "traits",
    "types",
    "pools",
  ];

  const hasFilters = metaKeys.some((k) => {
    const f = filters[k];
    return Array.isArray(f) && f.length > 0;
  });
  if (!hasFilters) return opts;

  return Object.fromEntries(
    (
      Object.entries(opts) as [
        keyof FilterOptions,
        FilterOptions[keyof FilterOptions],
      ][]
    ).map(([optKey, optValues]) => {
      const otherKeys = metaKeys.filter((k) => k !== optKey);
      const filter = combineFilters(...otherKeys.map(filterBy));
      const matching = cards.filter((c) => filter(filters, c));
      const values = new Set(matching.flatMap((c) => c.meta[optKey] ?? []));
      const restricted = optValues.filter((o) => values.has(toOptionId(o)));
      return [optKey, restricted];
    }),
  ) as unknown as FilterOptions;
};

export const filterCard: FilterFunc<Card> = combineFilters(
  filterBy("campaigns"),
  filterBy("scenarios"),
  filterBy("encounters"),
  filterBy("traits"),
  filterBy("types"),
  filterByText,
);
