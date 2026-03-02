import type { QueryOptionsMap } from "./query-client";
import * as searchIndex from "@/src/pages/search-index.json";
import * as encounterCards from "@/src/pages/encounter-cards.json";
import * as encounterCardsByCode from "@/src/pages/encounter-cards-by-code.json";
import * as cardMeta from "@/src/pages/card-meta.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  searchIndex: searchIndex.options,
  encounterCards: encounterCards.options,
  encounterCardsByCode: encounterCardsByCode.options,
  cardMeta: cardMeta.options,
};
