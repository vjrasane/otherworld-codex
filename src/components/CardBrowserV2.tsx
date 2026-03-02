import { QueryClientProvider } from "@tanstack/react-query";
import {
  queryClient,
  QueryOptionsContext,
  type QueryOptionsMap,
} from "../data/query-client";
import { MultiSelect, type Option } from "./MultiSelect";
import { SearchField } from "./SearchField";
import { useContext, useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { CardGrid } from "./CardGrid";
import { useCachedQuery, useCardMeta, useFilterOptions } from "../hooks";
import { flow, set } from "lodash/fp";
import type { Card } from "../data/card";

export const CardBrowser: React.FC = () => {
  const [filters, setFilters] = useFilters();

  const cards = useFilteredCards(filters);

  return (
    <div className="relative px-4">
      <Filters filters={filters} setFilters={setFilters} />
      <div className="py-4">
        <CardGrid cards={cards ?? []} />
      </div>
    </div>
  );
};

const useFilteredCards = (filters: Filters) => {
  const opts = useContext(QueryOptionsContext);
  const meta = useCardMeta();
  const cards = useCachedQuery(opts.encounterCards);

  const filterByCampaign = (card: Card): boolean => {
    if (!filters.campaigns.length) return true;
    const m = meta?.[card.code];
    if (!m) return false;
    return filters.campaigns.some((f) => m.campaignCodes.includes(f.value));
  };

  const filterByScenario = (card: Card): boolean => {
    if (!filters.scenarios.length) return true;
    const m = meta?.[card.code];
    if (!m) return false;
    return filters.scenarios.some((f) => m.scenarioCodes.includes(f.value));
  };

  const filterByEncounter = (card: Card): boolean => {
    if (!filters.encounters.length) return true;
    const m = meta?.[card.code];
    if (!m) return false;
    return filters.encounters.some((f) => m.encounterCode === f.value);
  };

  const filterByTrait = (card: Card): boolean => {
    if (!filters.traits.length) return true;
    const m = meta?.[card.code];
    if (!m) return false;
    return filters.traits.some((f) => m.traits.includes(f.value));
  };

  const filterByType = (card: Card): boolean => {
    if (!filters.types.length) return true;
    return filters.types.some((f) => card.typeCode === f.value);
  };

  const filterByText = (card: Card): boolean => {
    if (!filters.text) return true;
    if (card.name.toLowerCase().includes(filters.text.toLowerCase()))
      return true;
    if (card.text?.toLowerCase().includes(filters.text.toLowerCase()))
      return true;
    return false;
  };

  const filteredCards = useMemo(
    () =>
      cards?.filter((card) => {
        if (!filterByCampaign(card)) return false;
        if (!filterByScenario(card)) return false;
        if (!filterByEncounter(card)) return false;
        if (!filterByTrait(card)) return false;
        if (!filterByType(card)) return false;
        if (!filterByText(card)) return false;
        return true;
      }) ?? [],
    [cards, filters],
  );

  return filteredCards;
};

interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
  text: string;
}

const useFilters = () => {
  // const opts = useContext(QueryOptionsContext);
  // const params = useMemo(
  //   () => new URLSearchParams(window.location.search),
  //   [window.location.search],
  // );
  // const filterOptions = useFilterOptions();

  const [filters, setFilters] = useState<Filters>(() => ({
    campaigns: [],
    scenarios: [],
    encounters: [],
    traits: [],
    types: [],
    text: "",
  }));

  // const initFromUrl = <T extends Option>(key: string, options: T[]): void => {
  //   const val = params.get(key);
  //   if (!val) return;
  //   const values = new Set(val.split(","));
  //   const filters = options.filter((o) => values.has(o.value));
  //   setFilters(set(key, filters));
  // };

  // useEffect(
  //   () =>
  //     filterOptions?.campaigns &&
  //     initFromUrl("campaigns", filterOptions.campaigns),
  //   [filterOptions?.campaigns],
  // );
  //
  // useEffect(
  //   () =>
  //     filterOptions?.campaigns &&
  //     initFromUrl("campaigns", filterOptions.campaigns),
  //   [filterOptions?.campaigns],
  // );

  // useEffect(() => initFromUrl("scenarios", []), []);
  // useEffect(() => initFromUrl("encounters", []), []);
  // useEffect(() => initFromUrl("traits", []), []);

  return [filters, setFilters] as const;
};

const Filters: React.FC<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ filters, setFilters }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const options = useFilterOptions();

  return (
    <div className="sticky top-0 bg-bg-0 flex flex-col gap-3 border-b border-border">
      <button
        onClick={() => setFiltersOpen((open) => !open)}
        className="md:hidden self-end text-text-muted hover:text-text-primary p-4"
      >
        <Filter size={32} />
      </button>
      <div
        className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 pt-2 pb-4 md:grid md:grid-cols-3 lg:grid-cols-6`}
      >
        <MultiSelect
          label="Campaigns"
          placeholder="All campaigns"
          options={options?.campaigns ?? []}
          onChange={(value) => setFilters(set("campaigns", value))}
          value={filters.campaigns}
        />
        <MultiSelect
          label="Scenarios"
          placeholder="All scenarios"
          options={options?.scenarios ?? []}
          onChange={(value) => setFilters(set("scenarios", value))}
          value={filters.scenarios}
        />
        <MultiSelect
          label="Encounter Sets"
          placeholder="All encounter sets"
          options={options?.encounters ?? []}
          onChange={(value) => setFilters(set("encounters", value))}
          value={filters.encounters}
        />
        <MultiSelect
          label="Traits"
          placeholder="All traits"
          options={options?.traits ?? []}
          onChange={(value) => setFilters(set("traits", value))}
          value={filters.traits}
        />
        <MultiSelect
          label="Types"
          placeholder="All types"
          options={options?.types ?? []}
          onChange={(value) => setFilters(set("types", value))}
          value={filters.types}
        />
        <SearchField
          label="Text"
          placeholder="Search card text"
          onChange={(value) => setFilters(set("text", value))}
          value={filters.text}
        />
      </div>
    </div>
  );
};

export default function ({ queryOptions }: { queryOptions: QueryOptionsMap }) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryOptionsContext.Provider value={queryOptions}>
        <CardBrowser />
      </QueryOptionsContext.Provider>
    </QueryClientProvider>
  );
}
