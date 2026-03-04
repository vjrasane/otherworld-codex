import { z } from "astro/zod";

import cardsJson from "@/data/cards.json";
import campaignsJson from "@/data/campaigns.json";
import standalonesJson from "@/data/standalones.json";
import { buildCards, RawCard } from "@/src/data/card";
import {
  buildCampaigns,
  buildScenarios,
  RawCampaign,
  RawScenario,
} from "@/src/data/campaign";
import { buildEncounterSets } from "./encounter-set";

const rawCards = z.array(RawCard).parse(cardsJson);
const rawCampaigns = z.array(RawCampaign).parse(campaignsJson);
const rawStandalones = z.array(RawScenario).parse(standalonesJson);

const encounterSets = buildEncounterSets(rawCards);

export const cards = buildCards(
  rawCards,
  encounterSets,
  rawCampaigns,
  rawStandalones,
);
export const campaigns = buildCampaigns(rawCampaigns, cards);
export const standalones = buildScenarios(rawStandalones, rawCampaigns, cards);

export type { Card } from "@/src/data/card";
export type { Campaign, Scenario } from "@/src/data/campaign";
