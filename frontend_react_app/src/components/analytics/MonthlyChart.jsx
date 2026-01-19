import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// PUBLIC_INTERFACE
export default function MonthlyChart({ data }) {
  /** Monthly completion rate chart. Expects [{date, completionRate}]. */
  return (
    <div className="card">
      <div className="card-title">Monthly trend</div>
      <div className="card-subtitle">Last 30 days completion rate</div>
      <div style={{ height: 260, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(6,182,212,0.12)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} hide />
            <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 1]} />
            <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
            <Area type="monotone" dataKey="completionRate" stroke="#06B6D4" fill="rgba(6,182,212,0.18)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
