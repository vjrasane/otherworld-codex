import { z } from "astro/zod";
import type { Meta } from "./meta";
import type {
  Campaign,
  RawCampaign,
  RawScenario,
  Scenario,
} from "@/src/data/campaign";

const IMAGE_BASE = "https://arkhamdb.com";

function imageUrl(src?: string): string | undefined {
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
  encounter_code: z.string().optional(),
  encounter_name: z.string().optional(),
  traits: z
    .string()
    .transform((str) =>
      str
        .split(".")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .optional(),
  quantity: z.number(),
  imagesrc: z.string().optional(),
  double_sided: z.boolean().default(false),
  backimagesrc: z.string().optional(),
  back_name: z.string().optional(),
  text: z.string().optional(),
  flavor: z.string().optional(),
  subname: z.string().optional(),
  xp: z.number().optional(),
  cost: z.number().optional(),
  health: z.number().optional(),
  sanity: z.number().optional(),
  skill_willpower: z.number().optional(),
  skill_intellect: z.number().optional(),
  skill_combat: z.number().optional(),
  skill_agility: z.number().optional(),
  enemy_fight: z.number().optional(),
  enemy_evade: z.number().optional(),
  enemy_damage: z.number().optional(),
  enemy_horror: z.number().optional(),
  shroud: z.number().optional(),
  clues: z.number().optional(),
  clues_fixed: z.boolean().optional(),
  victory: z.number().optional(),
  health_per_investigator: z.boolean().optional(),
  is_unique: z.boolean(),
  position: z.number(),
  real_slot: z.string().optional(),
});

export type RawLinkedCard = z.infer<typeof RawLinkedCard>;

export const RawCard = RawLinkedCard.extend({
  linked_to_code: z.string().optional(),
  linked_card: RawLinkedCard.optional(),
});

export type RawCard = z.infer<typeof RawCard>;

interface CardMeta extends Meta {
  linkedToCard?: Card;
  imageUrl?: string;
}

const buildCardMeta = (
  card: RawCard,
  campaigns: Campaign[],
  standalones: Scenario[],
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

export type Card = RawCard & {
  meta: CardMeta;
};

export function buildCards(
  raws: RawCard[],
  campaigns: RawCampaign[],
  standalones: RawScenario[],
): Card[] {
  const processed = raws.map((raw) => {
    const meta = {
      imageUrl: imageUrl(raw.imagesrc),
      ...buildCardMeta(raw, campaigns, standalones),
    };
    return { ...raw, meta };
  });

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
