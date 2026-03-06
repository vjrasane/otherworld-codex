import type { QueryOptionsMap } from "./query-client";
import * as campaigns from "@/src/pages/campaigns.json";
import * as cards from "@/src/pages/cards.json";
import * as scenarios from "@/src/pages/scenarios.json";
import * as encounterSets from "@/src/pages/encounter-sets.json";
import * as traits from "@/src/pages/traits.json";
import * as cardTypes from "@/src/pages/card-types.json";
import * as cardPools from "@/src/pages/card-pools.json";

export const entrypointQueryOptions: QueryOptionsMap = {
  cards: cards.options,
  encounterSets: encounterSets.options,
  scenarios: scenarios.options,
  campaigns: campaigns.options,
  traits: traits.options,
  cardTypes: cardTypes.options,
  cardPools: cardPools.options,
};
