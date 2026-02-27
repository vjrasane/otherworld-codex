import Select, {
  type MultiValue,
  type MultiValueProps,
  type StylesConfig,
  components,
} from "react-select";
import { CardGrid } from "./CardGrid";
import CardStats from "./CardStats";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Card } from "@/src/data/card";
import { css } from "../styles";

type ViewMode = "cards" | "stats";

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
  };
}

function toURL(filters: Filters): string {
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(PARAM_KEYS)) {
    const selected = filters[field as keyof Filters];
    if (selected.length > 0) {
      params.set(key, selected.map((o) => o.value).join(","));
    }
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
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const setFilters = useCallback((next: Filters) => {
    setFiltersState(next);
    history.pushState(null, "", toURL(next));
  }, []);

  useEffect(() => {
    const onPopState = () => setFiltersState(parseURL(filterOptions));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [filterOptions]);

  const {
    campaigns: selectedCampaigns,
    scenarios: selectedScenarios,
    encounters: selectedEncounters,
    traits: selectedTraits,
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

    return cards.filter((card) => {
      const meta = cardMeta[card.code];
      if (!meta) return false;
      if (cVals.size > 0 && !meta.campaignCodes.some((c) => cVals.has(c)))
        return false;
      if (sVals.size > 0 && !meta.scenarioCodes.some((s) => sVals.has(s)))
        return false;
      if (eVals.size > 0 && !eVals.has(meta.encounterCode)) return false;
      if (tVals.size > 0 && !meta.traits.some((t) => tVals.has(t)))
        return false;
      return true;
    });
  }, [
    cards,
    cardMeta,
    selectedCampaigns,
    selectedScenarios,
    selectedEncounters,
    selectedTraits,
  ]);

  const filterKey = [
    selectedCampaigns.map((c) => c.value).join(","),
    selectedScenarios.map((s) => s.value).join(","),
    selectedEncounters.map((e) => e.value).join(","),
    selectedTraits.map((t) => t.value).join(","),
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
        </div>
        <div style={s.viewToggleStyle}>
          <button style={css(s.viewButtonStyle, viewMode === "cards" && s.viewButtonActive)} onClick={() => setViewMode("cards")}>Cards</button>
          <button style={css(s.viewButtonStyle, viewMode === "stats" && s.viewButtonActive)} onClick={() => setViewMode("stats")}>Stats</button>
        </div>
      </div>
      <div style={s.count}>{filteredCards.length} cards</div>
      {viewMode === "stats" ? (
        <CardStats cards={filteredCards} />
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
  count: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    marginBottom: "0.75rem",
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
