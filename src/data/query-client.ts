import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import { QueryClient, queryOptions, useQuery } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";
import type { SearchEntry } from "./search-index";
import type { Card } from "./card";
import { createContext } from "react";
import type { Campaign, Standalone } from "./campaign";

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

export type QueryOptionsMap = {
  encounterCards: QueryOpts<Card[]>;
  campaigns: QueryOpts<Campaign[]>;
  standalones: QueryOpts<Standalone[]>;
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
