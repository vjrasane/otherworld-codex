import type { RawCampaign } from "@/src/data/campaign";
import type { RawScenario } from "@/src/data/scenario";
import { RawCard } from "./card";
import type { Meta } from "./meta";
import { uniq, uniqBy } from "lodash-es";

export interface EncounterSet {
  __type: "encounterSet";
  code: string;
  name: string;
  packCode: string;
  packName: string;
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
    __type: "encounterSet",
    code: encounterCode,
    name: first.encounter_name ?? encounterCode,
    packName: first.pack_name,
    packCode: first.pack_code,
    meta: {
      campaigns: [],
      scenarios: [],
      encounters: [],
      traits: [],
      types: [],
      pools: [],
    },
  };
};

export const buildEncounterSets = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): EncounterSet[] => {
  const encountersToCardsMap = buildEncountersToCardsMap(cards);
  const encountersToScenarios = buildEncountersToScenariosMap(
    campaigns,
    standalones,
  );
  const encountersToCampaigns = buildEncountersToCampaignsMap(campaigns);

  const buildEncounterMeta = (enc: string) => {
    const cards = encountersToCardsMap.get(enc) ?? [];
    return {
      type: "encounterSet" as const,
      campaigns: encountersToCampaigns.get(enc) ?? [],
      scenarios: encountersToScenarios.get(enc) ?? [],
      encounters: [enc],
      traits: uniq(cards.flatMap((c) => c.traits ?? [])),
      types: uniq(cards.map((c) => c.type_code)),
      pools: ["mythos" as const],
    };
  };

  const encounters = cards.reduce((map, ca) => {
    if (!ca.encounter_code) return map;
    const set: EncounterSet = map.get(ca.encounter_code) ?? {
      __type: "encounterSet",
      code: ca.encounter_code,
      name: ca.encounter_name ?? "",
      packCode: ca.pack_code,
      packName: ca.pack_name,
      meta: buildEncounterMeta(ca.encounter_code),
    };
    map.set(ca.encounter_code, set);
    return map;
  }, new Map<string, EncounterSet>());

  return [...encounters.values()];
};

const buildEncountersToCardsMap = (cards: RawCard[]) => {
  return cards.reduce((map, ca) => {
    if (!ca.encounter_code) return map;
    const arr = map.get(ca.encounter_code) ?? [];
    map.set(ca.encounter_code, uniqBy([...arr, ca], "code"));
    return map;
  }, new Map<string, RawCard[]>());
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
