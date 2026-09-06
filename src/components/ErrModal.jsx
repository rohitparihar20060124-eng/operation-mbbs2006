import { useState } from "react";
import { Modal } from "./Primitives.jsx";
import { INP, LB, PB } from "../styles.js";
import { SYL, ERROR_TYPES } from "../data.js";

export function ErrModal({ onClose, onSave }) {
  const [subject, setSubject] = useState("Physics");
  const [topicId, setTopicId] = useState("");
  const [errorType, setErrorType] = useState(ERROR_TYPES[0]);
  const [desc, setDesc] = useState("");

  const topics = SYL[subject] || [];

  const save = () => {
    if (!desc.trim()) return;
    onSave({
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      subject, topicId: topicId || (topics[0] ? topics[0].id : ""),
      errorType, desc, resolved: false
    });
    onClose();
  };

  return (
    <Modal title="Log an Error" onClose={onClose}>
      <div style={{ marginBottom: ".7rem" }}>
        <label style={LB}>Subject</label>
        <select style={INP} value={subject} onChange={e => { setSubject(e.target.value); setTopicId(""); }}>
          <option>Physics</option>
          <option>Chemistry</option>
          <option>Biology</option>
        </select>
      </div>
      <div style={{ marginBottom: ".7rem" }}>
        <label style={LB}>Topic</label>
        <select style={INP} value={topicId} onChange={e => setTopicId(e.target.value)}>
          {topics.map(t => <option key={t.id} value={t.id}>{t.n}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: ".7rem" }}>
        <label style={LB}>Error Type</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
          {ERROR_TYPES.map(et => (
            <button
              key={et}
              onClick={() => setErrorType(et)}
              style={{
                border: "1px solid " + (errorType === et ? "#f97316" : "#e2e8f0"),
                background: errorType === et ? "#fff7ed" : "#fff",
                color: errorType === et ? "#ea580c" : "#64748b",
                borderRadius: 20, padding: ".35rem .7rem", fontSize: ".68rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {et}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: ".9rem" }}>
        <label style={LB}>Description</label>
        <input style={INP} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What went wrong?" />
      </div>
      <button style={{ ...PB, width: "100%" }} onClick={save}>Save Error</button>
    </Modal>
  );
}
