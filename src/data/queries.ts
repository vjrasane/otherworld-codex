import { createContext } from "react";
import type { QueryOpts } from "./query-client";
import type { SearchEntry } from "./search-index";
import type { Card } from "./card";

export type QueryOptionsMap = {
  searchIndex: QueryOpts<SearchEntry[]>;
  encounterCards: QueryOpts<Card[]>;
  encounterCardsByCode: QueryOpts<Record<string, Card>>;
};

export const QueryOptionsContext = createContext<QueryOptionsMap>(
  {} as QueryOptionsMap,
);
