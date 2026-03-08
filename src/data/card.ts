import { z } from "zod";
import type { Meta } from "./meta";

export type CardPoolType = "player" | "mythos";
import type { RawCampaign } from "@/src/data/campaign";
import {
  buildEncountersToCampaignsMap,
  buildEncountersToScenariosMap,
} from "@/src/data/encounter-set";
import type { RawScenario } from "./scenario";

function imageId(src?: string | null): string | undefined {
  if (!src) return undefined;
  return src.split("/").pop();
}

export type SpecialValue = "X" | "*" | "?";

const specialValues: Record<number, SpecialValue> = {
  [-2]: "X",
  [-3]: "*",
  [-4]: "?",
};

function resolveSpecialValue(
  value: number | null | undefined,
): SpecialValue | undefined {
  if (value == null) return undefined;
  return specialValues[value];
}

export const RawCard = z.object({
  code: z.string(),
  name: z.string(),
  type_code: z.string(),
  type_name: z.string(),
  faction_code: z.string(),
  faction_name: z.string(),
  pack_code: z.string(),
  pack_name: z.string(),
  encounter_code: z.string().nullish(),
  encounter_name: z.string().nullish(),
  traits: z
    .string()
    .transform((str) =>
      str
        .split(".")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .nullish(),
  quantity: z.number(),
  imagesrc: z.string().nullish(),
  double_sided: z.boolean().default(false),
  backimagesrc: z.string().nullish(),
  back_name: z.string().nullish(),
  text: z.string().nullish(),
  flavor: z.string().nullish(),
  subname: z.string().nullish(),
  xp: z.number().nullish(),
  cost: z.number().nullish(),
  health: z.number().nullish(),
  sanity: z.number().nullish(),
  skill_willpower: z.number().nullish(),
  skill_intellect: z.number().nullish(),
  skill_combat: z.number().nullish(),
  skill_agility: z.number().nullish(),
  enemy_fight: z.number().nullish(),
  enemy_evade: z.number().nullish(),
  enemy_damage: z.number().nullish(),
  enemy_horror: z.number().nullish(),
  shroud: z.number().nullish(),
  clues: z.number().nullish(),
  clues_fixed: z.boolean().nullish(),
  victory: z.number().nullish(),
  vengeance: z.number().nullish(),
  doom: z.number().nullish(),
  health_per_investigator: z.boolean().nullish(),
  is_unique: z.boolean(),
  position: z.number(),
  real_slot: z.string().nullish(),
  linked_to_code: z.string().optional(),
});

export type RawCard = z.infer<typeof RawCard>;

export type Card = RawCard & {
  meta: CardMeta;
};

interface CardMeta extends Meta {
  parentCard?: Card;
  imageId?: string;
  backImageId?: string;
  specialHealth?: SpecialValue;
  specialSanity?: SpecialValue;
  specialEnemyFight?: SpecialValue;
  specialEnemyEvade?: SpecialValue;
  specialEnemyDamage?: SpecialValue;
  specialEnemyHorror?: SpecialValue;
  specialShroud?: SpecialValue;
  specialClues?: SpecialValue;
  specialDoom?: SpecialValue;
}

export type EncounterCard = Card & {
  encounter_code: string;
};

export function buildCards(
  raws: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Card[] {
  const encountersToCampaigns = buildEncountersToCampaignsMap(campaigns);
  const encountersToScenarios = buildEncountersToScenariosMap(
    campaigns,
    standalones,
  );

  const buildCardMeta = (card: RawCard): Meta => {
    const { encounter_code, traits, type_code } = card;
    const meta = {
      campaigns: [],
      scenarios: [],
      encounters: [],
      traits: traits ?? [],
      types: [type_code],
      pools: ["player" as const],
    };
    if (!encounter_code) return meta;
    return {
      ...meta,
      campaigns: encountersToCampaigns.get(encounter_code) ?? [],
      scenarios: encountersToScenarios.get(encounter_code) ?? [],
      encounters: [encounter_code],
      pools: ["mythos" as const],
    };
  };

  const buildCard = (raw: RawCard): Card => {
    const swapImages =
      raw.type_code === "location" &&
      raw.double_sided &&
      raw.backimagesrc &&
      raw.back_name &&
      raw.back_name !== raw.name;
    const meta = {
      imageId: imageId(swapImages ? raw.backimagesrc : raw.imagesrc),
      backImageId: imageId(swapImages ? raw.imagesrc : raw.backimagesrc),
      specialHealth: resolveSpecialValue(raw.health),
      specialSanity: resolveSpecialValue(raw.sanity),
      specialEnemyFight: resolveSpecialValue(raw.enemy_fight),
      specialEnemyEvade: resolveSpecialValue(raw.enemy_evade),
      specialEnemyDamage: resolveSpecialValue(raw.enemy_damage),
      specialEnemyHorror: resolveSpecialValue(raw.enemy_horror),
      specialShroud: resolveSpecialValue(raw.shroud),
      specialClues: resolveSpecialValue(raw.clues),
      specialDoom: resolveSpecialValue(raw.doom),
      ...buildCardMeta(raw),
    };
    return { ...raw, meta };
  };
  const processed = raws.map(buildCard);

  const parentsByChildCode = new Map<string, Card>(
    processed
      .filter((d) => !!d.linked_to_code)
      .map((d) => [d.linked_to_code!, d]),
  );

  return processed.map((card) => {
    const parentCard = parentsByChildCode.get(card.code);
    if (!parentCard) return card;
    return { ...card, meta: { ...card.meta, parentCard } };
  });
}
