import { useState } from "react";
import { Modal } from "./Primitives.jsx";
import { INP, LB, PB } from "../styles.js";

export function MockModal({ onClose, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("NEET Full Test");
  const [phy, setPhy] = useState("");
  const [chem, setChem] = useState("");
  const [bio, setBio] = useState("");
  const [notes, setNotes] = useState("");

  const p = parseFloat(phy) || 0;
  const c = parseFloat(chem) || 0;
  const b = parseFloat(bio) || 0;
  const total = p + c + b;
  const pct = ((total / 720) * 100).toFixed(1);

  const save = () => {
    if (!phy && !chem && !bio) return;
    onSave({
      id: Date.now(),
      date, type,
      phy: phy || "—", chem: chem || "—", bio: bio || "—",
      total: total.toFixed(0), notes
    });
    onClose();
  };

  return (
    <Modal title="Log a Mock Test" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem", marginBottom: ".7rem" }}>
        <div>
          <label style={LB}>Date</label>
          <input type="date" style={INP} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <label style={LB}>Type</label>
          <select style={INP} value={type} onChange={e => setType(e.target.value)}>
            <option>NEET Part Test</option>
            <option>NEET Full Test</option>
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".7rem" }}>
        <div>
          <label style={LB}>Physics /180</label>
          <input style={INP} type="number" value={phy} onChange={e => setPhy(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={LB}>Chemistry /180</label>
          <input style={INP} type="number" value={chem} onChange={e => setChem(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label style={LB}>Biology /360</label>
          <input style={INP} type="number" value={bio} onChange={e => setBio(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
        padding: ".7rem", marginBottom: ".7rem", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ fontSize: ".75rem", color: "#64748b", fontWeight: 700 }}>Total</div>
        <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
          {total.toFixed(0)} / 720 <span style={{ fontSize: ".7rem", color: "#94a3b8" }}>({pct}%)</span>
        </div>
      </div>
      <div style={{ marginBottom: ".9rem" }}>
        <label style={LB}>Notes</label>
        <input style={INP} value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Weak in Genetics" />
      </div>
      <button style={{ ...PB, width: "100%" }} onClick={save}>Save Mock</button>
    </Modal>
  );
}
