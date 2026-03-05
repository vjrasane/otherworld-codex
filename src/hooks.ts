import { fromPairs } from "lodash-es";
import {
  QueryOptionsContext,
  toOptions,
  type InferQueryResult,
  type QueryOptionsMap,
  type QueryOpts,
} from "./data/query-client";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { buildSearchIndex } from "./data/search-index";
import { type FilterOptions } from "./data/filters";

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

export const useEncounterCardsByCode = () => {
  const { encounterCards } = useContext(QueryOptionsContext);
  const cards = useCachedQuery(encounterCards);
  const queryKey = ["encounterCardsByCode", ...encounterCards.queryKey];
  const { data } = useQuery({
    queryKey,
    queryFn: () => {
      if (!cards) return null;
      return fromPairs(cards.map((c) => [c.code, c]));
    },
    enabled: !!cards,
  });
  return data;
};

export const useScenarios = () => {
  const opts = useContext(QueryOptionsContext);
  const campaigns = useCachedQuery(opts.campaigns);
  const standalones = useCachedQuery(opts.standalones);
  const queryKey = [
    "scenarios",
    ...opts.campaigns.queryKey,
    ...opts.standalones.queryKey,
  ];
  const { data } = useQuery({
    queryKey,
    queryFn: () => {
      if (!campaigns) return null;
      if (!standalones) return null;
      return [...campaigns.flatMap((s) => s.scenarios), ...standalones];
    },
    enabled: !!campaigns && !!standalones,
  });

  return data;
};

export const useFilterOptions = () => {
  const opts = useContext(QueryOptionsContext);
  const campaigns = useCachedQuery(opts.campaigns);
  const standalones = useCachedQuery(opts.standalones);
  const encounters = useCachedQuery(opts.encounterSets);
  const traits = useCachedQuery(opts.traits);
  const types = useCachedQuery(opts.types);
  const { data } = useQuery({
    queryKey: [
      "filterOptions",
      ...opts.campaigns.queryKey,
      ...opts.standalones.queryKey,
      ...opts.encounterSets.queryKey,
      ...opts.traits.queryKey,
      ...opts.types.queryKey,
    ],
    queryFn: (): FilterOptions | null => {
      if (!campaigns) return null;
      if (!standalones) return null;
      if (!encounters) return null;
      if (!traits) return null;
      if (!types) return null;
      const scenarios = [
        ...campaigns.flatMap((s) => s.scenarios),
        ...standalones,
      ];
      return { campaigns, scenarios, encounters, traits, types };
    },
    enabled:
      !!campaigns && !!standalones && !!encounters && !!traits && !!types,
  });
  return data;
};

export const useSearchIndex = () => {
  const opts = useContext(QueryOptionsContext);
  const cards = useCachedQuery(opts.encounterCards);
  const campaigns = useCachedQuery(opts.campaigns);
  const standalones = useCachedQuery(opts.standalones);
  const { data } = useQuery({
    queryKey: [
      "searchIndex",
      ...opts.encounterCards.queryKey,
      ...opts.campaigns.queryKey,
      ...opts.standalones.queryKey,
    ],
    queryFn: () => {
      if (!cards) return null;
      if (!campaigns) return null;
      if (!standalones) return null;
      return buildSearchIndex(cards, campaigns, standalones);
    },
    enabled: !!cards && !!campaigns && !!standalones,
  });
  return data;
};
