import {
  QueryOptionsContext,
  toOptions,
  type InferQueryResult,
  type QueryOptionsMap,
  type QueryOpts,
} from "./data/query-client";
import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { buildSearchIndex } from "./data/search-index";
import { type FilterOptions } from "./data/filters";
import { type EncounterCard } from "./data/card";
import { uniq } from "lodash-es";

function useCachedQuery<T>(queryOpts: QueryOpts<T>): T | null {
  const { data } = useQuery(toOptions(queryOpts));
  if (!data) return null;
  return data;
}

export const useCachedRequest = <K extends keyof QueryOptionsMap>(
  queryKey: K,
): InferQueryResult<QueryOptionsMap[K]> => {
  const ctx = useContext(QueryOptionsContext);
  const opts = ctx[queryKey];
  const result = useCachedQuery(opts as any);
  return result as any;
};

export const useEncounterCards = () => {
  const opts = useContext(QueryOptionsContext);
  const cards = useCachedQuery(opts.cards);

  const { data } = useQuery({
    queryKey: ["encounterCards", opts.cards.queryKey],
    queryFn: () => {
      if (!cards) return null;
      return cards.filter((ca): ca is EncounterCard => !!ca.encounter_code);
    },
    enabled: !!cards,
  });

  return data;
};

export const useEncounterCardsByCode = () => {
  const opts = useContext(QueryOptionsContext);
  const cards = useEncounterCards();
  const { data } = useQuery({
    queryKey: ["encounterCardsByCode", ...opts.cards.queryKey],
    queryFn: () => {
      if (!cards) return null;
      return Object.fromEntries(cards.map((c) => [c.code, c])) as Record<
        string,
        EncounterCard
      >;
    },
    enabled: !!cards,
  });
  return data;
};

export const useFilterOptions = () => {
  const opts = useContext(QueryOptionsContext);
  const campaigns = useCachedQuery(opts.campaigns);
  const scenarios = useCachedQuery(opts.scenarios);
  const encounters = useCachedQuery(opts.encounterSets);
  const cards = useCachedQuery(opts.cards);

  return useMemo((): FilterOptions | null => {
    if (!campaigns || !scenarios || !encounters || !cards) return null;
    return {
      campaigns,
      scenarios,
      encounters,
      traits: uniq(cards.flatMap((c) => c.traits ?? [])),
      types: uniq(cards.map((c) => c.type_code)),
      pools: ["player", "mythos"],
    };
  }, [campaigns, scenarios, encounters, cards]);
};

export const useSearchIndex = () => {
  const opts = useContext(QueryOptionsContext);
  const cards = useEncounterCards();
  const campaigns = useCachedQuery(opts.campaigns);
  const scenarios = useCachedQuery(opts.scenarios);
  const encounterSets = useCachedQuery(opts.encounterSets);
  const { data } = useQuery({
    queryKey: [
      "searchIndex",
      ...opts.cards.queryKey,
      ...opts.campaigns.queryKey,
      ...opts.scenarios.queryKey,
      ...opts.encounterSets.queryKey,
    ],
    queryFn: () => {
      if (!cards) return null;
      if (!campaigns) return null;
      if (!scenarios) return null;
      if (!encounterSets) return null;
      return buildSearchIndex(cards, campaigns, scenarios, encounterSets);
    },
    enabled: !!cards && !!campaigns && !!scenarios && !!encounterSets,
  });
  return data;
};
