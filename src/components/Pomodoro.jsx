import { useState, useEffect, useRef } from "react";
import { CARD, SECT_TITLE, PB } from "../styles.js";

export function Pomodoro() {
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [secsLeft, setSecsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [studiedToday, setStudiedToday] = useState(0);
  const intervalRef = useRef(null);
  const stateRef = useRef({ secsLeft, running, onBreak });

  useEffect(() => {
    stateRef.current = { secsLeft, running, onBreak };
  }, [secsLeft, running, onBreak]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const s = stateRef.current;
      if (!s.running) return;
      if (s.secsLeft <= 1) {
        if (!s.onBreak) {
          setStudiedToday(v => v + focusMin);
          setCycles(v => v + 1);
          setOnBreak(true);
          setSecsLeft(breakMin * 60);
        } else {
          setOnBreak(false);
          setSecsLeft(focusMin * 60);
          setRunning(false);
        }
      } else {
        setSecsLeft(v => v - 1);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [focusMin, breakMin]);

  const resetTimer = (fm) => {
    setRunning(false);
    setOnBreak(false);
    setSecsLeft(fm * 60);
  };

  const mm = String(Math.floor(secsLeft / 60)).padStart(2, "0");
  const ss = String(secsLeft % 60).padStart(2, "0");
  const totalSecs = (onBreak ? breakMin : focusMin) * 60;
  const pct = totalSecs > 0 ? ((totalSecs - secsLeft) / totalSecs) * 100 : 0;
  const ringSize = 210, stroke = 14;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div>
      <div style={CARD}>
        <div style={SECT_TITLE}>Focus Length</div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".9rem" }}>
          {[25, 30, 45, 60, 90].map(m => (
            <button
              key={m}
              onClick={() => { setFocusMin(m); resetTimer(m); }}
              style={{
                border: "1px solid " + (focusMin === m ? "#f97316" : "#e2e8f0"),
                background: focusMin === m ? "#fff7ed" : "#fff",
                color: focusMin === m ? "#ea580c" : "#64748b",
                borderRadius: 10, padding: ".4rem .8rem", fontSize: ".78rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {m}m
            </button>
          ))}
        </div>
        <div style={SECT_TITLE}>Break Length</div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {[5, 10, 15].map(m => (
            <button
              key={m}
              onClick={() => setBreakMin(m)}
              style={{
                border: "1px solid " + (breakMin === m ? "#10b981" : "#e2e8f0"),
                background: breakMin === m ? "#ecfdf5" : "#fff",
                color: breakMin === m ? "#059669" : "#64748b",
                borderRadius: 10, padding: ".4rem .8rem", fontSize: ".78rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...CARD, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: ".68rem", fontWeight: 800, color: onBreak ? "#10b981" : "#f97316", letterSpacing: ".08em", marginBottom: ".6rem" }}>
          {onBreak ? "BREAK TIME" : "FOCUS SESSION"}
        </div>
        <div style={{ position: "relative", width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
            <circle
              cx={ringSize / 2} cy={ringSize / 2} r={r} fill="none" strokeWidth={stroke}
              stroke={onBreak ? "#10b981" : "url(#focusGrad)"}
              strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset .3s" }}
            />
            <defs>
              <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>{mm}:{ss}</div>
            <div style={{ fontSize: ".65rem", color: "#94a3b8", fontWeight: 700 }}>Cycle {cycles + 1}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".6rem", marginTop: "1rem" }}>
          <button style={{ ...PB, padding: ".7rem 1.6rem" }} onClick={() => setRunning(v => !v)}>
            {running ? "Pause" : "Start"}
          </button>
          <button
            style={{
              background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10,
              padding: ".7rem 1.2rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
            }}
            onClick={() => resetTimer(focusMin)}
          >
            Reset
          </button>
          <button
            style={{
              background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 10,
              padding: ".7rem 1.2rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
            }}
            onClick={() => {
              if (!onBreak) { setStudiedToday(v => v + focusMin); setCycles(v => v + 1); }
              setOnBreak(v => !v);
              setSecsLeft((!onBreak ? breakMin : focusMin) * 60);
              setRunning(false);
            }}
          >
            Skip
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
        <div style={CARD}>
          <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Cycles Today</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{cycles}</div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Studied Today</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>{studiedToday}m</div>
        </div>
      </div>
    </div>
  );
}
