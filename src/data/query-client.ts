import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";
import type { Card } from "./card";
import { createContext } from "react";
import type { Campaign, Scenario } from "./campaign";
import type { EncounterSet } from "./encounter-set";
import type { Trait } from "./trait";
import type { Type } from "./type";

const expiry = 1000 * 60 * 60 * 24 * 30; // 30 days

const persister = experimental_createQueryPersister({
  storage: { getItem: get, setItem: set, removeItem: del },
  maxAge: expiry,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: expiry,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      persister: persister.persisterFn,
    },
  },
});

export interface QueryOpts<T> {
  _type?: T;
  queryKey: string[];
  route: string;
}

export type InferQueryResult<T> = T extends QueryOpts<infer R> ? R : never;

export type QueryOptionsMap = {
  encounterCards: QueryOpts<Card[]>;
  encounterSets: QueryOpts<EncounterSet[]>;
  campaigns: QueryOpts<Campaign[]>;
  standalones: QueryOpts<Scenario[]>;
  traits: QueryOpts<Trait[]>;
  types: QueryOpts<Type[]>;
};

export const QueryOptionsContext = createContext<QueryOptionsMap>(
  {} as QueryOptionsMap,
);

export const toOptions = <T>(opts: QueryOpts<T>) => {
  return queryOptions<T>({
    queryKey: opts.queryKey,
    queryFn: () => fetch(opts.route).then((r) => r.json()),
  });
};
