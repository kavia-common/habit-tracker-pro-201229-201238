import React from "react";

// PUBLIC_INTERFACE
export default function HabitCard({
  habit,
  children,
  actions,
  subtitle,
}) {
  /** Presentational habit card container with optional actions and extra content. */
  const accent = habit.color || "rgba(124,58,237,0.55)";

  return (
    <div className="card habit-card" style={{ borderLeft: `4px solid ${accent}` }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <h3 className="habit-name">{habit.name}</h3>
          {subtitle ? <p className="habit-desc">{subtitle}</p> : habit.description ? <p className="habit-desc">{habit.description}</p> : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
      </div>

      {children ? <div className="habit-meta">{children}</div> : null}
    </div>
  );
}
