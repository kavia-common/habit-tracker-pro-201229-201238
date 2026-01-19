import React, { useMemo } from "react";
import { useAppState } from "../app/store/store";
import { selectActiveHabits } from "../app/store/selectors";
import { getLastNDaysKeys, getTodayKey } from "../services/time/dates";
import { aggregateWeekly } from "../services/analytics/aggregateWeekly";
import { aggregateMonthly } from "../services/analytics/aggregateMonthly";
import WeeklyChart from "../components/analytics/WeeklyChart";
import MonthlyChart from "../components/analytics/MonthlyChart";
import HeatmapGrid from "../components/analytics/HeatmapGrid";

// PUBLIC_INTERFACE
export default function AnalyticsPage() {
  /** Analytics dashboard: weekly/monthly trends and heatmap. */
  const state = useAppState();
  const habits = selectActiveHabits(state);

  const totalHabits = habits.length;
  const checkins = state.checkins.items || [];

  const todayKey = getTodayKey();

  const weeklyData = useMemo(() => {
    const keys = getLastNDaysKeys(7, todayKey);
    return aggregateWeekly({ dayKeys: keys, checkins, totalHabits });
  }, [checkins, totalHabits, todayKey]);

  const monthlyData = useMemo(() => {
    const keys = getLastNDaysKeys(30, todayKey);
    return aggregateMonthly({ dayKeys: keys, checkins, totalHabits });
  }, [checkins, totalHabits, todayKey]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-desc">Explore completion trends and activity patterns.</p>
        </div>
      </div>

      {totalHabits === 0 ? (
        <div className="card">
          <div className="card-title">No data yet</div>
          <div className="card-subtitle">Add at least one habit and check in to see analytics.</div>
        </div>
      ) : (
        <>
          <div className="grid">
            <WeeklyChart data={weeklyData} />
            <MonthlyChart data={monthlyData} />
          </div>

          <HeatmapGrid checkins={checkins} totalHabits={totalHabits} days={84} />
        </>
      )}
    </div>
  );
}
