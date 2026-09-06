import { useState } from "react";
import {
  BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { CARD, SECT_TITLE } from "../styles.js";
import { TOPPERS, COACHING_LEADERBOARD } from "../data.js";

export function ToppersScreen() {
  const [year, setYear] = useState(2025);
  const list = TOPPERS[year] || [];
  const borderColor = i => i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "#b45309";

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg,#312e81,#4338ca)", borderRadius: 14,
        padding: "1rem", marginBottom: ".9rem", color: "#fff"
      }}>
        <div style={{ fontSize: ".9rem", fontWeight: 800 }}>NEET UG Toppers</div>
        <div style={{ fontSize: ".72rem", opacity: .8, marginTop: ".2rem" }}>
          A look at recent All-India Rank 1–3 holders and their coaching background.
        </div>
      </div>

      <div style={{ display: "flex", gap: ".5rem", marginBottom: ".9rem" }}>
        {[2025, 2024, 2023].map(y => (
          <button
            key={y}
            onClick={() => setYear(y)}
            style={{
              border: "1px solid " + (year === y ? "#f97316" : "#e2e8f0"),
              background: year === y ? "#fff7ed" : "#fff",
              color: year === y ? "#ea580c" : "#64748b",
              borderRadius: 10, padding: ".4rem .9rem", fontSize: ".78rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit"
            }}
          >
            {y}
          </button>
        ))}
      </div>

      {list.map((t, i) => (
        <div key={i} style={{ ...CARD, borderLeft: "4px solid " + borderColor(i), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: ".85rem", color: "#0f172a" }}>AIR {t.rank} — {t.name}</div>
            <div style={{ fontSize: ".7rem", color: "#64748b" }}>{t.coaching}</div>
          </div>
          <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#ea580c" }}>{t.marks}/720</div>
        </div>
      ))}

      <div style={CARD}>
        <div style={SECT_TITLE}>Coaching Leaderboard (Top 3 AIRs, 2023–2025)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={COACHING_LEADERBOARD} layout="vertical">
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={100} />
            <Tooltip />
            <RBar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Key Insights</div>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: ".78rem", color: "#475569", lineHeight: 1.7 }}>
          <li>Perfect 720/720 scores have become increasingly common at AIR 1 in recent years.</li>
          <li>NCERT-first accuracy consistently outperforms extra reference material at the very top ranks.</li>
          <li>Full-length mock discipline (attempting 180 questions within time) separates top 100 from top 10,000.</li>
        </ul>
      </div>
    </div>
  );
}
