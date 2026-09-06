import { useState, useMemo } from "react";
import { CARD, SECT_TITLE, INP, PB } from "../styles.js";
import { Ring } from "./Primitives.jsx";
import { TASK_CATS } from "../data.js";

export function Planner({ tasks, setTasks }) {
  const [text, setText] = useState("");
  const [cat, setCat] = useState(TASK_CATS[0]);
  const today = new Date().toISOString().slice(0, 10);

  const todays = tasks.filter(t => t.date === today);
  const doneCount = todays.filter(t => t.done).length;

  const addTask = () => {
    if (!text.trim()) return;
    setTasks([{ id: Date.now(), text: text.trim(), cat, date: today, done: false }, ...tasks]);
    setText("");
  };

  const toggleDone = id => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = id => setTasks(tasks.filter(t => t.id !== id));

  const pastDays = useMemo(() => {
    const days = {};
    tasks.forEach(t => {
      if (t.date === today) return;
      days[t.date] = days[t.date] || [];
      days[t.date].push(t);
    });
    return Object.entries(days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3);
  }, [tasks, today]);

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 14,
        padding: "1rem", marginBottom: ".9rem", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontSize: ".95rem", fontWeight: 800 }}>{today}</div>
          <div style={{ fontSize: ".72rem", opacity: .9 }}>{doneCount} / {todays.length} tasks done today</div>
        </div>
        <Ring pct={todays.length ? (doneCount / todays.length) * 100 : 0} size={56} stroke={6} color="#fff" label={doneCount + "/" + todays.length} />
      </div>

      <div style={CARD}>
        <label style={{ display: "block", fontSize: ".65rem", fontWeight: 700, color: "#64748b", letterSpacing: ".07em", marginBottom: ".27rem", textTransform: "uppercase" }}>
          Category
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: ".7rem" }}>
          {TASK_CATS.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                border: "1px solid " + (cat === c ? "#f97316" : "#e2e8f0"),
                background: cat === c ? "#fff7ed" : "#fff",
                color: cat === c ? "#ea580c" : "#64748b",
                borderRadius: 20, padding: ".35rem .7rem", fontSize: ".7rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <input
            style={INP} value={text} placeholder="What will you do?"
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); }}
          />
          <button style={PB} onClick={addTask}>Add</button>
        </div>
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Today's Tasks</div>
        {todays.length === 0 && <div style={{ fontSize: ".78rem", color: "#94a3b8" }}>Nothing planned yet — add your first task above.</div>}
        {todays.map(t => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: ".6rem", padding: ".55rem 0",
            borderBottom: "1px solid #f1f5f9"
          }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleDone(t.id)} style={{ width: 17, height: 17, cursor: "pointer" }} />
            <div style={{ fontSize: ".7rem" }}>{t.cat}</div>
            <div style={{
              flex: 1, fontSize: ".8rem", color: t.done ? "#94a3b8" : "#0f172a",
              textDecoration: t.done ? "line-through" : "none"
            }}>
              {t.text}
            </div>
            <button onClick={() => removeTask(t.id)} style={{
              background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: ".9rem", fontFamily: "inherit"
            }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {pastDays.length > 0 && (
        <div style={CARD}>
          <div style={SECT_TITLE}>Previous Days</div>
          {pastDays.map(([date, dtasks]) => (
            <div key={date} style={{ marginBottom: ".6rem" }}>
              <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#64748b", marginBottom: ".3rem" }}>
                {date} — {dtasks.filter(t => t.done).length}/{dtasks.length} done
              </div>
              {dtasks.map(t => (
                <div key={t.id} style={{ fontSize: ".72rem", color: t.done ? "#94a3b8" : "#0f172a", paddingLeft: ".4rem" }}>
                  {t.done ? "✓" : "○"} {t.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
