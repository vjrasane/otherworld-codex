import type { DataEndpoint, QueryOptionsMap } from "@/src/data/query-client";

const modules = import.meta.glob('./*.json.ts', { eager: true }) as Record<
  string,
  { endpoint: DataEndpoint<keyof QueryOptionsMap, unknown> }
>;

export const queryOptions = Object.values(modules).reduce(
  (map, mod) => {
    map[mod.endpoint.key] = mod.endpoint.options as any;
    return map;
  },
  {} as QueryOptionsMap,
);
