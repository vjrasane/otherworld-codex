import { z } from "astro/zod";

import cardsJson from "@/data/cards.json";
import campaignsJson from "@/data/campaigns.json";
import standalonesJson from "@/data/standalones.json";
import { buildCards, RawCard } from "@/src/data/card";
import { buildCampaigns, RawCampaign } from "@/src/data/campaign";
import { buildEncounterSets } from "./encounter-set";
import { buildTraits } from "@/src/data/trait";
import { buildTypes } from "@/src/data/card-type";
import { buildScenario, buildStandalone, RawScenario } from "./scenario";

const rawCards = z.array(RawCard).safeParse(cardsJson);
if (!rawCards.success)
  throw new Error("Cards data is invalid: " + rawCards.error.message);
const rawCampaigns = z.array(RawCampaign).safeParse(campaignsJson);
if (!rawCampaigns.success)
  throw new Error("Campaign data is invalid: " + rawCampaigns.error.message);
const rawStandalones = z.array(RawScenario).safeParse(standalonesJson);
if (!rawStandalones.success)
  throw new Error(
    "Standalone scenarios data is invalid: " + rawStandalones.error.message,
  );

export const cards = buildCards(
  rawCards.data,
  rawCampaigns.data,
  rawStandalones.data,
);
export const campaigns = buildCampaigns(rawCampaigns.data, cards);

export const campaignScenarios = rawCampaigns.data.flatMap((cm) =>
  cm.scenarios.map((sc) => buildScenario(sc, cm, rawCards.data)),
);
export const standalones = rawStandalones.data.map((st) =>
  buildStandalone(st, rawCards.data),
);

export const scenarios = [...campaignScenarios, ...standalones];

export const encounterSets = buildEncounterSets(
  rawCards.data,
  rawCampaigns.data,
  rawStandalones.data,
);
export const traits = buildTraits(
  cards,
  rawCampaigns.data,
  rawStandalones.data,
);
export const types = buildTypes(cards, rawCampaigns.data, rawStandalones.data);

export type { Card } from "@/src/data/card";
export type { Campaign } from "@/src/data/campaign";
export type { Scenario } from "@/src/data/scenario";
