import {
  LineChart, Line, BarChart, Bar as RBar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { CARD, SECT_TITLE } from "../styles.js";
import { Ring } from "./Primitives.jsx";
import { SYL, ERROR_TYPES, SUBJECT_COLORS } from "../data.js";

export function Analytics({ TS, mocks, errs }) {
  const mockChartData = mocks.slice(0, 8).reverse().map(m => ({
    name: m.date.slice(5),
    total: parseFloat(m.total) || 0
  }));

  const subjMastery = (list) => {
    if (!list.length) return 0;
    const sum = list.reduce((a, t) => a + (TS[t.id]?.mastery || 0), 0);
    return Math.round(sum / list.length);
  };
  const radarData = [
    { subject: "Physics", value: subjMastery(SYL.Physics) },
    { subject: "Chemistry", value: subjMastery(SYL.Chemistry) },
    { subject: "Biology", value: subjMastery(SYL.Biology) }
  ];

  const masteredBarData = [
    { name: "Physics", mastered: SYL.Physics.filter(t => TS[t.id]?.status === "mastered").length, total: SYL.Physics.length },
    { name: "Chemistry", mastered: SYL.Chemistry.filter(t => TS[t.id]?.status === "mastered").length, total: SYL.Chemistry.length },
    { name: "Biology", mastered: SYL.Biology.filter(t => TS[t.id]?.status === "mastered").length, total: SYL.Biology.length }
  ];

  const errorTypeData = ERROR_TYPES.map(et => ({
    name: et.split(" ")[0], count: errs.filter(e => e.errorType === et).length
  }));

  return (
    <div>
      <div style={CARD}>
        <div style={SECT_TITLE}>Mock Score Trend (last 8)</div>
        {mockChartData.length === 0 ? (
          <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>Log a few mocks to see your trend here.</div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={mockChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 720]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Subject Mastery Radar</div>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} outerRadius={55}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
            <Radar dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Topics Mastered vs Total</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={masteredBarData}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <RBar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            <RBar dataKey="mastered" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Error Type Breakdown</div>
        {errs.length === 0 ? (
          <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>No errors logged yet — nice, or you haven't started tracking.</div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={errorTypeData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip />
              <RBar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={CARD}>
        <div style={SECT_TITLE}>Mastery by Subject</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Ring pct={subjMastery(SYL.Physics)} color={SUBJECT_COLORS.Physics} sub="Physics" />
          <Ring pct={subjMastery(SYL.Chemistry)} color={SUBJECT_COLORS.Chemistry} sub="Chemistry" />
          <Ring pct={subjMastery(SYL.Biology)} color={SUBJECT_COLORS.Biology} sub="Biology" />
        </div>
      </div>
    </div>
  );
}
