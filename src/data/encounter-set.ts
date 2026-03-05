import type { RawScenario, RawCampaign } from "@/src/data/campaign";
import { RawCard, type Card } from "./card";
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
): Map<string, EncounterSet> => {
  return cards.reduce((acc, curr) => {
    if (!curr.encounter_code) return acc;
    const set = acc.get(curr.encounter_code) ?? {
      code: curr.encounter_code,
      name: curr.encounter_name ?? "",
      packCode: curr.pack_code,
      packName: curr.pack_name,
      cards: [],
      meta: {},
    };
    set.cards.push(curr);
    acc.set(curr.encounter_code, set);
    return acc;
  }, new Map<string, EncounterSet>());
};

const groupBy = <T, K>(accessor: (item: T) => K, arr: T[]): Map<K, T[]> => {
  return arr.reduce((acc, curr) => {
    const _arr = acc.get(accessor(curr)) ?? [];
    _arr.push(curr);
    acc.set(accessor(curr), _arr);
    return acc;
  }, new Map<K, T[]>());
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
