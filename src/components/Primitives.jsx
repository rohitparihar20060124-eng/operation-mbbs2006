export function ProgBar({ v = 0, max = 100, color = "#f97316", h = 6 }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (v / max) * 100)) : 0;
  return (
    <div style={{ width: "100%", height: h, background: "#e2e8f0", borderRadius: h, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: h, transition: "width .3s" }} />
    </div>
  );
}

export function Ring({ pct = 0, size = 68, stroke = 7, color = "#f97316", label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .4s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: size < 60 ? ".65rem" : ".8rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>
          {label !== undefined ? label : Math.round(pct) + "%"}
        </div>
        {sub && <div style={{ fontSize: ".5rem", color: "#94a3b8", fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto",
          borderRadius: "18px 18px 0 0", padding: "1.1rem", boxShadow: "0 -8px 30px rgba(0,0,0,.2)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".9rem" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", borderRadius: 8, width: 30, height: 30,
              fontSize: "1rem", cursor: "pointer", color: "#64748b", fontFamily: "inherit"
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
