import { getLastNDaysKeys } from "../time/dates";

// PUBLIC_INTERFACE
export function aggregateMonthly({ dayKeys, checkins, totalHabits }) {
  /**
   * Aggregate completion for a month-like range (default last 30 days) as a series:
   * [{ date, completedCount, totalHabits, completionRate }]
   */
  const keys = dayKeys && dayKeys.length ? dayKeys : getLastNDaysKeys(30);
  const byDate = new Map();
  for (const c of checkins || []) {
    if (!c?.date) continue;
    if (!byDate.has(c.date)) byDate.set(c.date, []);
    byDate.get(c.date).push(c);
  }

  return keys.map((date) => {
    const dayCheckins = byDate.get(date) || [];
    const completedCount = dayCheckins.filter((c) => c.completed).length;
    const denom = Math.max(0, totalHabits || 0);
    const completionRate = denom === 0 ? 0 : completedCount / denom;
    return { date, completedCount, totalHabits: denom, completionRate };
  });
}
