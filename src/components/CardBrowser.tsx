import Select, {
  type MultiValue,
  type MultiValueProps,
  type StylesConfig,
  components,
} from "react-select";
import { CardGrid } from "./CardGrid";
import CardStats from "./CardStats";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Card } from "@/src/data/card";
import { css } from "../styles";

type ViewMode = "cards" | "stats";
type StatFilters = Record<string, string>;

const STAT_PARAM_KEYS: Record<string, string> = {
  Health: "health", Fight: "fight", Evade: "evade",
  Damage: "damage", Horror: "horror", EnemyVictory: "victory",
  Shroud: "shroud", Clues: "clues", Clues_pp: "clues_pp", LocationVictory: "loc_victory",
};

const PARAM_TO_STAT = Object.fromEntries(
  Object.entries(STAT_PARAM_KEYS).map(([k, v]) => [v, k]),
);

function parseStatFilters(): StatFilters {
  const params = new URLSearchParams(window.location.search);
  const result: StatFilters = {};
  for (const [param, stat] of Object.entries(PARAM_TO_STAT)) {
    const val = params.get(param);
    if (val != null) result[stat] = val;
  }
  return result;
}

function isVariable(val: number | undefined): boolean {
  return val == null || val < 0;
}

const STAT_GETTERS: Record<string, (c: Card) => number | undefined> = {
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

const STAT_TYPE_CODE: Record<string, string> = {
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

function statChipLabel(stat: string, value: string): string {
  if (stat === "Clues_pp") return `clues/inv = ${value}`;
  if (stat === "EnemyVictory") return `enemy victory = ${value}`;
  if (stat === "LocationVictory") return `location victory = ${value}`;
  return `${stat.toLowerCase()} = ${value}`;
}

type Option = { label: string; value: string };

interface ScenarioOption extends Option {
  campaignCode: string;
  encounterCodes: string[];
}

interface FilterOptions {
  campaigns: Option[];
  scenarios: ScenarioOption[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

interface CardMeta {
  campaignCodes: string[];
  scenarioCodes: string[];
  encounterCode: string;
  traits: string[];
}

interface Filters {
  campaigns: Option[];
  scenarios: Option[];
  encounters: Option[];
  traits: Option[];
  types: Option[];
}

interface Props {
  cards: Card[];
  filterOptions: FilterOptions;
  cardMeta: Record<string, CardMeta>;
}

const PARAM_KEYS = {
  campaigns: "campaign",
  scenarios: "scenario",
  encounters: "encounter",
  traits: "trait",
  types: "type",
} as const;

function parseURL(filterOptions: FilterOptions): Filters {
  const params = new URLSearchParams(window.location.search);
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

function toURL(filters: Filters, viewMode: ViewMode, statFilters: StatFilters): string {
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
  return str ? `?${str}` : window.location.pathname;
}

function toOptions(v: MultiValue<Option>): Option[] {
  return [...v];
}

function CustomMultiValue(props: MultiValueProps<Option, true>) {
  const values = props.selectProps.value as Option[];
  if (values.length > 1) {
    if (values[0].value !== props.data.value) return null;
    return (
      <components.MultiValue
        {...props}
        components={{ ...props.components, Remove: () => null }}
      >
        {values.length} selected
      </components.MultiValue>
    );
  }
  return <components.MultiValue {...props} />;
}

const selectComponents = { MultiValue: CustomMultiValue };

const selectStyles: StylesConfig<Option, true> = {
  control: (base, { isFocused }) => ({
    ...base,
    background: "var(--bg-2)",
    borderColor: isFocused ? "var(--accent)" : "var(--border)",
    boxShadow: isFocused ? "0 0 0 1px var(--accent)" : "none",
    "&:hover": { borderColor: "var(--accent)" },
    minHeight: 38,
    flexWrap: "nowrap",
  }),
  valueContainer: (base) => ({
    ...base,
    flexWrap: "nowrap",
    overflow: "hidden",
  }),
  menu: (base) => ({
    ...base,
    background: "var(--bg-1)",
    border: "1px solid var(--border)",
    zIndex: 10,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected
      ? "var(--bg-3)"
      : isFocused
        ? "var(--bg-2)"
        : undefined,
    color: "var(--text-primary)",
    ":active": { background: "var(--bg-3)" },
  }),
  multiValue: (base) => ({
    ...base,
    background: "var(--bg-3)",
    minWidth: 0,
    flexShrink: 1,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--text-muted)",
    ":hover": { background: "var(--danger)", color: "var(--text-primary)" },
  }),
  input: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--text-muted)",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: "var(--border)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--text-muted)",
    ":hover": { color: "var(--text-primary)" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--text-muted)",
    ":hover": { color: "var(--danger)" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--text-muted)",
  }),
};



export default function CardBrowser({ cards, filterOptions, cardMeta }: Props) {
  const [filters, setFiltersState] = useState<Filters>(() =>
    parseURL(filterOptions),
  );
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "stats" ? "stats" : "cards";
  });
  const [statFilters, setStatFiltersState] = useState<StatFilters>(parseStatFilters);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const statFiltersRef = useRef(statFilters);
  statFiltersRef.current = statFilters;

  const pushURL = useCallback(() => {
    history.pushState(null, "", toURL(filtersRef.current, viewModeRef.current, statFiltersRef.current));
  }, []);

  const setFilters = useCallback((next: Filters) => {
    setFiltersState(next);
    filtersRef.current = next;
    pushURL();
  }, [pushURL]);

  const setViewMode = useCallback((next: ViewMode) => {
    setViewModeState(next);
    viewModeRef.current = next;
    pushURL();
  }, [pushURL]);

  const handleStatClick = useCallback((category: string, stat: string, value: string) => {
    const key = stat === "Victory" ? (category === "enemy" ? "EnemyVictory" : "LocationVictory") : stat;
    if (statFiltersRef.current[key] === value) return;
    const next = { ...statFiltersRef.current, [key]: value };
    setStatFiltersState(next);
    statFiltersRef.current = next;
    setViewModeState("cards");
    viewModeRef.current = "cards";
    pushURL();
  }, [pushURL]);

  const clearStatFilter = useCallback((stat: string) => {
    const next = { ...statFiltersRef.current };
    delete next[stat];
    setStatFiltersState(next);
    statFiltersRef.current = next;
    pushURL();
  }, [pushURL]);

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      setFiltersState(parseURL(filterOptions));
      setViewModeState(params.get("view") === "stats" ? "stats" : "cards");
      setStatFiltersState(parseStatFilters());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [filterOptions]);

  const {
    campaigns: selectedCampaigns,
    scenarios: selectedScenarios,
    encounters: selectedEncounters,
    traits: selectedTraits,
    types: selectedTypes,
  } = filters;

  const scenarioOptions = useMemo(() => {
    if (selectedCampaigns.length === 0) return filterOptions.scenarios;
    const codes = new Set(selectedCampaigns.map((c) => c.value));
    return filterOptions.scenarios.filter((s) => codes.has(s.campaignCode));
  }, [filterOptions.scenarios, selectedCampaigns]);

  const validEncounterCodes = useMemo(() => {
    const active =
      selectedScenarios.length > 0
        ? filterOptions.scenarios.filter((s) =>
          selectedScenarios.some((sel) => sel.value === s.value),
        )
        : selectedCampaigns.length > 0
          ? scenarioOptions
          : null;
    if (!active) return null;
    const codes = new Set<string>();
    for (const s of active) s.encounterCodes.forEach((ec) => codes.add(ec));
    return codes;
  }, [filterOptions.scenarios, scenarioOptions, selectedCampaigns, selectedScenarios]);

  const encounterOptions = useMemo(() => {
    if (!validEncounterCodes) return filterOptions.encounters;
    return filterOptions.encounters.filter((e) =>
      validEncounterCodes.has(e.value),
    );
  }, [filterOptions.encounters, validEncounterCodes]);

  const validTraits = useMemo(() => {
    const cVals = new Set(selectedCampaigns.map((c) => c.value));
    const sVals = new Set(selectedScenarios.map((s) => s.value));
    const eVals = new Set(selectedEncounters.map((e) => e.value));
    const noFilter = cVals.size === 0 && sVals.size === 0 && eVals.size === 0;
    if (noFilter) return null;
    const traits = new Set<string>();
    for (const card of cards) {
      const meta = cardMeta[card.code];
      if (!meta) continue;
      if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c)))
        continue;
      if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s)))
        continue;
      if (eVals.size > 0 && !eVals.has(meta.encounterCode)) continue;
      for (const t of meta.traits) traits.add(t);
    }
    return traits;
  }, [cards, cardMeta, selectedCampaigns, selectedScenarios, selectedEncounters]);

  const traitOptions = useMemo(() => {
    if (!validTraits) return filterOptions.traits;
    return filterOptions.traits.filter((t) => validTraits.has(t.value));
  }, [filterOptions.traits, validTraits]);

  const typeOptions = useMemo(() => {
    const cVals = new Set(selectedCampaigns.map((c) => c.value));
    const sVals = new Set(selectedScenarios.map((s) => s.value));
    const eVals = new Set(selectedEncounters.map((e) => e.value));
    const noFilter = cVals.size === 0 && sVals.size === 0 && eVals.size === 0;
    if (noFilter) return filterOptions.types;
    const available = new Set<string>();
    for (const card of cards) {
      const meta = cardMeta[card.code];
      if (!meta) continue;
      if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c))) continue;
      if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s))) continue;
      if (eVals.size > 0 && !eVals.has(meta.encounterCode)) continue;
      available.add(card.typeCode);
    }
    return filterOptions.types.filter((t) => available.has(t.value));
  }, [cards, cardMeta, filterOptions.types, selectedCampaigns, selectedScenarios, selectedEncounters]);

  function pruneTraits(
    traits: Option[],
    campaignVals: Set<string>,
    scenarioVals: Set<string>,
    encounterVals: Set<string>,
  ): Option[] {
    const noFilter =
      campaignVals.size === 0 &&
      scenarioVals.size === 0 &&
      encounterVals.size === 0;
    if (noFilter) return traits;
    const available = new Set<string>();
    for (const card of cards) {
      const meta = cardMeta[card.code];
      if (!meta) continue;
      if (campaignVals.size > 0 && !meta.campaignCodes.some((c) => campaignVals.has(c)))
        continue;
      if (scenarioVals.size > 0 && !meta.scenarioCodes.some((s) => scenarioVals.has(s)))
        continue;
      if (encounterVals.size > 0 && !encounterVals.has(meta.encounterCode))
        continue;
      for (const t of meta.traits) available.add(t);
    }
    return traits.filter((t) => available.has(t.value));
  }

  const handleCampaignChange = (v: MultiValue<Option>) => {
    const next = toOptions(v);
    let scenarios = filters.scenarios;
    if (next.length > 0) {
      const codes = new Set(next.map((c) => c.value));
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
        : next.length > 0
          ? filterOptions.scenarios.filter((s) => {
            const codes = new Set(next.map((c) => c.value));
            return codes.has(s.campaignCode);
          })
          : null;
    let encounters = filters.encounters;
    if (activeScenarios) {
      const ecCodes = new Set<string>();
      for (const s of activeScenarios)
        s.encounterCodes.forEach((ec) => ecCodes.add(ec));
      encounters = encounters.filter((e) => ecCodes.has(e.value));
    }
    const cVals = new Set(next.map((c) => c.value));
    const sVals = new Set(scenarios.map((s) => s.value));
    const eVals = new Set(encounters.map((e) => e.value));
    const traits = pruneTraits(filters.traits, cVals, sVals, eVals);
    setFilters({ ...filters, campaigns: next, scenarios, encounters, traits });
  };

  const handleScenarioChange = (v: MultiValue<Option>) => {
    const next = toOptions(v);
    const active =
      next.length > 0
        ? filterOptions.scenarios.filter((s) =>
          next.some((sel) => sel.value === s.value),
        )
        : selectedCampaigns.length > 0
          ? scenarioOptions
          : null;
    let encounters = filters.encounters;
    if (active) {
      const ecCodes = new Set<string>();
      for (const s of active) s.encounterCodes.forEach((ec) => ecCodes.add(ec));
      encounters = encounters.filter((e) => ecCodes.has(e.value));
    }
    const cVals = new Set(selectedCampaigns.map((c) => c.value));
    const sVals = new Set(next.map((s) => s.value));
    const eVals = new Set(encounters.map((e) => e.value));
    const traits = pruneTraits(filters.traits, cVals, sVals, eVals);
    setFilters({ ...filters, scenarios: next, encounters, traits });
  };

  const handleEncounterChange = (v: MultiValue<Option>) => {
    const next = toOptions(v);
    const cVals = new Set(selectedCampaigns.map((c) => c.value));
    const sVals = new Set(selectedScenarios.map((s) => s.value));
    const eVals = new Set(next.map((e) => e.value));
    const traits = pruneTraits(filters.traits, cVals, sVals, eVals);
    setFilters({ ...filters, encounters: next, traits });
  };

  const filteredCards = useMemo(() => {
    const cVals = new Set(selectedCampaigns.map((c) => c.value));
    const sVals = new Set(selectedScenarios.map((s) => s.value));
    const eVals = new Set(selectedEncounters.map((e) => e.value));
    const tVals = new Set(selectedTraits.map((t) => t.value));
    const tyVals = new Set(selectedTypes.map((t) => t.value));

    let result = cards.filter((card) => {
      if (!card.encounterCode) return false;
      const meta = cardMeta[card.code];
      if (!meta) return false;
      if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c)))
        return false;
      if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s)))
        return false;
      if (eVals.size > 0 && !eVals.has(meta.encounterCode)) return false;
      if (tVals.size > 0 && !meta.traits.some((t) => tVals.has(t)))
        return false;
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
  }, [
    cards,
    cardMeta,
    selectedCampaigns,
    selectedScenarios,
    selectedEncounters,
    selectedTraits,
    selectedTypes,
    statFilters,
  ]);

  const filterKey = [
    selectedCampaigns.map((c) => c.value).join(","),
    selectedScenarios.map((s) => s.value).join(","),
    selectedEncounters.map((e) => e.value).join(","),
    selectedTraits.map((t) => t.value).join(","),
    selectedTypes.map((t) => t.value).join(","),
    Object.entries(statFilters).map(([k, v]) => `${k}=${v}`).join(","),
  ].join("|");

  return (
    <>
      <div style={s.filtersRow}>
        <div style={s.filters}>
          <div>
            <label style={s.label}>Campaign</label>
            <Select<Option, true>
              isMulti
              options={filterOptions.campaigns}
              value={selectedCampaigns}
              onChange={handleCampaignChange}
              placeholder="All campaigns"
              styles={selectStyles}
              components={selectComponents}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
          <div>
            <label style={s.label}>Scenario</label>
            <Select<Option, true>
              isMulti
              options={scenarioOptions}
              value={selectedScenarios}
              onChange={handleScenarioChange}
              placeholder="All scenarios"
              styles={selectStyles}
              components={selectComponents}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
          <div>
            <label style={s.label}>Encounter Set</label>
            <Select<Option, true>
              isMulti
              options={encounterOptions}
              value={selectedEncounters}
              onChange={handleEncounterChange}
              placeholder="All encounter sets"
              styles={selectStyles}
              components={selectComponents}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
          <div>
            <label style={s.label}>Trait</label>
            <Select<Option, true>
              isMulti
              options={traitOptions}
              value={selectedTraits}
              onChange={(v) => setFilters({ ...filters, traits: toOptions(v) })}
              placeholder="All traits"
              styles={selectStyles}
              components={selectComponents}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
          <div>
            <label style={s.label}>Type</label>
            <Select<Option, true>
              isMulti
              options={typeOptions}
              value={selectedTypes}
              onChange={(v) => setFilters({ ...filters, types: toOptions(v) })}
              placeholder="All types"
              styles={selectStyles}
              components={selectComponents}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>
        </div>
        <div style={s.viewToggleStyle}>
          <button style={css(s.viewButtonStyle, viewMode === "cards" && s.viewButtonActive)} onClick={() => setViewMode("cards")}>Cards</button>
          <button style={css(s.viewButtonStyle, viewMode === "stats" && s.viewButtonActive)} onClick={() => setViewMode("stats")}>Stats</button>
        </div>
      </div>
      <div style={s.countRow}>
        <div style={s.count}>{filteredCards.length} cards</div>
        <div style={s.statChips}>
          {Object.entries(statFilters).map(([stat, value]) => (
            <button key={stat} onClick={() => clearStatFilter(stat)} style={s.statChip}>
              {statChipLabel(stat, value)} ×
            </button>
          ))}
        </div>
      </div>
      {viewMode === "stats" ? (
        <CardStats cards={filteredCards} onCellClick={handleStatClick} activeFilters={statFilters} />
      ) : (
        <CardGrid key={filterKey} cards={filteredCards} />
      )}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  filtersRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "end",
    marginBottom: "1rem",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "0.75rem",
    flex: 1,
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginBottom: "0.25rem",
  },
  countRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    minHeight: 28,
  },
  count: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  statChips: {
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap" as const,
  },
  statChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.2rem 0.5rem",
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
    font: "inherit",
  },

  viewToggleStyle: {
    display: "inline-flex",
    background: "var(--bg-2)",
    borderRadius: 6,
    border: "1px solid var(--border)",
    overflow: "hidden",
    fontSize: "0.8rem",
    alignSelf: "end",
    marginBottom: "0.25rem"
  },
  viewButtonStyle: {
    padding: "0.3rem 0.6rem",
    background: "transparent",
    color: "var(--text-muted)",
    border: "none",
    cursor: "pointer",
    fontWeight: 400,
    font: "inherit",
  },
  viewButtonActive: {
    background: "var(--accent)",
    color: "var(--bg-0)",
    fontWeight: 600,
  }
};
