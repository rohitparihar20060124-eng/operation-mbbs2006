import { useState, useEffect, useMemo, useCallback } from "react";
import { CARD, SECT_TITLE, PB, INP } from "./styles.js";
import { ProgBar, Ring } from "./components/Primitives.jsx";
import {
  getNotifyEmail, setNotifyEmail, getNotifiedChapters,
  markChapterNotified, sendChapterCompleteEmail
} from "./lib/notify.js";
import { MockModal } from "./components/MockModal.jsx";
import { ErrModal } from "./components/ErrModal.jsx";
import { Pomodoro } from "./components/Pomodoro.jsx";
import { RankSim } from "./components/RankSim.jsx";
import { Planner } from "./components/Planner.jsx";
import { Analytics } from "./components/Analytics.jsx";
import { ToppersScreen } from "./components/ToppersScreen.jsx";
import { storage } from "./lib/storage.js";
import {
  EXAM_DATES, daysLeft, SYL, LDATA,
  STATUS_LIST, STATUS_META, MOTIVES, SUBJECT_COLORS, ERROR_TYPES
} from "./data.js";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("home");

  const [TS, setTS] = useState({});
  const [LS, setLS] = useState({});
  const [mocks, setMocks] = useState([]);
  const [errs, setErrs] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [errModalOpen, setErrModalOpen] = useState(false);

  const [syllSubject, setSyllSubject] = useState("Physics");
  const [syllFilter, setSyllFilter] = useState("all");

  const [lectSubject, setLectSubject] = useState("Physics");
  const [expandedChapter, setExpandedChapter] = useState(null);

  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  const motive = useMemo(() => MOTIVES[Math.floor(Math.random() * MOTIVES.length)], []);

  /* ---- Load from storage (localStorage, wrapped so it can be awaited) ---- */
  useEffect(() => {
    (async () => {
      const keys = [
        ["apx2ts", setTS], ["apx2ls", setLS],
        ["apx2mk", setMocks], ["apx2er", setErrs], ["apx2tk", setTasks]
      ];
      for (const [k, fn] of keys) {
        try {
          const r = await storage.get(k);
          if (r) fn(JSON.parse(r.value));
        } catch (_) {}
      }
      setLoaded(true);
    })();
    setEmailInput(getNotifyEmail());
  }, []);

  /* ---- Check every chapter's lecture progress; email a congrats +
     practice PDF for any chapter that has reached 100% and hasn't
     been notified yet. Callable from the auto-effect below, from the
     Save button (in case a chapter was already complete before the
     email was set), and from a manual "Check now" button. ---- */
  const [emailCheckStatus, setEmailCheckStatus] = useState("");

  const checkCompletionsAndNotify = useCallback((showStatus) => {
    const email = getNotifyEmail();
    if (!email) {
      if (showStatus) setEmailCheckStatus("Save an email address first.");
      return;
    }
    const notified = getNotifiedChapters();
    let sentCount = 0;
    Object.entries(LDATA).forEach(([subj, d]) => {
      d.chapters.forEach(ch => {
        const done = LS[ch.id] || 0;
        if (ch.t > 0 && done >= ch.t && !notified.includes(ch.id)) {
          markChapterNotified(ch.id);
          sentCount++;
          sendChapterCompleteEmail({ email, subject: subj, chapterId: ch.id, chapterName: ch.n })
            .catch(err => console.error("Chapter-complete email failed:", err));
        }
      });
    });
    if (showStatus) {
      setEmailCheckStatus(
        sentCount > 0
          ? `Sent ${sentCount} email${sentCount > 1 ? "s" : ""} for completed chapter${sentCount > 1 ? "s" : ""}!`
          : "No new completed chapters to notify — all caught up."
      );
      setTimeout(() => setEmailCheckStatus(""), 4000);
    }
  }, [LS]);

  /* ---- Auto-run whenever lecture progress changes ---- */
  useEffect(() => {
    if (!loaded) return;
    checkCompletionsAndNotify(false);
  }, [LS, loaded, checkCompletionsAndNotify]);

  /* ---- Save to storage ---- */
  useEffect(() => { if (loaded) storage.set("apx2ts", JSON.stringify(TS)); }, [TS, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2ls", JSON.stringify(LS)); }, [LS, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2mk", JSON.stringify(mocks)); }, [mocks, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2er", JSON.stringify(errs)); }, [errs, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2tk", JSON.stringify(tasks)); }, [tasks, loaded]);

  /* ---- Named handlers (never inline in JSX) ---- */
  const bumpStatus = id => {
    setTS(prev => {
      const cur = prev[id] || { status: "not-started", mastery: 0 };
      const idx = STATUS_LIST.indexOf(cur.status);
      const next = STATUS_LIST[(idx + 1) % STATUS_LIST.length];
      return { ...prev, [id]: { ...cur, status: next } };
    });
  };

  const setMastery = (id, val) => {
    setTS(prev => {
      const cur = prev[id] || { status: "not-started", mastery: 0 };
      return { ...prev, [id]: { ...cur, mastery: val } };
    });
  };

  const bumpLecture = (chId, total, delta) => {
    setLS(prev => {
      const cur = prev[chId] || 0;
      const next = Math.max(0, Math.min(total, cur + delta));
      return { ...prev, [chId]: next };
    });
  };

  const setLectureCount = (chId, total, val) => {
    setLS(prev => ({ ...prev, [chId]: Math.max(0, Math.min(total, val)) }));
  };

  const resolveError = id => setErrs(prev => prev.map(e => e.id === id ? { ...e, resolved: !e.resolved } : e));
  const deleteError = id => setErrs(prev => prev.filter(e => e.id !== id));
  const deleteMock = id => setMocks(prev => prev.filter(m => m.id !== id));

  /* ---- Derived values ---- */
  const allTopics = useMemo(() => [...SYL.Physics, ...SYL.Chemistry, ...SYL.Biology], []);
  const masteredCount = allTopics.filter(t => TS[t.id]?.status === "mastered").length;

  const allChapters = useMemo(() => {
    const out = [];
    Object.entries(LDATA).forEach(([subj, d]) => {
      d.chapters.forEach(ch => out.push(ch));
    });
    return out;
  }, []);
  const lectureTotalAll = allChapters.reduce((a, c) => a + c.t, 0);
  const lectureDoneAll = allChapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
  const lecturePct = lectureTotalAll > 0 ? Math.round((lectureDoneAll / lectureTotalAll) * 100) : 0;

  const avgMastery = allTopics.length
    ? Math.round(allTopics.reduce((a, t) => a + (TS[t.id]?.mastery || 0), 0) / allTopics.length)
    : 0;

  const backlogCount = allTopics.filter(t => TS[t.id]?.status === "backlog").length;

  const today = new Date().toISOString().slice(0, 10);
  const todaysTaskCount = tasks.filter(t => t.date === today).length;

  const highPriority = useMemo(() => {
    return allTopics
      .map(t => {
        const st = TS[t.id] || { status: "not-started", mastery: 0 };
        const backlogBonus = st.status === "backlog" ? 20 : 0;
        const weakness = 100 - st.mastery;
        const risk = t.wt * weakness + backlogBonus;
        return { ...t, risk, status: st.status };
      })
      .filter(t => t.status !== "mastered")
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 6);
  }, [TS, allTopics]);

  /* ---- Tabs ---- */
  const TABS = [
    { id: "home", e: "🏠", l: "Home" },
    { id: "lect", e: "📚", l: "Lectures" },
    { id: "syll", e: "✅", l: "Syllabus" },
    { id: "plan", e: "🗓️", l: "Planner" },
    { id: "mock", e: "📝", l: "Mocks" },
    { id: "err", e: "⚠️", l: "Errors" },
    { id: "rank", e: "🎯", l: "Rank Sim" },
    { id: "analy", e: "📊", l: "Analytics" },
    { id: "top", e: "🏆", l: "Toppers" },
    { id: "pom", e: "⏱️", l: "Focus" }
  ];

  const subjectOfTopic = t => {
    if (t.id.startsWith("p")) return "Physics";
    if (t.id.startsWith("c")) return "Chemistry";
    return "Biology";
  };

  /* ================= RENDER ================= */

  return (
    <div style={{
      fontFamily: "system-ui,-apple-system,sans-serif", background: "#f1f5f9",
      minHeight: "100vh", color: "#0f172a"
    }}>
      <div style={{
        background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff",
        padding: "1rem 1rem .9rem"
      }}>
        <div style={{ fontSize: "1.15rem", fontWeight: 800 }}>OPERATION MBBS</div>
        <div style={{ fontSize: ".7rem", opacity: .85, fontWeight: 600, letterSpacing: ".04em" }}>
          NEET UG 2027 PREP OS
        </div>
      </div>

      <div style={{ padding: "1rem", paddingBottom: 90, maxWidth: 640, margin: "0 auto" }}>

        {tab === "home" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 14,
              padding: "1rem", marginBottom: ".9rem", color: "#e0e7ff"
            }}>
              <div style={{ fontSize: ".8rem", lineHeight: 1.6 }}>{motive}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              {EXAM_DATES.map(ed => {
                const d = daysLeft(ed.date);
                return (
                  <div key={ed.id} style={{ ...CARD, textAlign: "center", padding: ".7rem .4rem", marginBottom: 0 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ea580c", fontFamily: "monospace" }}>
                      {d >= 0 ? d : 0}
                    </div>
                    <div style={{ fontSize: ".58rem", color: "#64748b", fontWeight: 700, marginTop: ".2rem" }}>
                      {ed.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              {[
                { label: "Mastered", val: masteredCount + "/" + allTopics.length },
                { label: "Lectures", val: lecturePct + "%" },
                { label: "Avg Mastery", val: avgMastery + "%" },
                { label: "Backlog", val: backlogCount },
                { label: "Today's Tasks", val: todaysTaskCount },
                { label: "Mocks Logged", val: mocks.length }
              ].map((k, i) => (
                <div key={i} style={{ ...CARD, marginBottom: 0, padding: ".7rem" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{k.label}</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "monospace" }}>{k.val}</div>
                </div>
              ))}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>Email Notifications</div>
              <div style={{ fontSize: ".72rem", color: "#64748b", marginBottom: ".6rem" }}>
                Get a congratulations email with a chapter practice-test PDF every time you finish all lectures in a chapter.
              </div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input
                  style={INP} type="email" placeholder="you@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                />
                <button
                  style={PB}
                  onClick={() => {
                    setNotifyEmail(emailInput.trim());
                    setEmailStatus("Saved!");
                    setTimeout(() => setEmailStatus(""), 2000);
                    // In case a chapter was already 100% before the email was set,
                    // check right away instead of waiting for lecture progress to change.
                    checkCompletionsAndNotify(true);
                  }}
                >
                  Save
                </button>
              </div>
              {emailStatus && (
                <div style={{ fontSize: ".68rem", color: "#10b981", marginTop: ".5rem", fontWeight: 700 }}>
                  {emailStatus}
                </div>
              )}
              <button
                onClick={() => checkCompletionsAndNotify(true)}
                style={{
                  marginTop: ".7rem", background: "#f1f5f9", color: "#475569", border: "none",
                  borderRadius: 8, padding: ".5rem .9rem", fontSize: ".72rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Check now for completed chapters
              </button>
              {emailCheckStatus && (
                <div style={{ fontSize: ".68rem", color: "#3b82f6", marginTop: ".5rem", fontWeight: 700 }}>
                  {emailCheckStatus}
                </div>
              )}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>Subject Progress</div>
              {["Physics", "Chemistry", "Biology"].map(subj => {
                const list = SYL[subj];
                const m = list.filter(t => TS[t.id]?.status === "mastered").length;
                return (
                  <div key={subj} style={{ marginBottom: ".7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", marginBottom: ".25rem" }}>
                      <span style={{ fontWeight: 700 }}>{subj}</span>
                      <span style={{ color: "#64748b" }}>{m}/{list.length}</span>
                    </div>
                    <ProgBar v={m} max={list.length} color={SUBJECT_COLORS[subj]} />
                  </div>
                );
              })}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>High-Priority Topics</div>
              {highPriority.map(t => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: ".5rem 0", borderBottom: "1px solid #f1f5f9"
                }}>
                  <div>
                    <div style={{ fontSize: ".78rem", fontWeight: 700 }}>{t.n}</div>
                    <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>{subjectOfTopic(t)} · wt {t.wt}/10</div>
                  </div>
                  <span style={{
                    fontSize: ".62rem", fontWeight: 800, color: STATUS_META[t.status]?.color,
                    background: (STATUS_META[t.status]?.color || "#94a3b8") + "20",
                    padding: ".2rem .5rem", borderRadius: 20
                  }}>
                    {STATUS_META[t.status]?.label}
                  </span>
                </div>
              ))}
            </div>

            {mocks.length > 0 && (
              <div style={CARD}>
                <div style={SECT_TITLE}>Recent Mocks</div>
                <div style={{ display: "flex", gap: ".6rem", overflowX: "auto", paddingBottom: ".3rem" }}>
                  {mocks.slice(0, 5).map(m => {
                    const pct = (parseFloat(m.total) / 720) * 100;
                    const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={m.id} style={{
                        minWidth: 100, border: "1px solid #e2e8f0", borderRadius: 10, padding: ".6rem", flexShrink: 0
                      }}>
                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>{m.date}</div>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color }}>{m.total}</div>
                        <div style={{ fontSize: ".58rem", color: "#94a3b8" }}>/720</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "lect" && (
          <div>
            <div style={{ display: "flex", gap: ".4rem", overflowX: "auto", marginBottom: ".9rem" }}>
              {Object.keys(LDATA).map(subj => (
                <button
                  key={subj}
                  onClick={() => setLectSubject(subj)}
                  style={{
                    flexShrink: 0,
                    border: "1px solid " + (lectSubject === subj ? LDATA[subj].col : "#e2e8f0"),
                    background: lectSubject === subj ? LDATA[subj].col + "18" : "#fff",
                    color: lectSubject === subj ? LDATA[subj].col : "#64748b",
                    borderRadius: 20, padding: ".4rem .8rem", fontSize: ".72rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            {(() => {
              const d = LDATA[lectSubject];
              const total = d.chapters.reduce((a, c) => a + c.t, 0);
              const done = d.chapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div style={{ ...CARD, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{lectSubject}</div>
                    <div style={{ fontSize: ".68rem", color: "#64748b" }}>Faculty: {d.fac}</div>
                    <div style={{ fontSize: ".68rem", color: "#94a3b8" }}>{done} / {total} lectures</div>
                  </div>
                  <Ring pct={pct} color={d.col} />
                </div>
              );
            })()}

            {LDATA[lectSubject].chapters.map(ch => {
              const done = LS[ch.id] || 0;
              const isOpen = expandedChapter === ch.id;
              return (
                <div key={ch.id} style={CARD}>
                  <div
                    onClick={() => setExpandedChapter(isOpen ? null : ch.id)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{ch.n}</div>
                      <div style={{ marginTop: ".35rem" }}>
                        <ProgBar v={done} max={ch.t} color={LDATA[lectSubject].col} />
                      </div>
                    </div>
                    <div style={{ marginLeft: ".7rem", fontFamily: "monospace", fontSize: ".72rem", color: "#64748b" }}>
                      {done}/{ch.t}
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: ".8rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                      <button
                        onClick={() => bumpLecture(ch.id, ch.t, -1)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        −
                      </button>
                      <input
                        type="range" min={0} max={ch.t} value={done}
                        onChange={e => setLectureCount(ch.id, ch.t, parseInt(e.target.value, 10))}
                        style={{ flex: 1, accentColor: LDATA[lectSubject].col }}
                      />
                      <button
                        onClick={() => bumpLecture(ch.id, ch.t, 1)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={CARD}>
              <div style={SECT_TITLE}>Standing</div>
              {(() => {
                const d = LDATA[lectSubject];
                const total = d.chapters.reduce((a, c) => a + c.t, 0);
                const done = d.chapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
                const pct = total > 0 ? (done / total) * 100 : 0;
                return (
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Ring pct={pct} size={64} color={d.col} sub="You" />
                    <Ring pct={45} size={64} color="#94a3b8" sub="Avg Batch" />
                    <Ring pct={90} size={64} color="#10b981" sub="Topper" />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {tab === "syll" && (
          <div>
            <div style={{ display: "flex", gap: ".4rem", marginBottom: ".7rem" }}>
              {["Physics", "Chemistry", "Biology"].map(subj => (
                <button
                  key={subj}
                  onClick={() => setSyllSubject(subj)}
                  style={{
                    border: "1px solid " + (syllSubject === subj ? SUBJECT_COLORS[subj] : "#e2e8f0"),
                    background: syllSubject === subj ? SUBJECT_COLORS[subj] + "18" : "#fff",
                    color: syllSubject === subj ? SUBJECT_COLORS[subj] : "#64748b",
                    borderRadius: 10, padding: ".45rem .9rem", fontSize: ".78rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", flex: 1
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: ".4rem", overflowX: "auto", marginBottom: ".9rem" }}>
              {["all", ...STATUS_LIST].map(f => (
                <button
                  key={f}
                  onClick={() => setSyllFilter(f)}
                  style={{
                    flexShrink: 0,
                    border: "1px solid " + (syllFilter === f ? "#f97316" : "#e2e8f0"),
                    background: syllFilter === f ? "#fff7ed" : "#fff",
                    color: syllFilter === f ? "#ea580c" : "#64748b",
                    borderRadius: 20, padding: ".35rem .7rem", fontSize: ".68rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                  }}
                >
                  {f === "all" ? "All" : STATUS_META[f].label}
                </button>
              ))}
            </div>

            {SYL[syllSubject]
              .filter(t => syllFilter === "all" || (TS[t.id]?.status || "not-started") === syllFilter)
              .map(t => {
                const st = TS[t.id] || { status: "not-started", mastery: 0 };
                const meta = STATUS_META[st.status];
                return (
                  <div key={t.id} style={CARD}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{t.n}</div>
                        <span style={{
                          fontSize: ".58rem", fontWeight: 800,
                          color: t.w === "H" ? "#ef4444" : t.w === "M" ? "#f59e0b" : "#64748b",
                          background: (t.w === "H" ? "#ef4444" : t.w === "M" ? "#f59e0b" : "#94a3b8") + "18",
                          padding: ".1rem .4rem", borderRadius: 6
                        }}>
                          {t.w === "H" ? "HIGH" : t.w === "M" ? "MED" : "LOW"} · {t.wt}/10
                        </span>
                      </div>
                      <button
                        onClick={() => bumpStatus(t.id)}
                        style={{
                          border: "none", borderRadius: 20, padding: ".3rem .65rem", fontSize: ".62rem",
                          fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                          color: meta.color, background: meta.color + "18"
                        }}
                      >
                        {meta.label}
                      </button>
                    </div>
                    <div style={{ marginTop: ".6rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <span style={{ fontSize: ".6rem", color: "#94a3b8", width: 62 }}>Mastery</span>
                      <input
                        type="range" min={0} max={100} value={st.mastery}
                        onChange={e => setMastery(t.id, parseInt(e.target.value, 10))}
                        style={{ flex: 1, accentColor: SUBJECT_COLORS[syllSubject] }}
                      />
                      <span style={{ fontSize: ".65rem", fontFamily: "monospace", width: 30, textAlign: "right" }}>{st.mastery}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {tab === "plan" && <Planner tasks={tasks} setTasks={setTasks} />}

        {tab === "mock" && (
          <div>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
              padding: ".7rem", marginBottom: ".9rem", fontSize: ".72rem", color: "#1e40af"
            }}>
              NEET Part Test — sectional. NEET Full Test — max 720 (Phy 180 + Chem 180 + Bio 360).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Mocks</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>{mocks.length}</div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Average Score</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.length ? Math.round(mocks.reduce((a, m) => a + (parseFloat(m.total) || 0), 0) / mocks.length) : 0}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Part Tests</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.filter(m => m.type === "NEET Part Test").length}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Full Tests</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.filter(m => m.type === "NEET Full Test").length}
                </div>
              </div>
            </div>

            <button style={{ ...PB, width: "100%", marginBottom: ".9rem" }} onClick={() => setMockModalOpen(true)}>
              + Log Mock
            </button>

            {mocks.map(m => {
              const pct = (parseFloat(m.total) / 720) * 100;
              const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <div key={m.id} style={CARD}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{m.type}</div>
                      <div style={{ fontSize: ".65rem", color: "#94a3b8" }}>{m.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 800, color }}>{m.total}/720</div>
                      <button onClick={() => deleteMock(m.id)} style={{
                        background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: ".8rem", fontFamily: "inherit"
                      }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: ".5rem", fontSize: ".68rem", color: "#64748b" }}>
                    <span>Phy: {m.phy}</span>
                    <span>Chem: {m.chem}</span>
                    <span>Bio: {m.bio}</span>
                  </div>
                  {m.notes && <div style={{ marginTop: ".4rem", fontSize: ".7rem", color: "#94a3b8", fontStyle: "italic" }}>{m.notes}</div>}
                </div>
              );
            })}

            {mockModalOpen && <MockModal onClose={() => setMockModalOpen(false)} onSave={m => setMocks([m, ...mocks])} />}
          </div>
        )}

        {tab === "err" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>{errs.length}</div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Open</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "#ef4444" }}>
                  {errs.filter(e => !e.resolved).length}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Done</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "#10b981" }}>
                  {errs.filter(e => e.resolved).length}
                </div>
              </div>
            </div>

            <button style={{ ...PB, width: "100%", marginBottom: ".9rem" }} onClick={() => setErrModalOpen(true)}>
              + Log Error
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: ".9rem" }}>
              {ERROR_TYPES.map(et => (
                <span key={et} style={{
                  fontSize: ".62rem", fontWeight: 700, color: "#64748b", background: "#e2e8f0",
                  padding: ".25rem .55rem", borderRadius: 20
                }}>
                  {et}: {errs.filter(e => e.errorType === et).length}
                </span>
              ))}
            </div>

            {errs.map(e => (
              <div key={e.id} style={{ ...CARD, opacity: e.resolved ? .6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".68rem", color: "#94a3b8" }}>{e.date} · {e.subject}</div>
                    <div style={{ fontSize: ".8rem", fontWeight: 700, margin: ".2rem 0" }}>{e.desc}</div>
                    <span style={{
                      fontSize: ".6rem", fontWeight: 700, color: "#ea580c", background: "#fff7ed",
                      padding: ".15rem .45rem", borderRadius: 20
                    }}>
                      {e.errorType}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <button onClick={() => resolveError(e.id)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "1rem", fontFamily: "inherit"
                    }}>
                      {e.resolved ? "✅" : "⬜"}
                    </button>
                    <button onClick={() => deleteError(e.id)} style={{
                      background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: ".9rem", fontFamily: "inherit"
                    }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {errModalOpen && <ErrModal onClose={() => setErrModalOpen(false)} onSave={e => setErrs([e, ...errs])} />}
          </div>
        )}

        {tab === "rank" && <RankSim />}
        {tab === "analy" && <Analytics TS={TS} mocks={mocks} errs={errs} />}
        {tab === "top" && <ToppersScreen />}
        {tab === "pom" && <Pomodoro />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
        borderTop: "1px solid #e2e8f0", display: "flex", overflowX: "auto",
        zIndex: 500
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: "0 0 auto", minWidth: 64, background: "none", border: "none",
                borderBottom: active ? "3px solid #ea580c" : "3px solid transparent",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: ".5rem .3rem", cursor: "pointer", fontFamily: "inherit",
                opacity: active ? 1 : .65, filter: active ? "none" : "grayscale(40%)"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>{t.e}</div>
              <div style={{ fontSize: ".55rem", fontWeight: 700, color: active ? "#ea580c" : "#64748b", marginTop: ".15rem" }}>
                {t.l}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}import { useState, useEffect, useMemo, useCallback } from "react";
import { CARD, SECT_TITLE, PB, INP } from "./styles.js";
import { ProgBar, Ring } from "./components/Primitives.jsx";
import {
  getNotifyEmail, setNotifyEmail, getNotifiedChapters,
  markChapterNotified, sendChapterCompleteEmail
} from "./lib/notify.js";
import { MockModal } from "./components/MockModal.jsx";
import { ErrModal } from "./components/ErrModal.jsx";
import { Pomodoro } from "./components/Pomodoro.jsx";
import { RankSim } from "./components/RankSim.jsx";
import { Planner } from "./components/Planner.jsx";
import { Analytics } from "./components/Analytics.jsx";
import { ToppersScreen } from "./components/ToppersScreen.jsx";
import { storage } from "./lib/storage.js";
import {
  EXAM_DATES, daysLeft, SYL, LDATA,
  STATUS_LIST, STATUS_META, MOTIVES, SUBJECT_COLORS, ERROR_TYPES
} from "./data.js";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("home");

  const [TS, setTS] = useState({});
  const [LS, setLS] = useState({});
  const [mocks, setMocks] = useState([]);
  const [errs, setErrs] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [errModalOpen, setErrModalOpen] = useState(false);

  const [syllSubject, setSyllSubject] = useState("Physics");
  const [syllFilter, setSyllFilter] = useState("all");

  const [lectSubject, setLectSubject] = useState("Physics");
  const [expandedChapter, setExpandedChapter] = useState(null);

  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [notifyEmailSet, setNotifyEmailSet] = useState(null); // null = not checked yet
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState("");

  const motive = useMemo(() => MOTIVES[Math.floor(Math.random() * MOTIVES.length)], []);

  /* ---- Load from storage (localStorage, wrapped so it can be awaited) ---- */
  useEffect(() => {
    (async () => {
      const keys = [
        ["apx2ts", setTS], ["apx2ls", setLS],
        ["apx2mk", setMocks], ["apx2er", setErrs], ["apx2tk", setTasks]
      ];
      for (const [k, fn] of keys) {
        try {
          const r = await storage.get(k);
          if (r) fn(JSON.parse(r.value));
        } catch (_) {}
      }
      setLoaded(true);
    })();
    const savedEmail = getNotifyEmail();
    setEmailInput(savedEmail);
    setNotifyEmailSet(savedEmail || "");
  }, []);

  /* ---- Check every chapter's lecture progress; email a congrats +
     practice PDF for any chapter that has reached 100% and hasn't
     been notified yet. Callable from the auto-effect below, from the
     Save button (in case a chapter was already complete before the
     email was set), and from a manual "Check now" button. ---- */
  const [emailCheckStatus, setEmailCheckStatus] = useState("");

  const checkCompletionsAndNotify = useCallback((showStatus) => {
    const email = getNotifyEmail();
    if (!email) {
      if (showStatus) setEmailCheckStatus("Save an email address first.");
      return;
    }
    const notified = getNotifiedChapters();
    let sentCount = 0;
    Object.entries(LDATA).forEach(([subj, d]) => {
      d.chapters.forEach(ch => {
        const done = LS[ch.id] || 0;
        if (ch.t > 0 && done >= ch.t && !notified.includes(ch.id)) {
          markChapterNotified(ch.id);
          sentCount++;
          sendChapterCompleteEmail({ email, subject: subj, chapterId: ch.id, chapterName: ch.n })
            .catch(err => console.error("Chapter-complete email failed:", err));
        }
      });
    });
    if (showStatus) {
      setEmailCheckStatus(
        sentCount > 0
          ? `Sent ${sentCount} email${sentCount > 1 ? "s" : ""} for completed chapter${sentCount > 1 ? "s" : ""}!`
          : "No new completed chapters to notify — all caught up."
      );
      setTimeout(() => setEmailCheckStatus(""), 4000);
    }
  }, [LS]);

  /* ---- Auto-run whenever lecture progress changes ---- */
  useEffect(() => {
    if (!loaded) return;
    checkCompletionsAndNotify(false);
  }, [LS, loaded, checkCompletionsAndNotify]);

  /* ---- Save to storage ---- */
  useEffect(() => { if (loaded) storage.set("apx2ts", JSON.stringify(TS)); }, [TS, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2ls", JSON.stringify(LS)); }, [LS, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2mk", JSON.stringify(mocks)); }, [mocks, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2er", JSON.stringify(errs)); }, [errs, loaded]);
  useEffect(() => { if (loaded) storage.set("apx2tk", JSON.stringify(tasks)); }, [tasks, loaded]);

  /* ---- Named handlers (never inline in JSX) ---- */
  const bumpStatus = id => {
    setTS(prev => {
      const cur = prev[id] || { status: "not-started", mastery: 0 };
      const idx = STATUS_LIST.indexOf(cur.status);
      const next = STATUS_LIST[(idx + 1) % STATUS_LIST.length];
      return { ...prev, [id]: { ...cur, status: next } };
    });
  };

  const setMastery = (id, val) => {
    setTS(prev => {
      const cur = prev[id] || { status: "not-started", mastery: 0 };
      return { ...prev, [id]: { ...cur, mastery: val } };
    });
  };

  const bumpLecture = (chId, total, delta) => {
    setLS(prev => {
      const cur = prev[chId] || 0;
      const next = Math.max(0, Math.min(total, cur + delta));
      return { ...prev, [chId]: next };
    });
  };

  const setLectureCount = (chId, total, val) => {
    setLS(prev => ({ ...prev, [chId]: Math.max(0, Math.min(total, val)) }));
  };

  const resolveError = id => setErrs(prev => prev.map(e => e.id === id ? { ...e, resolved: !e.resolved } : e));
  const deleteError = id => setErrs(prev => prev.filter(e => e.id !== id));
  const deleteMock = id => setMocks(prev => prev.filter(m => m.id !== id));

  /* ---- Derived values ---- */
  const allTopics = useMemo(() => [...SYL.Physics, ...SYL.Chemistry, ...SYL.Biology], []);
  const masteredCount = allTopics.filter(t => TS[t.id]?.status === "mastered").length;

  const allChapters = useMemo(() => {
    const out = [];
    Object.entries(LDATA).forEach(([subj, d]) => {
      d.chapters.forEach(ch => out.push(ch));
    });
    return out;
  }, []);
  const lectureTotalAll = allChapters.reduce((a, c) => a + c.t, 0);
  const lectureDoneAll = allChapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
  const lecturePct = lectureTotalAll > 0 ? Math.round((lectureDoneAll / lectureTotalAll) * 100) : 0;

  const avgMastery = allTopics.length
    ? Math.round(allTopics.reduce((a, t) => a + (TS[t.id]?.mastery || 0), 0) / allTopics.length)
    : 0;

  const backlogCount = allTopics.filter(t => TS[t.id]?.status === "backlog").length;

  const today = new Date().toISOString().slice(0, 10);
  const todaysTaskCount = tasks.filter(t => t.date === today).length;

  const highPriority = useMemo(() => {
    return allTopics
      .map(t => {
        const st = TS[t.id] || { status: "not-started", mastery: 0 };
        const backlogBonus = st.status === "backlog" ? 20 : 0;
        const weakness = 100 - st.mastery;
        const risk = t.wt * weakness + backlogBonus;
        return { ...t, risk, status: st.status };
      })
      .filter(t => t.status !== "mastered")
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 6);
  }, [TS, allTopics]);

  /* ---- Tabs ---- */
  const TABS = [
    { id: "home", e: "🏠", l: "Home" },
    { id: "lect", e: "📚", l: "Lectures" },
    { id: "syll", e: "✅", l: "Syllabus" },
    { id: "plan", e: "🗓️", l: "Planner" },
    { id: "mock", e: "📝", l: "Mocks" },
    { id: "err", e: "⚠️", l: "Errors" },
    { id: "rank", e: "🎯", l: "Rank Sim" },
    { id: "analy", e: "📊", l: "Analytics" },
    { id: "top", e: "🏆", l: "Toppers" },
    { id: "pom", e: "⏱️", l: "Focus" }
  ];

  const subjectOfTopic = t => {
    if (t.id.startsWith("p")) return "Physics";
    if (t.id.startsWith("c")) return "Chemistry";
    return "Biology";
  };

  const handleGateSubmit = () => {
    const trimmed = gateInput.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!isValidEmail) {
      setGateError("Enter a valid email address.");
      return;
    }
    setNotifyEmail(trimmed);
    setEmailInput(trimmed);
    setNotifyEmailSet(trimmed);
    setGateError("");
    // In case some chapters were already completed before this, catch them now.
    setTimeout(() => checkCompletionsAndNotify(false), 0);
  };

  /* ================= RENDER ================= */

  // One-time welcome gate: ask for an email before showing the app.
  // Skipped entirely once an email has been saved (persists in this browser).
  if (loaded && notifyEmailSet === "") {
    return (
      <div style={{
        fontFamily: "system-ui,-apple-system,sans-serif", background: "#f1f5f9",
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem"
      }}>
        <div style={{
          background: "#fff", borderRadius: 18, padding: "2rem 1.75rem", maxWidth: 380,
          width: "100%", boxShadow: "0 10px 40px rgba(15,23,42,.12)", textAlign: "center"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 1rem",
            background: "linear-gradient(135deg,#f97316,#ea580c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem"
          }}>
            🎓
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: ".4rem" }}>
            Welcome to OPERATION MBBS
          </div>
          <div style={{ fontSize: ".8rem", color: "#64748b", marginBottom: "1.3rem", lineHeight: 1.5 }}>
            Enter your email once. You'll get a congratulations message with a
            practice-test PDF every time you finish a chapter — no further
            setup needed after this.
          </div>
          <input
            style={{ ...INP, textAlign: "center", marginBottom: ".6rem" }}
            type="email"
            placeholder="you@example.com"
            value={gateInput}
            onChange={e => { setGateInput(e.target.value); setGateError(""); }}
            onKeyDown={e => { if (e.key === "Enter") handleGateSubmit(); }}
            autoFocus
          />
          {gateError && (
            <div style={{ fontSize: ".72rem", color: "#ef4444", fontWeight: 700, marginBottom: ".6rem" }}>
              {gateError}
            </div>
          )}
          <button style={{ ...PB, width: "100%" }} onClick={handleGateSubmit}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "system-ui,-apple-system,sans-serif", background: "#f1f5f9",
      minHeight: "100vh", color: "#0f172a"
    }}>
      <div style={{
        background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff",
        padding: "1rem 1rem .9rem"
      }}>
        <div style={{ fontSize: "1.15rem", fontWeight: 800 }}>OPERATION MBBS</div>
        <div style={{ fontSize: ".7rem", opacity: .85, fontWeight: 600, letterSpacing: ".04em" }}>
          NEET UG 2027 PREP OS
        </div>
      </div>

      <div style={{ padding: "1rem", paddingBottom: 90, maxWidth: 640, margin: "0 auto" }}>

        {tab === "home" && (
          <div>
            <div style={{
              background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 14,
              padding: "1rem", marginBottom: ".9rem", color: "#e0e7ff"
            }}>
              <div style={{ fontSize: ".8rem", lineHeight: 1.6 }}>{motive}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              {EXAM_DATES.map(ed => {
                const d = daysLeft(ed.date);
                return (
                  <div key={ed.id} style={{ ...CARD, textAlign: "center", padding: ".7rem .4rem", marginBottom: 0 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#ea580c", fontFamily: "monospace" }}>
                      {d >= 0 ? d : 0}
                    </div>
                    <div style={{ fontSize: ".58rem", color: "#64748b", fontWeight: 700, marginTop: ".2rem" }}>
                      {ed.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              {[
                { label: "Mastered", val: masteredCount + "/" + allTopics.length },
                { label: "Lectures", val: lecturePct + "%" },
                { label: "Avg Mastery", val: avgMastery + "%" },
                { label: "Backlog", val: backlogCount },
                { label: "Today's Tasks", val: todaysTaskCount },
                { label: "Mocks Logged", val: mocks.length }
              ].map((k, i) => (
                <div key={i} style={{ ...CARD, marginBottom: 0, padding: ".7rem" }}>
                  <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{k.label}</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, fontFamily: "monospace" }}>{k.val}</div>
                </div>
              ))}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>Email Notifications</div>
              <div style={{ fontSize: ".72rem", color: "#64748b", marginBottom: ".6rem" }}>
                {notifyEmailSet
                  ? "Notifications are set up. Change the address below if needed."
                  : "Get a congratulations email with a chapter practice-test PDF every time you finish all lectures in a chapter."}
              </div>
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input
                  style={INP} type="email" placeholder="you@example.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                />
                <button
                  style={PB}
                  onClick={() => {
                    const trimmed = emailInput.trim();
                    setNotifyEmail(trimmed);
                    setNotifyEmailSet(trimmed);
                    setEmailStatus("Saved!");
                    setTimeout(() => setEmailStatus(""), 2000);
                    // In case a chapter was already 100% before the email was set,
                    // check right away instead of waiting for lecture progress to change.
                    checkCompletionsAndNotify(true);
                  }}
                >
                  Save
                </button>
              </div>
              {emailStatus && (
                <div style={{ fontSize: ".68rem", color: "#10b981", marginTop: ".5rem", fontWeight: 700 }}>
                  {emailStatus}
                </div>
              )}
              <button
                onClick={() => checkCompletionsAndNotify(true)}
                style={{
                  marginTop: ".7rem", background: "#f1f5f9", color: "#475569", border: "none",
                  borderRadius: 8, padding: ".5rem .9rem", fontSize: ".72rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Check now for completed chapters
              </button>
              {emailCheckStatus && (
                <div style={{ fontSize: ".68rem", color: "#3b82f6", marginTop: ".5rem", fontWeight: 700 }}>
                  {emailCheckStatus}
                </div>
              )}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>Subject Progress</div>
              {["Physics", "Chemistry", "Biology"].map(subj => {
                const list = SYL[subj];
                const m = list.filter(t => TS[t.id]?.status === "mastered").length;
                return (
                  <div key={subj} style={{ marginBottom: ".7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", marginBottom: ".25rem" }}>
                      <span style={{ fontWeight: 700 }}>{subj}</span>
                      <span style={{ color: "#64748b" }}>{m}/{list.length}</span>
                    </div>
                    <ProgBar v={m} max={list.length} color={SUBJECT_COLORS[subj]} />
                  </div>
                );
              })}
            </div>

            <div style={CARD}>
              <div style={SECT_TITLE}>High-Priority Topics</div>
              {highPriority.map(t => (
                <div key={t.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: ".5rem 0", borderBottom: "1px solid #f1f5f9"
                }}>
                  <div>
                    <div style={{ fontSize: ".78rem", fontWeight: 700 }}>{t.n}</div>
                    <div style={{ fontSize: ".62rem", color: "#94a3b8" }}>{subjectOfTopic(t)} · wt {t.wt}/10</div>
                  </div>
                  <span style={{
                    fontSize: ".62rem", fontWeight: 800, color: STATUS_META[t.status]?.color,
                    background: (STATUS_META[t.status]?.color || "#94a3b8") + "20",
                    padding: ".2rem .5rem", borderRadius: 20
                  }}>
                    {STATUS_META[t.status]?.label}
                  </span>
                </div>
              ))}
            </div>

            {mocks.length > 0 && (
              <div style={CARD}>
                <div style={SECT_TITLE}>Recent Mocks</div>
                <div style={{ display: "flex", gap: ".6rem", overflowX: "auto", paddingBottom: ".3rem" }}>
                  {mocks.slice(0, 5).map(m => {
                    const pct = (parseFloat(m.total) / 720) * 100;
                    const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={m.id} style={{
                        minWidth: 100, border: "1px solid #e2e8f0", borderRadius: 10, padding: ".6rem", flexShrink: 0
                      }}>
                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>{m.date}</div>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color }}>{m.total}</div>
                        <div style={{ fontSize: ".58rem", color: "#94a3b8" }}>/720</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "lect" && (
          <div>
            <div style={{ display: "flex", gap: ".4rem", overflowX: "auto", marginBottom: ".9rem" }}>
              {Object.keys(LDATA).map(subj => (
                <button
                  key={subj}
                  onClick={() => setLectSubject(subj)}
                  style={{
                    flexShrink: 0,
                    border: "1px solid " + (lectSubject === subj ? LDATA[subj].col : "#e2e8f0"),
                    background: lectSubject === subj ? LDATA[subj].col + "18" : "#fff",
                    color: lectSubject === subj ? LDATA[subj].col : "#64748b",
                    borderRadius: 20, padding: ".4rem .8rem", fontSize: ".72rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            {(() => {
              const d = LDATA[lectSubject];
              const total = d.chapters.reduce((a, c) => a + c.t, 0);
              const done = d.chapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div style={{ ...CARD, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: ".9rem" }}>{lectSubject}</div>
                    <div style={{ fontSize: ".68rem", color: "#64748b" }}>Faculty: {d.fac}</div>
                    <div style={{ fontSize: ".68rem", color: "#94a3b8" }}>{done} / {total} lectures</div>
                  </div>
                  <Ring pct={pct} color={d.col} />
                </div>
              );
            })()}

            {LDATA[lectSubject].chapters.map(ch => {
              const done = LS[ch.id] || 0;
              const isOpen = expandedChapter === ch.id;
              return (
                <div key={ch.id} style={CARD}>
                  <div
                    onClick={() => setExpandedChapter(isOpen ? null : ch.id)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{ch.n}</div>
                      <div style={{ marginTop: ".35rem" }}>
                        <ProgBar v={done} max={ch.t} color={LDATA[lectSubject].col} />
                      </div>
                    </div>
                    <div style={{ marginLeft: ".7rem", fontFamily: "monospace", fontSize: ".72rem", color: "#64748b" }}>
                      {done}/{ch.t}
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: ".8rem", display: "flex", alignItems: "center", gap: ".6rem" }}>
                      <button
                        onClick={() => bumpLecture(ch.id, ch.t, -1)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        −
                      </button>
                      <input
                        type="range" min={0} max={ch.t} value={done}
                        onChange={e => setLectureCount(ch.id, ch.t, parseInt(e.target.value, 10))}
                        style={{ flex: 1, accentColor: LDATA[lectSubject].col }}
                      />
                      <button
                        onClick={() => bumpLecture(ch.id, ch.t, 1)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={CARD}>
              <div style={SECT_TITLE}>Standing</div>
              {(() => {
                const d = LDATA[lectSubject];
                const total = d.chapters.reduce((a, c) => a + c.t, 0);
                const done = d.chapters.reduce((a, c) => a + (LS[c.id] || 0), 0);
                const pct = total > 0 ? (done / total) * 100 : 0;
                return (
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <Ring pct={pct} size={64} color={d.col} sub="You" />
                    <Ring pct={45} size={64} color="#94a3b8" sub="Avg Batch" />
                    <Ring pct={90} size={64} color="#10b981" sub="Topper" />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {tab === "syll" && (
          <div>
            <div style={{ display: "flex", gap: ".4rem", marginBottom: ".7rem" }}>
              {["Physics", "Chemistry", "Biology"].map(subj => (
                <button
                  key={subj}
                  onClick={() => setSyllSubject(subj)}
                  style={{
                    border: "1px solid " + (syllSubject === subj ? SUBJECT_COLORS[subj] : "#e2e8f0"),
                    background: syllSubject === subj ? SUBJECT_COLORS[subj] + "18" : "#fff",
                    color: syllSubject === subj ? SUBJECT_COLORS[subj] : "#64748b",
                    borderRadius: 10, padding: ".45rem .9rem", fontSize: ".78rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", flex: 1
                  }}
                >
                  {subj}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: ".4rem", overflowX: "auto", marginBottom: ".9rem" }}>
              {["all", ...STATUS_LIST].map(f => (
                <button
                  key={f}
                  onClick={() => setSyllFilter(f)}
                  style={{
                    flexShrink: 0,
                    border: "1px solid " + (syllFilter === f ? "#f97316" : "#e2e8f0"),
                    background: syllFilter === f ? "#fff7ed" : "#fff",
                    color: syllFilter === f ? "#ea580c" : "#64748b",
                    borderRadius: 20, padding: ".35rem .7rem", fontSize: ".68rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap"
                  }}
                >
                  {f === "all" ? "All" : STATUS_META[f].label}
                </button>
              ))}
            </div>

            {SYL[syllSubject]
              .filter(t => syllFilter === "all" || (TS[t.id]?.status || "not-started") === syllFilter)
              .map(t => {
                const st = TS[t.id] || { status: "not-started", mastery: 0 };
                const meta = STATUS_META[st.status];
                return (
                  <div key={t.id} style={CARD}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{t.n}</div>
                        <span style={{
                          fontSize: ".58rem", fontWeight: 800,
                          color: t.w === "H" ? "#ef4444" : t.w === "M" ? "#f59e0b" : "#64748b",
                          background: (t.w === "H" ? "#ef4444" : t.w === "M" ? "#f59e0b" : "#94a3b8") + "18",
                          padding: ".1rem .4rem", borderRadius: 6
                        }}>
                          {t.w === "H" ? "HIGH" : t.w === "M" ? "MED" : "LOW"} · {t.wt}/10
                        </span>
                      </div>
                      <button
                        onClick={() => bumpStatus(t.id)}
                        style={{
                          border: "none", borderRadius: 20, padding: ".3rem .65rem", fontSize: ".62rem",
                          fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                          color: meta.color, background: meta.color + "18"
                        }}
                      >
                        {meta.label}
                      </button>
                    </div>
                    <div style={{ marginTop: ".6rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
                      <span style={{ fontSize: ".6rem", color: "#94a3b8", width: 62 }}>Mastery</span>
                      <input
                        type="range" min={0} max={100} value={st.mastery}
                        onChange={e => setMastery(t.id, parseInt(e.target.value, 10))}
                        style={{ flex: 1, accentColor: SUBJECT_COLORS[syllSubject] }}
                      />
                      <span style={{ fontSize: ".65rem", fontFamily: "monospace", width: 30, textAlign: "right" }}>{st.mastery}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {tab === "plan" && <Planner tasks={tasks} setTasks={setTasks} />}

        {tab === "mock" && (
          <div>
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10,
              padding: ".7rem", marginBottom: ".9rem", fontSize: ".72rem", color: "#1e40af"
            }}>
              NEET Part Test — sectional. NEET Full Test — max 720 (Phy 180 + Chem 180 + Bio 360).
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Mocks</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>{mocks.length}</div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Average Score</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.length ? Math.round(mocks.reduce((a, m) => a + (parseFloat(m.total) || 0), 0) / mocks.length) : 0}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Part Tests</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.filter(m => m.type === "NEET Part Test").length}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Full Tests</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>
                  {mocks.filter(m => m.type === "NEET Full Test").length}
                </div>
              </div>
            </div>

            <button style={{ ...PB, width: "100%", marginBottom: ".9rem" }} onClick={() => setMockModalOpen(true)}>
              + Log Mock
            </button>

            {mocks.map(m => {
              const pct = (parseFloat(m.total) / 720) * 100;
              const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
              return (
                <div key={m.id} style={CARD}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: ".8rem", fontWeight: 700 }}>{m.type}</div>
                      <div style={{ fontSize: ".65rem", color: "#94a3b8" }}>{m.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 800, color }}>{m.total}/720</div>
                      <button onClick={() => deleteMock(m.id)} style={{
                        background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: ".8rem", fontFamily: "inherit"
                      }}>
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: ".5rem", fontSize: ".68rem", color: "#64748b" }}>
                    <span>Phy: {m.phy}</span>
                    <span>Chem: {m.chem}</span>
                    <span>Bio: {m.bio}</span>
                  </div>
                  {m.notes && <div style={{ marginTop: ".4rem", fontSize: ".7rem", color: "#94a3b8", fontStyle: "italic" }}>{m.notes}</div>}
                </div>
              );
            })}

            {mockModalOpen && <MockModal onClose={() => setMockModalOpen(false)} onSave={m => setMocks([m, ...mocks])} />}
          </div>
        )}

        {tab === "err" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginBottom: ".9rem" }}>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace" }}>{errs.length}</div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Open</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "#ef4444" }}>
                  {errs.filter(e => !e.resolved).length}
                </div>
              </div>
              <div style={{ ...CARD, marginBottom: 0 }}>
                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Done</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "monospace", color: "#10b981" }}>
                  {errs.filter(e => e.resolved).length}
                </div>
              </div>
            </div>

            <button style={{ ...PB, width: "100%", marginBottom: ".9rem" }} onClick={() => setErrModalOpen(true)}>
              + Log Error
            </button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: ".9rem" }}>
              {ERROR_TYPES.map(et => (
                <span key={et} style={{
                  fontSize: ".62rem", fontWeight: 700, color: "#64748b", background: "#e2e8f0",
                  padding: ".25rem .55rem", borderRadius: 20
                }}>
                  {et}: {errs.filter(e => e.errorType === et).length}
                </span>
              ))}
            </div>

            {errs.map(e => (
              <div key={e.id} style={{ ...CARD, opacity: e.resolved ? .6 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: ".68rem", color: "#94a3b8" }}>{e.date} · {e.subject}</div>
                    <div style={{ fontSize: ".8rem", fontWeight: 700, margin: ".2rem 0" }}>{e.desc}</div>
                    <span style={{
                      fontSize: ".6rem", fontWeight: 700, color: "#ea580c", background: "#fff7ed",
                      padding: ".15rem .45rem", borderRadius: 20
                    }}>
                      {e.errorType}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: ".4rem" }}>
                    <button onClick={() => resolveError(e.id)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "1rem", fontFamily: "inherit"
                    }}>
                      {e.resolved ? "✅" : "⬜"}
                    </button>
                    <button onClick={() => deleteError(e.id)} style={{
                      background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: ".9rem", fontFamily: "inherit"
                    }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {errModalOpen && <ErrModal onClose={() => setErrModalOpen(false)} onSave={e => setErrs([e, ...errs])} />}
          </div>
        )}

        {tab === "rank" && <RankSim />}
        {tab === "analy" && <Analytics TS={TS} mocks={mocks} errs={errs} />}
        {tab === "top" && <ToppersScreen />}
        {tab === "pom" && <Pomodoro />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
        borderTop: "1px solid #e2e8f0", display: "flex", overflowX: "auto",
        zIndex: 500
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: "0 0 auto", minWidth: 64, background: "none", border: "none",
                borderBottom: active ? "3px solid #ea580c" : "3px solid transparent",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: ".5rem .3rem", cursor: "pointer", fontFamily: "inherit",
                opacity: active ? 1 : .65, filter: active ? "none" : "grayscale(40%)"
              }}
            >
              <div style={{ fontSize: "1.1rem" }}>{t.e}</div>
              <div style={{ fontSize: ".55rem", fontWeight: 700, color: active ? "#ea580c" : "#64748b", marginTop: ".15rem" }}>
                {t.l}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

