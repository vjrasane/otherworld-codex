import type { RawCampaign } from "@/src/data/campaign";
import type { RawScenario } from "@/src/data/scenario";
import { RawCard } from "./card";
import { uniq } from "lodash-es";

export interface EncounterSet {
  __type: "encounterSet";
  code: string;
  name: string;
  packCode: string;
  packName: string;
}

export const getEncounterSet = (
  encounterCode: string,
  cards: RawCard[],
): EncounterSet | null => {
  const encounterCards = cards.filter(
    (c) => c.encounter_code === encounterCode,
  );
  const [first] = encounterCards;
  if (!first) return null;
  return {
    __type: "encounterSet",
    code: encounterCode,
    name: first.encounter_name ?? encounterCode,
    packName: first.pack_name,
    packCode: first.pack_code,
  };
};

export const buildEncounterSets = (cards: RawCard[]): EncounterSet[] => {
  const encounters = cards.reduce((map, ca) => {
    if (!ca.encounter_code) return map;
    const set: EncounterSet = map.get(ca.encounter_code) ?? {
      __type: "encounterSet",
      code: ca.encounter_code,
      name: ca.encounter_name ?? "",
      packCode: ca.pack_code,
      packName: ca.pack_name,
    };
    map.set(ca.encounter_code, set);
    return map;
  }, new Map<string, EncounterSet>());

  return [...encounters.values()];
};

export const buildEncountersToScenariosMap = (
  campaigns: RawCampaign[],
  standalones: RawScenario[],
) => {
  const scenarios = [...campaigns.flatMap((c) => c.scenarios), ...standalones];
  return scenarios.reduce((map, sc) => {
    for (const en of sc.encounterCodes) {
      const arr = map.get(en) ?? [];
      map.set(en, uniq([...arr, sc.code]));
    }
    return map;
  }, new Map<string, string[]>());
};

export const buildEncountersToCampaignsMap = (campaigns: RawCampaign[]) => {
  return campaigns.reduce((map, cm) => {
    const ens = uniq(cm.scenarios.flatMap((s) => s.encounterCodes));
    for (const en of ens) {
      const arr = map.get(en) ?? [];
      map.set(en, uniq([...arr, cm.code]));
    }
    return map;
  }, new Map<string, string[]>());
};
