import type { Campaign, Scenario } from "./campaign";
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

export const toFilterOptions = (items: FilterOptionType[]) =>
  items.map(toFilterOption);

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
type RestrictFunc = (filters: Filters, opts: FilterOptions) => FilterOptions;

export const restrictBy =
  <K extends keyof Filters & keyof Meta & keyof FilterOptions>(
    filterKey: K,
  ): RestrictFunc =>
  (filters, filterOpts) => {
    const filter = filters[filterKey];
    if (!Array.isArray(filter)) return filterOpts;
    if (!filter.length) return filterOpts;
    return (
      Object.entries(filterOpts) as [
        keyof FilterOptions,
        FilterOptions[keyof FilterOptions],
      ][]
    ).reduce((opts, [optKey, opt]) => {
      if (optKey === filterKey) return opts; // do not restrict based on own key
      const restricted = opt.filter((o) =>
        filter.some((f) => o.meta[filterKey]?.includes(f.value)),
      );
      return { ...opts, [optKey]: restricted };
    }, filterOpts);
  };

export const combineRestrict =
  (...funcs: RestrictFunc[]): RestrictFunc =>
  (filters, filterOpts) => {
    return funcs.reduce((acc, curr) => curr(filters, acc), filterOpts);
  };

type FilterFunc = (filters: Filters, card: Card) => boolean;

export const filterBy =
  <K extends keyof Filters & keyof Meta>(key: K): FilterFunc =>
  (filters, card) => {
    const filter = filters[key];
    if (!Array.isArray(filter)) return true;
    if (!filter.length) return true;
    const meta = card.meta[key];
    return filter.some((f) => meta?.includes(f.value));
  };

export const filterByText: FilterFunc = (filters, card) => {
  if (!filters.text.length) return true;
  if (card.name.toLowerCase().includes(filters.text.toLowerCase())) return true;
  if (card.text?.toLowerCase().includes(filters.text.toLowerCase()))
    return true;
  return false;
};

export const combineFilters =
  (...funcs: FilterFunc[]): FilterFunc =>
  (filters, card) => {
    for (const func of funcs) {
      if (!func(filters, card)) return false;
    }
    return true;
  };
