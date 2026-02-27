import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Card } from "@/src/data/card";

type Entry = { name: string; value: number };
type CountMode = "unique" | "total";

const COLORS = [
  "#88c0d0", "#81a1c1", "#5e81ac", "#b48ead", "#a3be8c",
  "#ebcb8b", "#d08770", "#bf616a", "#8fbcbb", "#4c566a",
];

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-primary)",
};

const toggleStyle: React.CSSProperties = {
  display: "inline-flex",
  background: "var(--bg-2)",
  borderRadius: 6,
  border: "1px solid var(--border)",
  overflow: "hidden",
  fontSize: "0.8rem",
};

const selectStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text-secondary)",
  fontSize: "0.8rem",
  padding: "0.2rem 0.4rem",
  cursor: "pointer",
  font: "inherit",
};

const toggleButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.6rem",
  background: active ? "var(--accent)" : "transparent",
  color: active ? "var(--bg-0)" : "var(--text-muted)",
  border: "none",
  cursor: "pointer",
  fontWeight: active ? 600 : 400,
  font: "inherit",
});

function countBy(cards: Card[], key: (c: Card) => string | undefined, mode: CountMode): Entry[] {
  const map = new Map<string, number>();
  for (const card of cards) {
    const val = key(card);
    if (!val) continue;
    const weight = mode === "total" ? card.quantity : 1;
    map.set(val, (map.get(val) ?? 0) + weight);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function countTraits(cards: Card[], mode: CountMode): Entry[] {
  const map = new Map<string, number>();
  for (const card of cards) {
    if (!card.traits) continue;
    const weight = mode === "total" ? card.quantity : 1;
    for (const raw of card.traits.split(". ")) {
      const t = raw.replace(/\.$/, "").trim();
      if (t) map.set(t, (map.get(t) ?? 0) + weight);
    }
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function PieSection({ title, data, onClick }: { title: string; data: Entry[]; onClick?: (name: string) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.75rem" }}>{title}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              strokeWidth={0}
              isAnimationActive={false}
              style={onClick ? { cursor: "pointer" } : undefined}
              onClick={onClick ? (_, i) => onClick(data[i].name) : undefined}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {data.map((entry, i) => (
            <div
              key={entry.name}
              onClick={onClick ? () => onClick(entry.name) : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                cursor: onClick ? "pointer" : undefined,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ color: "var(--text-secondary)" }}>{entry.name}</span>
              <span style={{ color: "var(--text-muted)" }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LIMIT_OPTIONS = [20, 50, 0] as const;

function BarSection({ title, data, onClick }: { title: string; data: Entry[]; onClick?: (name: string) => void }) {
  const [limit, setLimit] = useState(20);
  if (data.length === 0) return null;
  const visible = limit > 0 ? data.slice(0, limit) : data;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 0.75rem" }}>
        <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{title}</h3>
        {data.length > 20 && (
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={selectStyle}
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n === 0 ? "All" : `Top ${n}`}</option>
            ))}
          </select>
        )}
      </div>
      <ResponsiveContainer width="100%" height={visible.length * 28 + 16}>
        <BarChart
          data={visible}
          layout="vertical"
          margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          onClick={onClick ? (state) => { if (state?.activeLabel) onClick(String(state.activeLabel)); } : undefined}
          style={onClick ? { cursor: "pointer" } : undefined}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} fill="#88c0d0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function statDistribution(
  cards: Card[],
  getter: (c: Card) => number | undefined,
  mode: CountMode,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const card of cards) {
    const val = getter(card);
    if (val == null) continue;
    const weight = mode === "total" ? card.quantity : 1;
    map.set(val, (map.get(val) ?? 0) + weight);
  }
  return map;
}

function isVariable(val: number | undefined): boolean {
  return val == null || val < 0;
}

type StatRow = { name: string; label?: React.ReactNode; color: string; [key: string]: string | number | React.ReactNode };

function isVarHealth(c: Card): boolean {
  return isVariable(c.health) || c.healthPerInvestigator === true;
}

function isNegative(val: number | undefined): boolean {
  return val != null && val < 0;
}

function buildEnemyData(cards: Card[], mode: CountMode): { rows: StatRow[]; keys: string[] } {
  const enemies = cards.filter((c) => c.typeCode === "enemy");
  const statDefs: { name: string; color: string; dist: Map<number, number>; varCount: number }[] = [
    { name: "Health", color: "76, 86, 106", dist: statDistribution(enemies, (c) => isVarHealth(c) ? undefined : c.health, mode), varCount: 0 },
    { name: "Fight", color: "208, 135, 112", dist: statDistribution(enemies, (c) => isVariable(c.enemyFight) ? undefined : c.enemyFight, mode), varCount: 0 },
    { name: "Evade", color: "163, 190, 140", dist: statDistribution(enemies, (c) => isVariable(c.enemyEvade) ? undefined : c.enemyEvade, mode), varCount: 0 },
    { name: "Damage", color: "191, 97, 106", dist: statDistribution(enemies, (c) => isNegative(c.enemyDamage) ? undefined : (c.enemyDamage ?? 0), mode), varCount: 0 },
    { name: "Horror", color: "94, 129, 172", dist: statDistribution(enemies, (c) => isNegative(c.enemyHorror) ? undefined : (c.enemyHorror ?? 0), mode), varCount: 0 },
    { name: "Victory", color: "235, 203, 139", dist: statDistribution(enemies, (c) => c.victory ?? 0, mode), varCount: 0 },
  ];
  for (const c of enemies) {
    const w = mode === "total" ? c.quantity : 1;
    if (isVarHealth(c)) statDefs[0].varCount += w;
    if (isVariable(c.enemyFight)) statDefs[1].varCount += w;
    if (isVariable(c.enemyEvade)) statDefs[2].varCount += w;
    if (isNegative(c.enemyDamage)) statDefs[3].varCount += w;
    if (isNegative(c.enemyHorror)) statDefs[4].varCount += w;
  }
  const allVals = new Set<number>();
  for (const s of statDefs) for (const k of s.dist.keys()) allVals.add(k);
  const hasVar = statDefs.some((s) => s.varCount > 0);
  const sortedVals = [...allVals].sort((a, b) => a - b);
  const keys = sortedVals.map(String);
  if (hasVar) keys.unshift("?");
  const rows: StatRow[] = statDefs.map((s) => {
    const row: StatRow = { name: s.name, color: s.color };
    for (const val of sortedVals) row[String(val)] = s.dist.get(val) ?? 0;
    if (hasVar) row["?"] = s.varCount;
    return row;
  });
  return { rows, keys };
}

function buildLocationData(cards: Card[], mode: CountMode): { rows: StatRow[]; keys: string[] } {
  const locations = cards.filter((c) => c.typeCode === "location");
  const fixedClues = locations.filter((c) => c.cluesFixed === true || c.clues === 0);
  const perPlayerClues = locations.filter((c) => !c.cluesFixed && (c.clues ?? 0) > 0);

  const shroudDist = statDistribution(locations, (c) => isVariable(c.shroud) ? undefined : c.shroud, mode);
  const fixedClueDist = statDistribution(fixedClues, (c) => c.clues, mode);
  const perPlayerClueDist = statDistribution(perPlayerClues, (c) => c.clues, mode);
  const victoryDist = statDistribution(locations, (c) => c.victory ?? 0, mode);

  let shroudVarCount = 0;
  for (const c of locations) {
    if (isVariable(c.shroud)) shroudVarCount += mode === "total" ? c.quantity : 1;
  }

  const allVals = new Set<number>();
  for (const m of [shroudDist, fixedClueDist, perPlayerClueDist, victoryDist]) for (const k of m.keys()) allVals.add(k);
  const sortedVals = [...allVals].sort((a, b) => a - b);
  const hasVar = shroudVarCount > 0;
  const keys = sortedVals.map(String);
  if (hasVar) keys.unshift("?");

  const dists: { name: string; label?: React.ReactNode; color: string; dist: Map<number, number>; varCount: number }[] = [
    { name: "Shroud", color: "76, 86, 106", dist: shroudDist, varCount: shroudVarCount },
    { name: "Clues", color: "163, 190, 140", dist: fixedClueDist, varCount: 0 },
    { name: "Clues_pp", label: <><i className="icon-per_investigator" />{" "}Clues</>, color: "208, 135, 112", dist: perPlayerClueDist, varCount: 0 },
    { name: "Victory", color: "235, 203, 139", dist: victoryDist, varCount: 0 },
  ];

  const rows: StatRow[] = dists.map((d) => {
    const row: StatRow = { name: d.name, label: d.label, color: d.color };
    for (const val of sortedVals) row[String(val)] = d.dist.get(val) ?? 0;
    if (hasVar) row["?"] = d.varCount;
    return row;
  });
  return { rows, keys };
}

const BG_RGB = [46, 52, 64]; // --bg-0 / Nord polar night

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function textColorForCell(rgb: string, opacity: number): string {
  const [r, g, b] = rgb.split(",").map((s) => parseInt(s.trim()));
  const blended = [0, 1, 2].map((i) => Math.round(BG_RGB[i] * (1 - opacity) + [r, g, b][i] * opacity));
  const lum = relativeLuminance(blended[0], blended[1], blended[2]);
  return lum > 0.18 ? "var(--bg-0)" : "var(--text-primary)";
}

function HeatmapChart({ title, rows, keys, category, onCellClick, activeFilters }: { title: string; rows: StatRow[]; keys: string[]; category?: string; onCellClick?: (category: string, stat: string, value: string) => void; activeFilters?: Record<string, string> }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.75rem" }}>{title}</h3>
      <div style={{ display: "grid", gridTemplateColumns: `auto repeat(${keys.length}, 1fr)`, gap: 2 }}>
        <div />
        {keys.map((k) => (
          <div key={k} style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.2rem 0" }}>{k}</div>
        ))}
        {rows.map((row) => (
          <>
            <div key={row.name} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", paddingRight: "0.5rem", display: "flex", alignItems: "center" }}>
              {row.label ?? row.name}
            </div>
            {keys.map((k) => {
              const val = (row[k] as number) || 0;
              const rowMax = keys.reduce((m, key) => Math.max(m, (row[key] as number) || 0), 0);
              const opacity = rowMax > 0 ? val / rowMax : 0;
              const active = activeFilters?.[row.name] === k;
              const clickable = val > 0 && !active && onCellClick && category;
              return (
                <div
                  key={k}
                  onClick={clickable ? () => onCellClick(category, row.name, k) : undefined}
                  onMouseEnter={clickable ? (e) => { e.currentTarget.style.outline = "2px solid var(--accent)"; } : undefined}
                  onMouseLeave={clickable ? (e) => { e.currentTarget.style.outline = ""; } : undefined}
                  style={{
                    background: `rgba(${row.color}, ${opacity})`,
                    borderRadius: 3,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.15rem",
                    color: val > 0 ? textColorForCell(row.color as string, opacity) : "transparent",
                    minWidth: 28,
                    cursor: clickable ? "pointer" : undefined,
                  }}
                >
                  {val}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function EnemyStatsChart({ cards, mode, onCellClick, activeFilters }: { cards: Card[]; mode: CountMode; onCellClick?: (category: string, stat: string, value: string) => void; activeFilters?: Record<string, string> }) {
  const hasEnemies = useMemo(() => cards.some((c) => c.typeCode === "enemy"), [cards]);
  const { rows, keys } = useMemo(() => buildEnemyData(cards, mode), [cards, mode]);
  if (!hasEnemies) return null;
  return <HeatmapChart title="Enemy Stats" rows={rows} keys={keys} category="enemy" onCellClick={onCellClick} activeFilters={activeFilters} />;
}

function LocationStatsChart({ cards, mode, onCellClick, activeFilters }: { cards: Card[]; mode: CountMode; onCellClick?: (category: string, stat: string, value: string) => void; activeFilters?: Record<string, string> }) {
  const hasLocations = useMemo(() => cards.some((c) => c.typeCode === "location"), [cards]);
  const { rows, keys } = useMemo(() => buildLocationData(cards, mode), [cards, mode]);
  if (!hasLocations) return null;
  return <HeatmapChart title="Location Stats" rows={rows} keys={keys} category="location" onCellClick={onCellClick} activeFilters={activeFilters} />;
}

function remapVictory(filters: Record<string, string> | undefined, key: string): Record<string, string> | undefined {
  if (!filters || !(key in filters)) return filters;
  const { [key]: val, ...rest } = filters;
  return { ...rest, Victory: val };
}

export default function CardStats({ cards, onCellClick, activeFilters, onChartClick }: { cards: Card[]; onCellClick?: (category: string, stat: string, value: string) => void; activeFilters?: Record<string, string>; onChartClick?: (kind: "types" | "traits" | "encounters", name: string) => void }) {
  const [mode, setMode] = useState<CountMode>("total");

  const typeCounts = useMemo(() => countBy(cards, (c) => c.typeName, mode), [cards, mode]);
  const traitCounts = useMemo(() => countTraits(cards, mode), [cards, mode]);
  const encounterCounts = useMemo(() => countBy(cards, (c) => c.encounterName, mode), [cards, mode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={toggleStyle}>
          <button style={toggleButtonStyle(mode === "unique")} onClick={() => setMode("unique")}>Unique</button>
          <button style={toggleButtonStyle(mode === "total")} onClick={() => setMode("total")}>Total</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <PieSection title="Card Types" data={typeCounts} onClick={onChartClick ? (name) => onChartClick("types", name) : undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <BarSection title="Encounter Sets" data={encounterCounts} onClick={onChartClick ? (name) => onChartClick("encounters", name) : undefined} />
        </div>
      </div>
      <EnemyStatsChart cards={cards} mode={mode} onCellClick={onCellClick} activeFilters={remapVictory(activeFilters, "EnemyVictory")} />
      <LocationStatsChart cards={cards} mode={mode} onCellClick={onCellClick} activeFilters={remapVictory(activeFilters, "LocationVictory")} />
      <BarSection title="Traits" data={traitCounts} onClick={onChartClick ? (name) => onChartClick("traits", name) : undefined} />
    </div>
  );
}
