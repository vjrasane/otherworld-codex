import type { QueryOptionsMap } from "./query-client";
import * as campaigns from "@/src/pages/campaigns.json";
import * as cards from "@/src/pages/cards.json";
import * as scenarios from "@/src/pages/scenarios.json";
import * as encounterSets from "@/src/pages/encounter-sets.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  cards: cards.options,
  encounterSets: encounterSets.options,
  scenarios: scenarios.options,
  campaigns: campaigns.options,
};
