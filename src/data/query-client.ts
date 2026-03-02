import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import { QueryClient, queryOptions } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";

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

export interface QueryOpts<_> {
  queryKey: string[];
  route: string;
}

export const toOptions = <T>(opts: QueryOpts<T>) => {
  return queryOptions<T>({
    queryKey: opts.queryKey,
    queryFn: () => fetch(opts.route).then((r) => r.json()),
  });
};
