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
import {
  type Option,
  type FilterOptions,
  type CardMeta,
  type Filters,
  type ViewMode,
  type StatFilters,
  parseURL,
  toURL,
  parseStatFilters,
  parseViewMode,
  statChipLabel,
  computeScenarioOptions,
  computeValidEncounterCodes,
  computeEncounterOptions,
  computeValidTraits,
  computeTraitOptions,
  computeTypeOptions,
  cascadeCampaignChange,
  cascadeScenarioChange,
  cascadeEncounterChange,
  filterCards,
} from "@/src/data/filters";

interface Props {
  cards: Card[];
  filterOptions: FilterOptions;
  cardMeta: Record<string, CardMeta>;
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

export default function CardBrowser({ cards, filterOptions, cardMeta }: Props) {
  const [filters, setFiltersState] = useState<Filters>(() =>
    parseURL(window.location.search, filterOptions),
  );
  const [viewMode, setViewModeState] = useState<ViewMode>(() =>
    parseViewMode(window.location.search),
  );
  const [statFilters, setStatFiltersState] = useState<StatFilters>(() =>
    parseStatFilters(window.location.search),
  );
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) setHeaderHeight(header.getBoundingClientRect().height);
  }, []);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;
  const statFiltersRef = useRef(statFilters);
  statFiltersRef.current = statFilters;

  const pushURL = useCallback(() => {
    history.pushState(null, "", toURL(filtersRef.current, viewModeRef.current, statFiltersRef.current, window.location.pathname));
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

  const handleChartClick = useCallback((kind: "types" | "traits" | "encounters", name: string) => {
    const opts = filterOptions[kind];
    const option = kind === "traits"
      ? opts.find((o) => o.value === name)
      : opts.find((o) => o.label === name);
    if (!option) return;
    const current = filtersRef.current[kind];
    if (current.some((o) => o.value === option.value)) return;
    const nextFilters = { ...filtersRef.current, [kind]: [...current, option] };
    setFiltersState(nextFilters);
    filtersRef.current = nextFilters;
    setViewModeState("cards");
    viewModeRef.current = "cards";
    pushURL();
  }, [filterOptions, pushURL]);

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
      setFiltersState(parseURL(window.location.search, filterOptions));
      setViewModeState(parseViewMode(window.location.search));
      setStatFiltersState(parseStatFilters(window.location.search));
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

  const scenarioOptions = useMemo(
    () => computeScenarioOptions(selectedCampaigns, filterOptions.scenarios),
    [filterOptions.scenarios, selectedCampaigns],
  );

  const validEncounterCodes = useMemo(
    () => computeValidEncounterCodes(selectedScenarios, selectedCampaigns, filterOptions.scenarios, scenarioOptions),
    [filterOptions.scenarios, scenarioOptions, selectedCampaigns, selectedScenarios],
  );

  const encounterOptions = useMemo(
    () => computeEncounterOptions(validEncounterCodes, filterOptions.encounters),
    [filterOptions.encounters, validEncounterCodes],
  );

  const validTraits = useMemo(
    () => computeValidTraits(selectedCampaigns, selectedScenarios, selectedEncounters, cards, cardMeta),
    [cards, cardMeta, selectedCampaigns, selectedScenarios, selectedEncounters],
  );

  const traitOptions = useMemo(
    () => computeTraitOptions(validTraits, filterOptions.traits),
    [filterOptions.traits, validTraits],
  );

  const typeOptions = useMemo(
    () => computeTypeOptions(selectedCampaigns, selectedScenarios, selectedEncounters, cards, cardMeta, filterOptions.types),
    [cards, cardMeta, filterOptions.types, selectedCampaigns, selectedScenarios, selectedEncounters],
  );

  const handleCampaignChange = (v: MultiValue<Option>) =>
    setFilters(cascadeCampaignChange(toOptions(v), filters, filterOptions, cards, cardMeta));

  const handleScenarioChange = (v: MultiValue<Option>) =>
    setFilters(cascadeScenarioChange(toOptions(v), filters, filterOptions, scenarioOptions, cards, cardMeta));

  const handleEncounterChange = (v: MultiValue<Option>) =>
    setFilters(cascadeEncounterChange(toOptions(v), filters, cards, cardMeta));

  const filteredCards = useMemo(
    () => filterCards(cards, cardMeta, filters, statFilters),
    [cards, cardMeta, filters, statFilters],
  );

  const filterKey = [
    selectedCampaigns.map((c) => c.value).join(","),
    selectedScenarios.map((s) => s.value).join(","),
    selectedEncounters.map((e) => e.value).join(","),
    selectedTraits.map((t) => t.value).join(","),
    selectedTypes.map((t) => t.value).join(","),
    Object.entries(statFilters).map(([k, v]) => `${k}=${v}`).join(","),
  ].join("|");

  return (
    <div style={{ marginTop: "-1.5rem" }}>
      <div style={css(s.stickyHeader, { top: headerHeight })}>
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
      </div>
      <div style={{ paddingTop: "0.75rem" }}>
        {viewMode === "stats" ? (
          <CardStats cards={filteredCards} onCellClick={handleStatClick} activeFilters={statFilters} onChartClick={handleChartClick} />
        ) : (
          <CardGrid key={filterKey} cards={filteredCards} />
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  stickyHeader: {
    position: "sticky",
    zIndex: 5,
    background: "var(--bg-0)",
    paddingTop: "1.5rem",
    paddingBottom: "0.25rem",
    borderBottom: "1px solid var(--border)",
  },
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
