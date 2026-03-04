import { z } from "astro/zod";
import type { Meta } from "./meta";
import type {
  Campaign,
  RawCampaign,
  RawScenario,
  Scenario,
} from "@/src/data/campaign";

const IMAGE_BASE = "https://arkhamdb.com";

function imageUrl(src?: string | null): string | undefined {
  return src ? IMAGE_BASE + src : undefined;
}

const RawLinkedCard = z.object({
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
  health_per_investigator: z.boolean().nullish(),
  is_unique: z.boolean(),
  position: z.number(),
  real_slot: z.string().nullish(),
});

export type RawLinkedCard = z.infer<typeof RawLinkedCard>;

export const RawCard = RawLinkedCard.extend({
  linked_to_code: z.string().optional(),
  linked_card: RawLinkedCard.optional(),
});

export type RawCard = z.infer<typeof RawCard>;

export type Card = RawCard & {
  linked_card?: Card;
  meta: CardMeta;
};

interface CardMeta extends Meta {
  linkedToCard?: Card;
  imageUrl?: string;
  backImageUrl?: string;
}

const buildCardMeta = (
  card: RawCard,
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Meta => {
  const { encounter_code, traits, type_code } = card;
  const meta = { traits: traits ?? [], types: [type_code] };
  if (!encounter_code) return meta;
  const campaignsMeta = campaigns
    .filter((c) =>
      c.scenarios.some((s) => s.encounterCodes.includes(encounter_code)),
    )
    .map((c) => c.code);
  const scenariosMeta = [
    ...campaigns.flatMap((c) => c.scenarios),
    ...standalones,
  ]
    .filter((s) => s.encounterCodes.includes(encounter_code))
    .map((c) => c.code);

  return {
    ...meta,
    campaigns: campaignsMeta,
    scenarios: scenariosMeta,
    encounters: [encounter_code],
  };
};

const buildCard = (
  raw: RawCard,
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Card => {
  const meta = {
    imageUrl: imageUrl(raw.imagesrc),
    backimageUrl: imageUrl(raw.backimagesrc),
    ...buildCardMeta(raw, campaigns, standalones),
  };
  return {
    ...raw,
    linked_card:
      raw.linked_card && buildCard(raw.linked_card, campaigns, standalones),
    meta,
  };
};

export function buildCards(
  raws: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Card[] {
  const processed = raws.map((raw) => buildCard(raw, campaigns, standalones));

  const links: Map<string, Card> = new Map(
    processed
      .filter((d) => !!d.linked_card)
      .map((d) => [d.linked_card!.code, d]),
  );

  const linked = processed.map((card) => {
    const linkedToCard = links.get(card.code);
    if (!linkedToCard) return card;
    const meta = { ...card.meta, linkedToCard };
    return { ...card, meta };
  });

  return linked;
}
