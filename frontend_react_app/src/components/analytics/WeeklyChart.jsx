import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// PUBLIC_INTERFACE
export default function WeeklyChart({ data }) {
  /** Weekly completion rate chart. Expects [{date, completionRate}]. */
  return (
    <div className="card">
      <div className="card-title">Weekly trend</div>
      <div className="card-subtitle">Last 7 days completion rate</div>
      <div style={{ height: 260, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(124,58,237,0.12)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 1]} />
            <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
            <Line type="monotone" dataKey="completionRate" stroke="#7C3AED" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
