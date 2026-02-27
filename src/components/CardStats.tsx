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

export default function CardStats({ cards }: { cards: Card[] }) {
  const [mode, setMode] = useState<CountMode>("total");

  const typeCounts = useMemo(() => countBy(cards, (c) => c.typeName, mode), [cards, mode]);
  const factionCounts = useMemo(() => countBy(cards, (c) => c.factionName, mode), [cards, mode]);
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        <PieSection title="Card Types" data={typeCounts} />
        <PieSection title="Factions" data={factionCounts} />
      </div>
      <BarSection title="Traits" data={traitCounts} />
      <BarSection title="Encounter Sets" data={encounterCounts} />
    </div>
  );
}
