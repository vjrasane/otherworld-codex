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

function PieSection({ title, data }: { title: string; data: Entry[] }) {
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
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

function BarSection({ title, data }: { title: string; data: Entry[] }) {
  if (data.length === 0) return null;
  return (
    <div>
      <h3 style={{ fontSize: "1.1rem", margin: "0 0 0.75rem" }}>{title}</h3>
      <ResponsiveContainer width="100%" height={data.length * 28 + 16}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
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

function isPerPlayer(val: number | undefined): boolean {
  return val != null && val < 0;
}

type StatRow = { name: string; color: string; [key: string]: string | number };

function buildEnemyData(cards: Card[], mode: CountMode): { rows: StatRow[]; keys: string[] } {
  const enemies = cards.filter((c) => c.typeCode === "enemy");
  const statDefs: { name: string; color: string; dist: Map<number, number>; xCount: number }[] = [
    { name: "Health", color: "76, 86, 106", dist: statDistribution(enemies, (c) => isPerPlayer(c.health) ? undefined : c.health, mode), xCount: 0 },
    { name: "Fight", color: "208, 135, 112", dist: statDistribution(enemies, (c) => isPerPlayer(c.enemyFight) ? undefined : c.enemyFight, mode), xCount: 0 },
    { name: "Evade", color: "163, 190, 140", dist: statDistribution(enemies, (c) => isPerPlayer(c.enemyEvade) ? undefined : c.enemyEvade, mode), xCount: 0 },
    { name: "Damage", color: "191, 97, 106", dist: statDistribution(enemies, (c) => isPerPlayer(c.enemyDamage) ? undefined : c.enemyDamage, mode), xCount: 0 },
    { name: "Horror", color: "94, 129, 172", dist: statDistribution(enemies, (c) => isPerPlayer(c.enemyHorror) ? undefined : c.enemyHorror, mode), xCount: 0 },
  ];
  for (const c of enemies) {
    const w = mode === "total" ? c.quantity : 1;
    if (isPerPlayer(c.health)) statDefs[0].xCount += w;
    if (isPerPlayer(c.enemyFight)) statDefs[1].xCount += w;
    if (isPerPlayer(c.enemyEvade)) statDefs[2].xCount += w;
    if (isPerPlayer(c.enemyDamage)) statDefs[3].xCount += w;
    if (isPerPlayer(c.enemyHorror)) statDefs[4].xCount += w;
  }
  const allVals = new Set<number>();
  for (const s of statDefs) for (const k of s.dist.keys()) allVals.add(k);
  const hasX = statDefs.some((s) => s.xCount > 0);
  const sortedVals = [...allVals].sort((a, b) => a - b);
  const keys = sortedVals.map(String);
  if (hasX) keys.push("X");
  const rows: StatRow[] = statDefs.map((s) => {
    const row: StatRow = { name: s.name, color: s.color };
    for (const val of sortedVals) row[String(val)] = s.dist.get(val) ?? 0;
    if (hasX) row["X"] = s.xCount;
    return row;
  });
  return { rows, keys };
}

function buildLocationData(cards: Card[], mode: CountMode): { rows: StatRow[]; keys: string[] } {
  const locations = cards.filter((c) => c.typeCode === "location");
  const dists: { name: string; color: string; dist: Map<number, number> }[] = [
    { name: "Shroud", color: "76, 86, 106", dist: statDistribution(locations, (c) => c.shroud, mode) },
    { name: "Clues", color: "235, 203, 139", dist: statDistribution(locations.filter((c) => c.cluesFixed !== false), (c) => c.clues, mode) },
    { name: "Clues \u24C5", color: "208, 135, 112", dist: statDistribution(locations.filter((c) => c.cluesFixed === false), (c) => c.clues, mode) },
  ];
  const allVals = new Set<number>();
  for (const d of dists) for (const k of d.dist.keys()) allVals.add(k);
  const sortedVals = [...allVals].sort((a, b) => a - b);
  const keys = sortedVals.map(String);
  const rows: StatRow[] = dists.map((d) => {
    const row: StatRow = { name: d.name, color: d.color };
    for (const val of sortedVals) row[String(val)] = d.dist.get(val) ?? 0;
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

function HeatmapChart({ title, rows, keys }: { title: string; rows: StatRow[]; keys: string[] }) {
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
              {row.name}
            </div>
            {keys.map((k) => {
              const val = (row[k] as number) || 0;
              const rowMax = keys.reduce((m, key) => Math.max(m, (row[key] as number) || 0), 0);
              const opacity = rowMax > 0 ? val / rowMax : 0;
              return (
                <div
                  key={k}
                  style={{
                    background: `rgba(${row.color}, ${opacity})`,
                    borderRadius: 3,
                    textAlign: "center",
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.15rem",
                    color: val > 0 ? textColorForCell(row.color as string, opacity) : "transparent",
                    minWidth: 28,
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

function EnemyStatsChart({ cards, mode }: { cards: Card[]; mode: CountMode }) {
  const { rows, keys } = useMemo(() => buildEnemyData(cards, mode), [cards, mode]);
  return <HeatmapChart title="Enemy Stats" rows={rows} keys={keys} />;
}

function LocationStatsChart({ cards, mode }: { cards: Card[]; mode: CountMode }) {
  const { rows, keys } = useMemo(() => buildLocationData(cards, mode), [cards, mode]);
  return <HeatmapChart title="Location Stats" rows={rows} keys={keys} />;
}

export default function CardStats({ cards }: { cards: Card[] }) {
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
      <PieSection title="Card Types" data={typeCounts} />
      <EnemyStatsChart cards={cards} mode={mode} />
      <LocationStatsChart cards={cards} mode={mode} />
      <BarSection title="Traits" data={traitCounts} />
      <BarSection title="Encounter Sets" data={encounterCounts} />
    </div>
  );
}
