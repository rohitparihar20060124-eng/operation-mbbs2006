import { useState } from "react";
import { CARD, SECT_TITLE, INP, LB } from "../styles.js";
import { NEET_RANK_TABLE } from "../data.js";

export function RankSim() {
  const [marks, setMarks] = useState(500);

  const findRow = m => {
    for (const row of NEET_RANK_TABLE) {
      const parts = row.marks.replace(/\u2013/g, "-").split("-");
      if (parts.length === 2) {
        const lo = parseInt(parts[0].replace(/[^0-9]/g, ""), 10);
        const hi = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);
        if (m >= lo && m <= hi) return row;
      }
    }
    return m < 200 ? NEET_RANK_TABLE[NEET_RANK_TABLE.length - 1] : NEET_RANK_TABLE[0];
  };

  const row = findRow(marks);

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg,#312e81,#4338ca)", borderRadius: 14,
        padding: "1rem", marginBottom: ".9rem", color: "#fff"
      }}>
        <div style={{ fontSize: ".8rem", fontWeight: 700, opacity: .9 }}>NEET UG Rank Estimator</div>
        <div style={{ fontSize: ".7rem", opacity: .75, marginTop: ".2rem" }}>
          Max marks: 720 (Physics 180 + Chemistry 180 + Biology 360). Estimates are approximate and based on recent-year trends.
        </div>
      </div>

      <div style={CARD}>
        <label style={LB}>Your Expected Marks: {marks}</label>
        <input
          type="range" min={0} max={720} value={marks}
          onChange={e => setMarks(parseInt(e.target.value, 10))}
          style={{ width: "100%", accentColor: "#f97316" }}
        />
        <input
          type="number" min={0} max={720} value={marks}
          onChange={e => setMarks(Math.max(0, Math.min(720, parseInt(e.target.value || "0", 10))))}
          style={{ ...INP, marginTop: ".6rem" }}
        />
      </div>

      <div style={{ ...CARD, background: "linear-gradient(135deg,#fff7ed,#ffedd5)", border: "1px solid #fed7aa" }}>
        <div style={LB}>Estimated Result</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#9a3412", marginBottom: ".3rem" }}>
          Percentile: {row.pct} &nbsp;•&nbsp; AIR: {row.air}
        </div>
        <div style={{ fontSize: ".78rem", color: "#78350f" }}>{row.info}</div>
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Reference Table</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".68rem" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: ".4rem" }}>Marks</th>
                <th style={{ padding: ".4rem" }}>Percentile</th>
                <th style={{ padding: ".4rem" }}>AIR Range</th>
              </tr>
            </thead>
            <tbody>
              {NEET_RANK_TABLE.map((r2, i) => {
                const isYou = r2 === row;
                return (
                  <tr key={i} style={{ background: isYou ? "#fff7ed" : "transparent", borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: ".4rem", fontFamily: "monospace", fontWeight: isYou ? 800 : 500 }}>
                      {r2.marks} {isYou && <span style={{ color: "#ea580c", fontWeight: 800 }}>← YOU</span>}
                    </td>
                    <td style={{ padding: ".4rem" }}>{r2.pct}</td>
                    <td style={{ padding: ".4rem" }}>{r2.air}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
