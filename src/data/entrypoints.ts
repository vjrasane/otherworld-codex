import type { QueryOptionsMap } from "./query-client";
import * as campaigns from "@/src/pages/campaigns.json";
import * as encounterCards from "@/src/pages/encounter-cards.json";
import * as standalones from "@/src/pages/standalones.json";
import * as encounterSets from "@/src/pages/encounter-sets.json";
import * as traits from "@/src/pages/traits.json";
import * as types from "@/src/pages/types.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  encounterCards: encounterCards.options,
  encounterSets: encounterSets.options,
  standalones: standalones.options,
  campaigns: campaigns.options,
  traits: traits.options,
  types: types.options,
};
