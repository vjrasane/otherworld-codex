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
  useRef,
  useState,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import { Filter, List, BarChart3 } from "lucide-react";
import { CardListItem } from "./CardListItem";
import CardStats from "./CardStats";
import type { Card } from "@/src/data/card";
import { useEncounterCards, useFilterOptions } from "../hooks";
import { set } from "lodash/fp";
import {
  toFilterOption,
  toFilterOptions,
  toOptionId,
  type Filters,
  type FilterOptions,
  filterCard,
  restrictFromCards,
} from "@/src/data/filters";

const DESKTOP_QUERY = "(min-width: 1024px)";

function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

const FilterFields: React.FC<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  options: ReturnType<typeof useAvailableOptions>;
}> = ({ filters, setFilters, options }) => (
  <>
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
  </>
);

const BATCH = 100;

const CardList: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const [count, setCount] = useState(BATCH);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!el) return;
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCount((c) => c + BATCH);
    });
    observerRef.current.observe(el);
  }, []);

  useEffect(() => {
    setCount(BATCH);
    scrollRef.current?.scrollTo(0, 0);
  }, [cards]);

  const visible = useMemo(() => cards.slice(0, count), [cards, count]);

  if (cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        No cards match your filters
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {visible.map((card) => (
        <CardListItem key={card.code} card={card} />
      ))}
      {count < cards.length && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
};

type MobileView = "list" | "stats";

export const CardBrowser: React.FC = () => {
  const [filters, setFilters] = useFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const isDesktop = useIsDesktop();

  const cards = useFilteredCards(filters);
  const options = useAvailableOptions(filters);

  const handleChartClick = useCallback(
    (kind: "types" | "traits" | "encounters", name: string) => {
      setFilters((prev) => {
        const current = prev[kind];
        if (current.some((o) => o.value === name)) return prev;
        return { ...prev, [kind]: [...current, { label: name, value: name }] };
      });
      if (!isDesktop) setMobileView("list");
    },
    [setFilters, isDesktop],
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* StatusBar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="lg:hidden text-text-muted hover:text-text-primary"
        >
          <Filter size={20} />
        </button>
        <span className="text-sm text-text-muted flex-1">
          {cards.length} cards
        </span>
        <div className="lg:hidden inline-flex rounded border border-border overflow-hidden">
          <button
            onClick={() => setMobileView("list")}
            className={`p-1.5 ${mobileView === "list" ? "bg-accent text-bg-0" : "text-text-muted"}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setMobileView("stats")}
            className={`p-1.5 ${mobileView === "stats" ? "bg-accent text-bg-0" : "text-text-muted"}`}
          >
            <BarChart3 size={16} />
          </button>
        </div>
      </div>

      {/* Mobile filter panel */}
      {!isDesktop && filtersOpen && (
        <div className="flex flex-col gap-3 p-4 border-b border-border md:grid md:grid-cols-3">
          <FilterFields
            filters={filters}
            setFilters={setFilters}
            options={options}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop filter sidebar */}
        {isDesktop && (
          <div className="w-70 border-r border-border overflow-y-auto p-4 flex flex-col gap-3 shrink-0">
            <FilterFields
              filters={filters}
              setFilters={setFilters}
              options={options}
            />
          </div>
        )}

        {/* Center: card list (desktop always, mobile when mobileView=list) */}
        {(isDesktop || mobileView === "list") && (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CardList cards={cards} />
          </div>
        )}

        {/* Right: stats (desktop always, mobile when mobileView=stats) */}
        {(isDesktop || mobileView === "stats") && (
          <div
            className={`overflow-y-auto p-4 ${isDesktop ? "w-80 border-l border-border shrink-0" : "flex-1"}`}
          >
            <CardStats cards={cards} onChartClick={handleChartClick} />
          </div>
        )}
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
  const cards = useEncounterCards();

  return useMemo(() => {
    if (!filterOptions) return null;
    if (!cards) return toFilterOptions(filterOptions);
    const restricted = restrictFromCards(filters, filterOptions, cards);
    return toFilterOptions(restricted);
  }, [filters, filterOptions, cards]);
};

const useFilters = () => {
  const filterOptions = useFilterOptions();
  const [filters, setFilters] = useState<Filters>(() => ({
    campaigns: [],
    scenarios: [],
    encounters: [],
    traits: [],
    types: [],
    pools: [{ label: "mythos", value: "mythos" }],
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
        if (key === "pools") continue;
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
