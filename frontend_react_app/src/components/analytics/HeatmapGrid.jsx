import React, { useMemo } from "react";
import { getLastNDaysKeys, parseDayKey } from "../../services/time/dates";

/**
 * Map completion rate to intensity level 0..4.
 */
const levelForRate = (rate) => {
  if (rate <= 0) return 0;
  if (rate < 0.25) return 1;
  if (rate < 0.5) return 2;
  if (rate < 0.75) return 3;
  return 4;
};

// PUBLIC_INTERFACE
export default function HeatmapGrid({ checkins, totalHabits, days = 84 }) {
  /** Heatmap grid for last N days (default 12 weeks). */
  const dayKeys = useMemo(() => getLastNDaysKeys(days), [days]);

  const byDate = useMemo(() => {
    const m = new Map();
    for (const c of checkins || []) {
      if (!c?.date) continue;
      if (!m.has(c.date)) m.set(c.date, []);
      m.get(c.date).push(c);
    }
    return m;
  }, [checkins]);

  const cells = useMemo(() => {
    return dayKeys.map((date) => {
      const dayCheckins = byDate.get(date) || [];
      const completedCount = dayCheckins.filter((c) => c.completed).length;
      const denom = Math.max(0, totalHabits || 0);
      const rate = denom === 0 ? 0 : completedCount / denom;
      return {
        date,
        completedCount,
        totalHabits: denom,
        level: levelForRate(rate),
        label: `${date}: ${completedCount}/${denom} habits completed`,
      };
    });
  }, [dayKeys, byDate, totalHabits]);

  // Arrange in columns of 7 rows (week columns)
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < cells.length; i += 7) {
      cols.push(cells.slice(i, i + 7));
    }
    return cols;
  }, [cells]);

  return (
    <div className="card">
      <div className="card-title">Heatmap</div>
      <div className="card-subtitle">Last {days} days intensity based on completions</div>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <div className="heatmap" aria-label="Completion heatmap grid">
          {columns.map((col, idx) => (
            <div className="heatmap-col" key={idx} aria-label={`Week column ${idx + 1}`}>
              {col.map((cell) => (
                <button
                  key={cell.date}
                  type="button"
                  className="heatcell"
                  data-level={String(cell.level)}
                  aria-label={cell.label}
                  title={cell.label}
                  onClick={() => {
                    // no-op click; retained for accessibility focus and potential future drill-down
                    const d = parseDayKey(cell.date);
                    if (d) {
                      // eslint-disable-next-line no-unused-vars
                      const _ = d.getTime();
                    }
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, color: "var(--color-muted)", fontSize: 12 }}>
        Tip: Use Tab to focus cells and hear date/completion via screen reader.
      </div>
    </div>
  );
}
