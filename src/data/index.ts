import { type Campaign, type Scenario, type Standalone } from "./campaign";
import { type Card } from "./card";
import { type EncounterSet } from "./encounter-set";
import { type SearchEntry } from "./search-index";

export function getCampaign(code: string): Campaign | undefined {
  return campaignsByCode.get(code);
}

export function getAllCampaigns(): Campaign[] {
  return campaigns;
}

export function getScenario(code: string): Scenario | undefined {
  return scenariosByCode.get(code);
}

export function getStandalone(code: string): Standalone | undefined {
  return standalonesByCode.get(code);
}

export function getAllStandalones(): Standalone[] {
  return standalones;
}

export function getEncounterCards(code: string): Card[] {
  return cardsByEncounter.get(code) ?? [];
}

export function getSearchIndex(): SearchEntry[] {
  return searchIndex;
}
