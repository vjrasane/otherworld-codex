import type { RawCampaign } from "./campaign";
import type { RawCard } from "./card";
import type { Meta } from "./meta";
import type { RawScenario } from "./scenario";
import { uniq } from "lodash-es";

export type CardPoolType = "player" | "mythos";

export type CardPool = {
  __type: "cardPool";
  type: CardPoolType;
  meta: Meta;
};

const buildPlayerCardPool = (cards: RawCard[]): CardPool => {
  const playerCards = cards.filter((c) => !c.encounter_code);
  const traits = uniq(playerCards.flatMap((c) => c.traits ?? []));
  const types = uniq(playerCards.map((c) => c.type_code));

  return {
    __type: "cardPool",
    type: "player",
    meta: {
      campaigns: [],
      scenarios: [],
      encounters: [],
      traits,
      types,
      pools: ["player"],
    },
  };
};

const buildMythosCardPool = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): CardPool => {
  const mythosCards = cards.filter((c) => !!c.encounter_code);
  const traits = uniq(mythosCards.flatMap((c) => c.traits ?? []));
  const types = uniq(mythosCards.map((c) => c.type_code));
  const scenarios = [...campaigns.flatMap((c) => c.scenarios), ...standalones];
  const encounters = uniq(scenarios.flatMap((sc) => sc.encounterCodes));

  return {
    __type: "cardPool",
    type: "mythos",
    meta: {
      campaigns: campaigns.map((c) => c.code),
      scenarios: scenarios.map((c) => c.code),
      encounters,
      traits,
      types,
      pools: ["mythos"],
    },
  };
};

export const buildCardPools = (
  cards: RawCard[],
  campaigns: RawCampaign[],
  scenarios: RawScenario[],
): CardPool[] => {
  return [
    buildPlayerCardPool(cards),
    buildMythosCardPool(cards, campaigns, scenarios),
  ];
};
