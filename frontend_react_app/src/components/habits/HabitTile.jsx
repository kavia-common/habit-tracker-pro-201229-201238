import React from "react";

// PUBLIC_INTERFACE
export default function HabitTile({
  habit,
  subtitle,
  completed,
  onToggle,
  meta,
  rightActions,
}) {
  /** Habit tile: FreeWWW-like “tap/click anywhere” check-in interaction. */
  const accent = habit?.color || "rgba(124,58,237,0.55)";

  return (
    <button
      type="button"
      className="habit-tile"
      onClick={onToggle}
      aria-label={completed ? `Mark ${habit.name} incomplete for today` : `Mark ${habit.name} complete for today`}
      style={{ borderLeft: `6px solid ${accent}` }}
    >
      <div className="habit-tile-top">
        <div style={{ minWidth: 0 }}>
          <h3 className="habit-title">{habit.name}</h3>
          {subtitle ? <p className="habit-subtitle">{subtitle}</p> : null}
        </div>

        <div className="habit-right">
          <span className="habit-check" data-state={completed ? "on" : "off"} aria-hidden="true">
            {completed ? "✓ Done" : "Check in"}
          </span>

          {/* Optional extra actions; stop propagation so tile click remains check-in */}
          {rightActions ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}
            >
              {rightActions}
            </div>
          ) : null}
        </div>
      </div>

      {meta ? <div className="habit-tile-meta">{meta}</div> : null}
    </button>
  );
}
