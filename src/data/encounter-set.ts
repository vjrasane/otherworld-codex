import type { RawScenario, RawCampaign } from "@/src/data/campaign";
import { RawCard } from "./card";
import type { Meta } from "./meta";
import { uniq } from "lodash-es";

export interface EncounterSet {
  code: string;
  name: string;
  packCode: string;
  packName: string;
  cards: RawCard[];
  meta: Meta;
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
    code: encounterCode,
    name: first.encounter_name ?? encounterCode,
    packName: first.pack_name,
    packCode: first.pack_code,
    cards: encounterCards,
    meta: {},
  };
};

export const buildEncounterSets = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): EncounterSet[] => {
  const encountersToScenarios = buildEncountersToScenariosMap(
    campaigns,
    standalones,
  );
  const encountersToCampaigns = buildEncountersToCampaignsMap(campaigns);

  const buildEncounterMeta = (encounter: EncounterSet): Meta => {
    return {
      campaigns: encountersToCampaigns.get(encounter.code),
      scenarios: encountersToScenarios.get(encounter.code),
      encounters: [encounter.code],
      traits: uniq(encounter.cards.flatMap((c) => c.traits ?? [])),
      types: uniq(encounter.cards.map((c) => c.type_code)),
    };
  };

  const encounters = cards.reduce((map, ca) => {
    if (!ca.encounter_code) return map;
    const set: EncounterSet = map.get(ca.encounter_code) ?? {
      code: ca.encounter_code,
      name: ca.encounter_name ?? "",
      packCode: ca.pack_code,
      packName: ca.pack_name,
      cards: [],
      meta: {},
    };
    set.cards.push(ca);
    map.set(ca.encounter_code, set);
    return map;
  }, new Map<string, EncounterSet>());

  encounters.forEach((en) => {
    en.meta = buildEncounterMeta(en);
  });

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
