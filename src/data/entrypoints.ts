import type { QueryOptionsMap } from "./query-client";
import * as campaigns from "@/src/pages/campaigns.json";
import * as encounterCards from "@/src/pages/encounter-cards.json";
import * as standalones from "@/src/pages/standalones.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  encounterCards: encounterCards.options,
  standalones: standalones.options,
  campaigns: campaigns.options,
};
