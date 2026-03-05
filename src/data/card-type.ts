import type { RawCampaign, RawScenario } from "./campaign";
import type { RawCard } from "./card";
import {
  buildEncountersToCampaignsMap,
  buildEncountersToScenariosMap,
} from "./encounter-set";
import type { Meta } from "./meta";
import { uniq, uniqBy } from "lodash-es";

export interface CardType {
  __type: "cardType";
  name: string;
  code: string;
  meta: Meta;
}

export const buildTypes = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): CardType[] => {
  const encountersToScenarios = buildEncountersToScenariosMap(
    campaigns,
    standalones,
  );
  const encountersToCampaigns = buildEncountersToCampaignsMap(campaigns);

  const typesToCards = buildTypesToCardsMap(cards);

  const buildTypeMeta = (type: string): Meta => {
    const cas = typesToCards.get(type) ?? [];
    const ens = uniq(
      cas.map((ca) => ca.encounter_code).filter((enc): enc is string => !!enc),
    );
    const cms = ens
      .flatMap((en) => encountersToCampaigns.get(en!))
      .filter((cm): cm is string => !!cm);
    const scs = ens
      .flatMap((en) => encountersToScenarios.get(en!))
      .filter((sc): sc is string => !!sc);
    const ts = uniq(cas.flatMap((ca) => ca.traits ?? []));
    return {
      campaigns: cms,
      scenarios: scs,
      encounters: ens,
      traits: ts,
      types: [type],
    };
  };

  const types = uniqBy(cards, "type_code").map((ca) => ({
    __type: "cardType" as const,
    name: ca.type_name,
    code: ca.type_code,
    meta: buildTypeMeta(ca.type_code),
  }));

  return types;
};

const buildTypesToCardsMap = (cards: RawCard[]) => {
  return cards.reduce((map, ca) => {
    const arr = map.get(ca.type_code) ?? [];
    map.set(ca.type_code, uniqBy([...arr, ca], "code"));
    return map;
  }, new Map<string, RawCard[]>());
};
