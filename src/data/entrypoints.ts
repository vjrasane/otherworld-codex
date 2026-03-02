import type { QueryOptionsMap } from "./queries";
import * as searchIndex from "@/src/pages/search-index.json";
import * as encounterCards from "@/src/pages/encounter-cards.json";
import * as encounterCardsByCode from "@/src/pages/encounter-cards-by-code.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  searchIndex: searchIndex.options,
  encounterCards: encounterCards.options,
  encounterCardsByCode: encounterCardsByCode.options,
};
