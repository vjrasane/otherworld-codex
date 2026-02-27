import cardsJson from "../../data/cards.json";

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
  doubleSided: boolean;
  backImageUrl?: string;
  backName?: string;
  text?: string;
  flavor?: string;
  subname?: string;
  xp?: number;
  cost?: number;
  health?: number;
  sanity?: number;
  skillWillpower?: number;
  skillIntellect?: number;
  skillCombat?: number;
  skillAgility?: number;
  enemyFight?: number;
  enemyEvade?: number;
  enemyDamage?: number;
  enemyHorror?: number;
  shroud?: number;
  clues?: number;
  cluesFixed?: boolean;
  victory?: number;
  healthPerInvestigator?: boolean;
  isUnique: boolean;
  position: number;
  slot?: string;
  linkedCard?: Card;
  linkedToCode?: string;
  linkedToCard?: Card;
}

const IMAGE_BASE = "https://arkhamdb.com";

function cardImageUrl(imagesrc?: string): string | undefined {
  if (!imagesrc) return undefined;
  return IMAGE_BASE + imagesrc;
}

function parseBaseCard(raw: any): Card {
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
    doubleSided: raw.double_sided ?? false,
    backImageUrl: cardImageUrl(raw.backimagesrc ?? undefined),
    backName: raw.back_name ?? undefined,
    text: raw.text ?? undefined,
    flavor: raw.flavor ?? undefined,
    subname: raw.subname ?? undefined,
    cost: (raw as Record<string, unknown>).cost as number | undefined,
    health: raw.health ?? undefined,
    sanity: raw.sanity ?? undefined,
    xp: raw.xp ?? undefined,
    skillWillpower: raw.skill_willpower ?? undefined,
    skillIntellect: raw.skill_intellect ?? undefined,
    skillCombat: raw.skill_combat ?? undefined,
    skillAgility: raw.skill_agility ?? undefined,
    enemyFight: raw.enemy_fight ?? undefined,
    enemyEvade: raw.enemy_evade ?? undefined,
    enemyDamage: raw.enemy_damage ?? undefined,
    enemyHorror: raw.enemy_horror ?? undefined,
    shroud: raw.shroud ?? undefined,
    clues: raw.clues ?? undefined,
    cluesFixed: raw.clues_fixed ?? undefined,
    victory: raw.victory ?? undefined,
    healthPerInvestigator: raw.health_per_investigator ?? undefined,
    isUnique: raw.is_unique,
    position: raw.position,
    slot: raw.real_slot || undefined,
  };
}

function parseCard(raw: any): Card {
  return {
    ...parseBaseCard(raw),
    linkedToCode: raw.linked_to_code ?? undefined,
    linkedCard: raw.linked_card ? parseBaseCard(raw.linked_card) : undefined,
  };
}

const allCards: Card[] = [];
for (const raw of cardsJson as any[]) {
  allCards.push(parseCard(raw));
}

const cardsByCode = new Map<string, Card>();
for (const card of allCards) {
  cardsByCode.set(card.code, card);
}

for (const card of allCards) {
  if (!card.linkedToCode) continue;
  const linkedCard = cardsByCode.get(card.linkedToCode);
  if (!linkedCard) continue;
  linkedCard.linkedToCard = card;
}

const cardsByEncounter = new Map<string, Card[]>();
for (const card of allCards) {
  if (card.encounterCode) {
    const list = cardsByEncounter.get(card.encounterCode) ?? [];
    list.push(card);
    cardsByEncounter.set(card.encounterCode, list);
  }
}

export { allCards, cardsByCode, cardsByEncounter };
