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

interface Props {
  typeCounts: { name: string; value: number }[];
  traitCounts: { name: string; value: number }[];
}

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

export default function CampaignCharts({ typeCounts, traitCounts }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Card Types
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={typeCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                strokeWidth={0}
              >
                {typeCounts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--text-primary)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {typeCounts.map((entry, i) => (
              <div
                key={entry.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS[i % COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>
                  {entry.name}
                </span>
                <span style={{ color: "var(--text-muted)" }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
          Top Traits
        </h2>
        <ResponsiveContainer width="100%" height={traitCounts.length * 28 + 16}>
          <BarChart
            data={traitCounts}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
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
            <Tooltip
              contentStyle={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text-primary)",
              }}
            />
            <Bar dataKey="value" fill="#88c0d0" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
