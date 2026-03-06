import type { Meta } from "@/src/data/meta";
import type { EncounterCard, RawCard } from "@/src/data/card";

import { uniq, uniqBy, partition, compact } from "lodash-es";
import {
  buildEncountersToCampaignsMap,
  buildEncountersToScenariosMap,
} from "./encounter-set";
import type { RawCampaign } from "./campaign";
import type { RawScenario } from "./scenario";

export interface Trait {
  __type: "trait";
  name: string;
  meta: Meta;
}

export const buildTraits = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Trait[] => {
  const encountersToScenarios = buildEncountersToScenariosMap(
    campaigns,
    standalones,
  );
  const encountersToCampaigns = buildEncountersToCampaignsMap(campaigns);

  const traitsToCards = buildTraitsToCardsMap(cards);

  const buildTraitMeta = (trait: string) => {
    const cas = traitsToCards.get(trait) ?? [];
    const [pcas, mcas] = partition(cas, (ca) => !ca.encounter_code);
    const pools = compact([pcas.length && "player", mcas.length && "mythos"]);
    const ens = uniq(
      mcas.map((c) => c.encounter_code).filter((enc): enc is string => !!enc),
    );
    const cms = ens
      .flatMap((en) => encountersToCampaigns.get(en!))
      .filter((cm): cm is string => !!cm);
    const scs = ens
      .flatMap((en) => encountersToScenarios.get(en!))
      .filter((sc): sc is string => !!sc);
    const ts = uniq(cas.map((ca) => ca.type_code));

    return {
      campaigns: cms,
      scenarios: scs,
      encounters: ens,
      traits: [trait],
      types: ts,
      pools,
    };
  };

  const traits = uniq(cards.flatMap((c) => c.traits ?? [])).map((name) => ({
    __type: "trait" as const,
    name,
    meta: buildTraitMeta(name),
  }));

  return traits;
};

const buildTraitsToCardsMap = (cards: RawCard[]) => {
  return cards.reduce((map, ca) => {
    for (const t of ca.traits ?? []) {
      const arr = map.get(t) ?? [];
      map.set(t, uniqBy([...arr, ca], "code"));
    }
    return map;
  }, new Map<string, RawCard[]>());
};
