import type { Card } from "./card";

export type ViewMode = "cards" | "stats";
export type StatFilters = Record<string, string>;

export type Option = { label: string; value: string };

export interface ScenarioOption extends Option {
  campaignCode: string;
  encounterCodes: string[];
}

export interface FilterOptions {
  campaigns: Option[];
  scenarios: ScenarioOption[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

export interface CardMeta {
  campaignCodes: string[];
  scenarioCodes: string[];
  encounterCode: string;
  traits: string[];
}

export interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

export const PARAM_KEYS = {
  campaigns: "campaign",
  scenarios: "scenario",
  encounters: "encounter",
  traits: "trait",
  types: "type",
} as const;

export const STAT_PARAM_KEYS: Record<string, string> = {
  Health: "health", Fight: "fight", Evade: "evade",
  Damage: "damage", Horror: "horror", EnemyVictory: "victory",
  Shroud: "shroud", Clues: "clues", Clues_pp: "clues_pp", LocationVictory: "loc_victory",
};

export const PARAM_TO_STAT = Object.fromEntries(
  Object.entries(STAT_PARAM_KEYS).map(([k, v]) => [v, k]),
);

export const STAT_GETTERS: Record<string, (c: Card) => number | undefined> = {
  Health: (c) => c.health,
  Fight: (c) => c.enemyFight,
  Evade: (c) => c.enemyEvade,
  Damage: (c) => c.enemyDamage,
  Horror: (c) => c.enemyHorror,
  EnemyVictory: (c) => c.victory,
  Shroud: (c) => c.shroud,
  Clues: (c) => c.clues,
  Clues_pp: (c) => c.clues,
  LocationVictory: (c) => c.victory,
};

export const STAT_TYPE_CODE: Record<string, string> = {
  Health: "enemy",
  Fight: "enemy",
  Evade: "enemy",
  Damage: "enemy",
  Horror: "enemy",
  EnemyVictory: "enemy",
  Shroud: "location",
  Clues: "location",
  Clues_pp: "location",
  LocationVictory: "location",
};

export function isVariable(val: number | undefined): boolean {
  return val == null || val < 0;
}

export function statChipLabel(stat: string, value: string): string {
  if (stat === "Clues_pp") return `clues/inv = ${value}`;
  if (stat === "EnemyVictory") return `enemy victory = ${value}`;
  if (stat === "LocationVictory") return `location victory = ${value}`;
  return `${stat.toLowerCase()} = ${value}`;
}

export function parseStatFilters(search: string): StatFilters {
  const params = new URLSearchParams(search);
  const result: StatFilters = {};
  for (const [param, stat] of Object.entries(PARAM_TO_STAT)) {
    const val = params.get(param);
    if (val != null) result[stat] = val;
  }
  return result;
}

export function parseViewMode(search: string): ViewMode {
  const params = new URLSearchParams(search);
  return params.get("view") === "stats" ? "stats" : "cards";
}

export function parseURL(search: string, filterOptions: FilterOptions): Filters {
  const params = new URLSearchParams(search);
  const resolve = <T extends Option>(key: string, options: T[]): T[] => {
    const val = params.get(key);
    if (!val) return [];
    const values = new Set(val.split(","));
    return options.filter((o) => values.has(o.value));
  };
  return {
    campaigns: resolve(PARAM_KEYS.campaigns, filterOptions.campaigns),
    scenarios: resolve(PARAM_KEYS.scenarios, filterOptions.scenarios),
    encounters: resolve(PARAM_KEYS.encounters, filterOptions.encounters),
    traits: resolve(PARAM_KEYS.traits, filterOptions.traits),
    types: resolve(PARAM_KEYS.types, filterOptions.types),
  };
}

export function toURL(filters: Filters, viewMode: ViewMode, statFilters: StatFilters, pathname: string): string {
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(PARAM_KEYS)) {
    const selected = filters[field as keyof Filters];
    if (selected.length > 0) {
      params.set(key, selected.map((o) => o.value).join(","));
    }
  }
  if (viewMode === "stats") params.set("view", "stats");
  for (const [stat, value] of Object.entries(statFilters)) {
    const param = STAT_PARAM_KEYS[stat];
    if (param) params.set(param, value);
  }
  const str = params.toString();
  return str ? `?${str}` : pathname;
}

export function computeScenarioOptions(
  selectedCampaigns: Option[],
  allScenarios: ScenarioOption[],
): ScenarioOption[] {
  if (selectedCampaigns.length === 0) return allScenarios;
  const codes = new Set(selectedCampaigns.map((c) => c.value));
  return allScenarios.filter((s) => codes.has(s.campaignCode));
}

export function computeValidEncounterCodes(
  selectedScenarios: Option[],
  selectedCampaigns: Option[],
  allScenarios: ScenarioOption[],
  scenarioOptions: ScenarioOption[],
): Set<string> | null {
  const active =
    selectedScenarios.length > 0
      ? allScenarios.filter((s) =>
        selectedScenarios.some((sel) => sel.value === s.value),
      )
      : selectedCampaigns.length > 0
        ? scenarioOptions
        : null;
  if (!active) return null;
  const codes = new Set<string>();
  for (const s of active) s.encounterCodes.forEach((ec) => codes.add(ec));
  return codes;
}

export function computeEncounterOptions(
  validEncounterCodes: Set<string> | null,
  allEncounters: Option[],
): Option[] {
  if (!validEncounterCodes) return allEncounters;
  return allEncounters.filter((e) => validEncounterCodes.has(e.value));
}

export function computeValidTraits(
  selectedCampaigns: Option[],
  selectedScenarios: Option[],
  selectedEncounters: Option[],
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
): Set<string> | null {
  const cVals = new Set(selectedCampaigns.map((c) => c.value));
  const sVals = new Set(selectedScenarios.map((s) => s.value));
  const eVals = new Set(selectedEncounters.map((e) => e.value));
  if (cVals.size === 0 && sVals.size === 0 && eVals.size === 0) return null;
  const traits = new Set<string>();
  for (const card of cards) {
    const meta = cardMeta[card.code];
    if (!meta) continue;
    if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c))) continue;
    if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s))) continue;
    if (eVals.size > 0 && !eVals.has(meta.encounterCode)) continue;
    for (const t of meta.traits) traits.add(t);
  }
  return traits;
}

export function computeTraitOptions(
  validTraits: Set<string> | null,
  allTraits: Option[],
): Option[] {
  if (!validTraits) return allTraits;
  return allTraits.filter((t) => validTraits.has(t.value));
}

export function computeTypeOptions(
  selectedCampaigns: Option[],
  selectedScenarios: Option[],
  selectedEncounters: Option[],
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
  allTypes: Option[],
): Option[] {
  const cVals = new Set(selectedCampaigns.map((c) => c.value));
  const sVals = new Set(selectedScenarios.map((s) => s.value));
  const eVals = new Set(selectedEncounters.map((e) => e.value));
  if (cVals.size === 0 && sVals.size === 0 && eVals.size === 0) return allTypes;
  const available = new Set<string>();
  for (const card of cards) {
    const meta = cardMeta[card.code];
    if (!meta) continue;
    if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c))) continue;
    if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s))) continue;
    if (eVals.size > 0 && !eVals.has(meta.encounterCode)) continue;
    available.add(card.typeCode);
  }
  return allTypes.filter((t) => available.has(t.value));
}

function pruneTraits(
  traits: Option[],
  campaignVals: Set<string>,
  scenarioVals: Set<string>,
  encounterVals: Set<string>,
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
): Option[] {
  if (campaignVals.size === 0 && scenarioVals.size === 0 && encounterVals.size === 0) return traits;
  const available = new Set<string>();
  for (const card of cards) {
    const meta = cardMeta[card.code];
    if (!meta) continue;
    if (campaignVals.size > 0 && !meta.campaignCodes.some((c) => campaignVals.has(c))) continue;
    if (scenarioVals.size > 0 && !meta.scenarioCodes.some((s) => scenarioVals.has(s))) continue;
    if (encounterVals.size > 0 && !encounterVals.has(meta.encounterCode)) continue;
    for (const t of meta.traits) available.add(t);
  }
  return traits.filter((t) => available.has(t.value));
}

export function cascadeCampaignChange(
  nextCampaigns: Option[],
  currentFilters: Filters,
  filterOptions: FilterOptions,
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
): Filters {
  let scenarios = currentFilters.scenarios;
  if (nextCampaigns.length > 0) {
    const codes = new Set(nextCampaigns.map((c) => c.value));
    scenarios = scenarios.filter((s) => {
      const opt = filterOptions.scenarios.find((o) => o.value === s.value);
      return opt && codes.has(opt.campaignCode);
    });
  }
  const activeScenarios =
    scenarios.length > 0
      ? filterOptions.scenarios.filter((s) =>
        scenarios.some((sel) => sel.value === s.value),
      )
      : nextCampaigns.length > 0
        ? filterOptions.scenarios.filter((s) => {
          const codes = new Set(nextCampaigns.map((c) => c.value));
          return codes.has(s.campaignCode);
        })
        : null;
  let encounters = currentFilters.encounters;
  if (activeScenarios) {
    const ecCodes = new Set<string>();
    for (const s of activeScenarios) s.encounterCodes.forEach((ec) => ecCodes.add(ec));
    encounters = encounters.filter((e) => ecCodes.has(e.value));
  }
  const cVals = new Set(nextCampaigns.map((c) => c.value));
  const sVals = new Set(scenarios.map((s) => s.value));
  const eVals = new Set(encounters.map((e) => e.value));
  const traits = pruneTraits(currentFilters.traits, cVals, sVals, eVals, cards, cardMeta);
  return { ...currentFilters, campaigns: nextCampaigns, scenarios, encounters, traits };
}

export function cascadeScenarioChange(
  nextScenarios: Option[],
  currentFilters: Filters,
  filterOptions: FilterOptions,
  scenarioOptions: ScenarioOption[],
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
): Filters {
  const selectedCampaigns = currentFilters.campaigns;
  const active =
    nextScenarios.length > 0
      ? filterOptions.scenarios.filter((s) =>
        nextScenarios.some((sel) => sel.value === s.value),
      )
      : selectedCampaigns.length > 0
        ? scenarioOptions
        : null;
  let encounters = currentFilters.encounters;
  if (active) {
    const ecCodes = new Set<string>();
    for (const s of active) s.encounterCodes.forEach((ec) => ecCodes.add(ec));
    encounters = encounters.filter((e) => ecCodes.has(e.value));
  }
  const cVals = new Set(selectedCampaigns.map((c) => c.value));
  const sVals = new Set(nextScenarios.map((s) => s.value));
  const eVals = new Set(encounters.map((e) => e.value));
  const traits = pruneTraits(currentFilters.traits, cVals, sVals, eVals, cards, cardMeta);
  return { ...currentFilters, scenarios: nextScenarios, encounters, traits };
}

export function cascadeEncounterChange(
  nextEncounters: Option[],
  currentFilters: Filters,
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
): Filters {
  const cVals = new Set(currentFilters.campaigns.map((c) => c.value));
  const sVals = new Set(currentFilters.scenarios.map((s) => s.value));
  const eVals = new Set(nextEncounters.map((e) => e.value));
  const traits = pruneTraits(currentFilters.traits, cVals, sVals, eVals, cards, cardMeta);
  return { ...currentFilters, encounters: nextEncounters, traits };
}

export function filterCards(
  cards: Card[],
  cardMeta: Record<string, CardMeta>,
  filters: Filters,
  statFilters: StatFilters,
): Card[] {
  const cVals = new Set(filters.campaigns.map((c) => c.value));
  const sVals = new Set(filters.scenarios.map((s) => s.value));
  const eVals = new Set(filters.encounters.map((e) => e.value));
  const tVals = new Set(filters.traits.map((t) => t.value));
  const tyVals = new Set(filters.types.map((t) => t.value));

  let result = cards.filter((card) => {
    if (!card.encounterCode) return false;
    const meta = cardMeta[card.code];
    if (!meta) return false;
    if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c))) return false;
    if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s))) return false;
    if (eVals.size > 0 && !eVals.has(meta.encounterCode)) return false;
    if (tVals.size > 0 && !meta.traits.some((t) => tVals.has(t))) return false;
    if (tyVals.size > 0 && !tyVals.has(card.typeCode)) return false;
    return true;
  });

  for (const [stat, value] of Object.entries(statFilters)) {
    const typeCode = STAT_TYPE_CODE[stat];
    const getter = STAT_GETTERS[stat];
    if (!typeCode || !getter) continue;
    result = result.filter((card) => {
      if (card.typeCode !== typeCode) return false;
      if (value === "?") {
        if (stat === "Health") return isVariable(card.health) || card.healthPerInvestigator === true;
        if (stat === "Damage") return card.enemyDamage != null && card.enemyDamage < 0;
        if (stat === "Horror") return card.enemyHorror != null && card.enemyHorror < 0;
        return isVariable(getter(card));
      }
      const numVal = parseInt(value);
      if (stat === "Clues_pp") return !card.cluesFixed && (card.clues ?? 0) > 0 && getter(card) === numVal;
      if (stat === "Clues") return (card.cluesFixed === true || card.clues === 0) && getter(card) === numVal;
      if (stat === "Health") return !(isVariable(card.health) || card.healthPerInvestigator === true) && getter(card) === numVal;
      if (stat === "Damage") return (card.enemyDamage ?? 0) === numVal && !(card.enemyDamage != null && card.enemyDamage < 0);
      if (stat === "Horror") return (card.enemyHorror ?? 0) === numVal && !(card.enemyHorror != null && card.enemyHorror < 0);
      if (stat === "EnemyVictory" || stat === "LocationVictory") return (card.victory ?? 0) === numVal;
      return !isVariable(getter(card)) && getter(card) === numVal;
    });
  }

  return result;
}
