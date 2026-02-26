import { useState } from "react";
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

type Entry = { name: string; value: number };

const COLORS = [
  "#88c0d0",
  "#81a1c1",
  "#5e81ac",
  "#b48ead",
  "#a3be8c",
  "#ebcb8b",
  "#d08770",
  "#bf616a",
  "#8fbcbb",
  "#4c566a",
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

interface TypePieChartProps {
  unique: Entry[];
  total: Entry[];
}

export function TypePieChart({ unique, total }: TypePieChartProps) {
  const [mode, setMode] = useState<"unique" | "total">("total");
  const data = mode === "total" ? total : unique;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Card Types</h2>
        <div style={toggleStyle}>
          <button style={toggleButtonStyle(mode === "unique")} onClick={() => setMode("unique")}>Unique</button>
          <button style={toggleButtonStyle(mode === "total")} onClick={() => setMode("total")}>Total</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {data.map((entry, i) => (
            <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
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
}

export function TraitBarChart({ unique, total }: TraitBarChartProps) {
  const [mode, setMode] = useState<"unique" | "total">("total");
  const data = mode === "total" ? total : unique;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Traits</h2>
        <div style={toggleStyle}>
          <button style={toggleButtonStyle(mode === "unique")} onClick={() => setMode("unique")}>Unique</button>
          <button style={toggleButtonStyle(mode === "total")} onClick={() => setMode("total")}>Total</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={data.length * 28 + 16}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
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
          <Bar dataKey="value" fill="#88c0d0" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
