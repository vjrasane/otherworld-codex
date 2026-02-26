import cardsJson from "../../../data/cards.json";
import campaignsJson from "../../../data/campaigns.json";

export interface Card {
  code: string;
  name: string;
  typeCode: string;
  typeName: string;
  factionCode: string;
  factionName: string;
  packCode: string;
  packName: string;
  encounterCode?: string;
  encounterName?: string;
  traits?: string;
  quantity: number;
  imageUrl?: string;
  backImageUrl?: string;
  text?: string;
  flavor?: string;
  subname?: string;
  cost?: number;
  health?: number;
  sanity?: number;
  skillWillpower?: number;
  skillIntellect?: number;
  skillCombat?: number;
  skillAgility?: number;
  isUnique: boolean;
  position: number;
  slot?: string;
}

export interface EncounterSet {
  code: string;
  name: string;
  imageUrl?: string;
  cards: Card[];
}

export interface Scenario {
  code: string;
  name: string;
  prefix?: string;
  campaignCode: string;
  campaignName: string;
  encounterCodes: string[];
  imageUrl?: string;
}

export interface Campaign {
  code: string;
  name: string;
  scenarios: Scenario[];
  imageUrl?: string;
}

export interface SearchEntry {
  id: string;
  type: "card" | "encounter" | "scenario" | "campaign";
  code: string;
  name: string;
  imageUrl?: string;
  typeCode?: string;
  packName?: string;
}

const IMAGE_BASE = "https://arkhamdb.com";

function cardImageUrl(imagesrc?: string): string | undefined {
  if (!imagesrc) return undefined;
  return IMAGE_BASE + imagesrc;
}

function parseCard(raw: (typeof cardsJson)[number]): Card {
  return {
    code: raw.code,
    name: raw.name,
    typeCode: raw.type_code,
    typeName: raw.type_name,
    factionCode: raw.faction_code,
    factionName: raw.faction_name,
    packCode: raw.pack_code,
    packName: raw.pack_name,
    encounterCode: raw.encounter_code ?? undefined,
    encounterName: raw.encounter_name ?? undefined,
    traits: raw.traits ?? undefined,
    quantity: raw.quantity,
    imageUrl: cardImageUrl(raw.imagesrc),
    backImageUrl: cardImageUrl(raw.backimagesrc ?? undefined),
    text: raw.text ?? undefined,
    flavor: raw.flavor ?? undefined,
    subname: raw.subname ?? undefined,
    cost: (raw as Record<string, unknown>).cost as number | undefined,
    health: raw.health ?? undefined,
    sanity: raw.sanity ?? undefined,
    skillWillpower: raw.skill_willpower ?? undefined,
    skillIntellect: raw.skill_intellect ?? undefined,
    skillCombat: raw.skill_combat ?? undefined,
    skillAgility: raw.skill_agility ?? undefined,
    isUnique: raw.is_unique,
    position: raw.position,
    slot: raw.real_slot || undefined,
  };
}

const allCards: Card[] = cardsJson.map(parseCard);

const cardsByCode = new Map<string, Card>();
for (const card of allCards) {
  cardsByCode.set(card.code, card);
}

const cardsByEncounter = new Map<string, Card[]>();
for (const card of allCards) {
  if (card.encounterCode) {
    const list = cardsByEncounter.get(card.encounterCode) ?? [];
    list.push(card);
    cardsByEncounter.set(card.encounterCode, list);
  }
}

const encounterSets = new Map<string, EncounterSet>();
for (const card of allCards) {
  if (card.encounterCode && !encounterSets.has(card.encounterCode)) {
    const cards = cardsByEncounter.get(card.encounterCode) ?? [];
    const imageCard = cards.find((c) => c.imageUrl);
    encounterSets.set(card.encounterCode, {
      code: card.encounterCode,
      name: card.encounterName!,
      imageUrl: imageCard?.imageUrl,
      cards,
    });
  }
}

type RawCampaign = (typeof campaignsJson)[number];
type RawScenario = RawCampaign["scenarios"][number];

const campaigns: Campaign[] = campaignsJson.map((raw: RawCampaign) => {
  const scenarios: Scenario[] = raw.scenarios.map((s: RawScenario) => {
    const encounterCards = s.encounterCodes.flatMap(
      (ec: string) => cardsByEncounter.get(ec) ?? [],
    );
    const imageCard = encounterCards.find((c) => c.imageUrl);
    return {
      code: s.scenarioCode,
      name: s.scenarioName,
      prefix: s.scenarioPrefix,
      campaignCode: raw.campaignCode,
      campaignName: raw.campaignName,
      encounterCodes: s.encounterCodes,
      imageUrl: imageCard?.imageUrl,
    };
  });
  const imageUrl = scenarios[0]?.imageUrl;
  return {
    code: raw.campaignCode,
    name: raw.campaignName,
    scenarios,
    imageUrl,
  };
});

const campaignsByCode = new Map<string, Campaign>();
for (const c of campaigns) {
  campaignsByCode.set(c.code, c);
}

const scenariosByCode = new Map<string, Scenario>();
for (const c of campaigns) {
  for (const s of c.scenarios) {
    scenariosByCode.set(s.code, s);
  }
}

function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const card of allCards) {
    entries.push({
      id: `card:${card.code}`,
      type: "card",
      code: card.code,
      name: card.name,
      imageUrl: card.imageUrl,
      typeCode: card.typeCode,
      packName: card.packName,
    });
  }

  for (const es of encounterSets.values()) {
    entries.push({
      id: `encounter:${es.code}`,
      type: "encounter",
      code: es.code,
      name: es.name,
      imageUrl: es.imageUrl,
    });
  }

  for (const s of scenariosByCode.values()) {
    entries.push({
      id: `scenario:${s.code}`,
      type: "scenario",
      code: s.code,
      name: s.name,
      imageUrl: s.imageUrl,
    });
  }

  for (const c of campaigns) {
    entries.push({
      id: `campaign:${c.code}`,
      type: "campaign",
      code: c.code,
      name: c.name,
      imageUrl: c.imageUrl,
    });
  }

  return entries;
}

export function getAllCards(): Card[] {
  return allCards;
}

export function getCard(code: string): Card | undefined {
  return cardsByCode.get(code);
}

export function getEncounterSet(code: string): EncounterSet | undefined {
  return encounterSets.get(code);
}

export function getAllEncounterSets(): EncounterSet[] {
  return [...encounterSets.values()];
}

export function getCampaign(code: string): Campaign | undefined {
  return campaignsByCode.get(code);
}

export function getAllCampaigns(): Campaign[] {
  return campaigns;
}

export function getScenario(code: string): Scenario | undefined {
  return scenariosByCode.get(code);
}

export function getEncounterCards(code: string): Card[] {
  return cardsByEncounter.get(code) ?? [];
}

export function getSearchIndex(): SearchEntry[] {
  return buildSearchIndex();
}
