import { QueryClientProvider } from "@tanstack/react-query";
import {
  queryClient,
  QueryOptionsContext,
  type QueryOptionsMap,
} from "../data/query-client";
import { MultiSelect } from "./MultiSelect";
import { SearchField } from "./SearchField";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SetStateAction,
} from "react";
import { Filter } from "lucide-react";
import { CardGrid } from "./CardGrid";
import { useEncounterCards, useFilterOptions } from "../hooks";
import { set } from "lodash/fp";
import {
  toFilterOption,
  toFilterOptions,
  toOptionId,
  type Filters,
  type FilterOptions,
  filterCard,
  restrictFilterOptions,
} from "@/src/data/filters";

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

const Filters: React.FC<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ filters, setFilters }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const options = useAvailableOptions(filters);

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

const useFilteredCards = (filters: Filters) => {
  const cards = useEncounterCards();

  const filteredCards = useMemo(
    () => cards?.filter((c) => filterCard(filters, c)) ?? [],
    [cards, filters],
  );

  return filteredCards;
};

const useAvailableOptions = (filters: Filters) => {
  const filterOptions = useFilterOptions();

  return useMemo(() => {
    if (!filterOptions)
      return {
        campaigns: [],
        scenarios: [],
        encounters: [],
        traits: [],
        types: [],
      };
    const restricted = restrictFilterOptions(filters, filterOptions);
    return toFilterOptions(restricted);
  }, [filters, filterOptions]);
};

const useFilters = () => {
  const filterOptions = useFilterOptions();
  const [filters, setFilters] = useState<Filters>(() => ({
    campaigns: [],
    scenarios: [],
    encounters: [],
    traits: [],
    types: [],
    text: "",
  }));

  useEffect(() => {
    if (!filterOptions) return;
    const params = new URLSearchParams(window.location.search);

    const initFromUrl = <K extends keyof FilterOptions>(key: K): Filters[K] => {
      const val = params.get(key);
      if (!val) return [];
      const values = new Set(val.split(","));
      return filterOptions[key]
        .filter((opt) => values.has(toOptionId(opt)))
        .map(toFilterOption);
    };

    setFilters((prev) => ({
      ...prev,
      campaigns: initFromUrl("campaigns"),
      scenarios: initFromUrl("scenarios"),
      encounters: initFromUrl("encounters"),
      traits: initFromUrl("traits"),
      types: initFromUrl("types"),
    }));
  }, [filterOptions]);

  const updateFilters = useCallback((updater: SetStateAction<Filters>) => {
    setFilters((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (Array.isArray(value) && value.length) {
          params.set(key, value.map((v) => v.value).join(","));
        }
      }
      const qs = params.toString();
      history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      return next;
    });
  }, []);

  return [filters, updateFilters] as const;
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
