import { useState, useEffect, useRef } from "react";
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
import { routes } from "@/src/routes";

type Entry = { name: string; value: number };
type CountMode = "unique" | "total";

interface ChartCard {
  code: string;
  name: string;
  typeName: string;
  typeCode: string;
  imageUrl?: string;
  traits?: string;
}

type Filter = { kind: "type"; value: string } | { kind: "trait"; value: string } | null;

const HORIZONTAL_TYPES = new Set(["act", "agenda", "investigator"]);

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

function parseTraits(traits?: string): string[] {
  if (!traits) return [];
  return traits.split(". ").map((s) => s.replace(/\.$/, "").trim()).filter(Boolean);
}

function filterCards(cards: ChartCard[], filter: Filter): ChartCard[] {
  if (!filter) return [];
  if (filter.kind === "type") return cards.filter((c) => c.typeName === filter.value);
  return cards.filter((c) => parseTraits(c.traits).includes(filter.value));
}

function CardGrid({ cards, onClose }: { cards: ChartCard[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div ref={ref} style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{cards.length} cards</div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            font: "inherit",
            fontSize: "0.85rem",
          }}
        >
          Close
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {cards.map((card) => {
          const isHorizontal = HORIZONTAL_TYPES.has(card.typeCode);
          return (
            <a
              key={card.code}
              href={routes.card(card.code)}
              style={{ color: "var(--text-primary)", textDecoration: "none" }}
            >
              {card.imageUrl ? (
                <div style={{ aspectRatio: isHorizontal ? "7/5" : "5/7", userSelect: "none" }}>
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: isHorizontal ? "7/5" : "5/7",
                    background: "var(--bg-2)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  {card.name}
                </div>
              )}
              <div
                style={{
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {card.name}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

interface TypePieChartProps {
  unique: Entry[];
  total: Entry[];
  mode: CountMode;
  onModeChange: (mode: CountMode) => void;
  onSelect: (typeName: string) => void;
  selected: string | null;
}

function TypePieChart({ unique, total, mode, onModeChange, onSelect, selected }: TypePieChartProps) {
  const data = mode === "total" ? total : unique;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Card Types</h2>
        <div style={toggleStyle}>
          <button style={toggleButtonStyle(mode === "unique")} onClick={() => onModeChange("unique")}>Unique</button>
          <button style={toggleButtonStyle(mode === "total")} onClick={() => onModeChange("total")}>Total</button>
        </div>
      </div>
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
              style={{ cursor: "pointer" }}
              onClick={(_, i) => onSelect(data[i].name)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  opacity={selected && selected !== entry.name ? 0.4 : 1}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {data.map((entry, i) => (
            <div
              key={entry.name}
              onClick={() => onSelect(entry.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                cursor: "pointer",
                opacity: selected && selected !== entry.name ? 0.4 : 1,
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

interface TraitBarChartProps {
  unique: Entry[];
  total: Entry[];
  mode: CountMode;
  onSelect: (trait: string) => void;
  selected: string | null;
}

function TraitBarChart({ unique, total, mode, onSelect, selected }: TraitBarChartProps) {
  const data = mode === "total" ? total : unique;

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Traits</h2>
      <ResponsiveContainer width="100%" height={data.length * 28 + 16}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          onClick={(state) => {
            if (state?.activeLabel) onSelect(String(state.activeLabel));
          }}
          style={{ cursor: "pointer" }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill="#88c0d0"
                opacity={selected && selected !== entry.name ? 0.4 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CampaignChartsProps {
  unique: { typeCounts: Entry[]; traitCounts: Entry[] };
  total: { typeCounts: Entry[]; traitCounts: Entry[] };
  cards: ChartCard[];
}

export default function CampaignCharts({ unique, total, cards }: CampaignChartsProps) {
  const [mode, setMode] = useState<CountMode>("total");
  const [filter, setFilter] = useState<Filter>(null);

  function toggleFilter(next: Filter) {
    setFilter((prev) =>
      prev?.kind === next?.kind && prev?.value === next?.value ? null : next,
    );
  }

  const filtered = filterCards(cards, filter);

  return (
    <>
      <TypePieChart
        unique={unique.typeCounts}
        total={total.typeCounts}
        mode={mode}
        onModeChange={setMode}
        onSelect={(v) => toggleFilter({ kind: "type", value: v })}
        selected={filter?.kind === "type" ? filter.value : null}
      />
      {filter?.kind === "type" && (
        <CardGrid cards={filtered} onClose={() => setFilter(null)} />
      )}
      <div style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
        <TraitBarChart
          unique={unique.traitCounts}
          total={total.traitCounts}
          mode={mode}
          onSelect={(v) => toggleFilter({ kind: "trait", value: v })}
          selected={filter?.kind === "trait" ? filter.value : null}
        />
      </div>
      {filter?.kind === "trait" && (
        <CardGrid cards={filtered} onClose={() => setFilter(null)} />
      )}
    </>
  );
}
