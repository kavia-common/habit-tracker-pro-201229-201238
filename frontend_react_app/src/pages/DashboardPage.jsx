import React, { useMemo } from "react";
import { useAppActions, useAppState } from "../app/store/store";
import {
  computeDailyCompletion,
  computeStreaksForHabit,
  selectActiveHabits,
  selectCheckinsByHabitId,
  selectTodayCheckinByHabitId,
} from "../app/store/selectors";
import HabitCard from "../components/habits/HabitCard";
import { getTodayKey } from "../services/time/dates";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard "Today" view: check-ins, completion KPI, streak indicators. */
  const state = useAppState();
  const { toggleTodayCheckin } = useAppActions();

  const habits = selectActiveHabits(state);
  const todayCompletedByHabitId = selectTodayCheckinByHabitId(state);
  const byHabit = selectCheckinsByHabitId(state);

  const completion = useMemo(
    () => computeDailyCompletion({ habits, todayCompletedByHabitId }),
    [habits, todayCompletedByHabitId]
  );

  const todayKey = getTodayKey();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-desc">Check in on your habits for {todayKey}.</p>
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="kpi">
            <div className="kpi-value">{Math.round(completion.rate * 100)}%</div>
            <div className="kpi-label">
              {completion.completed}/{completion.total} completed
            </div>
          </div>
        </div>
      </div>

      {state.status.loading && !state.status.hydrated ? (
        <div className="card">Loading your data…</div>
      ) : null}

      {state.status.error ? (
        <div className="card" role="alert" style={{ borderColor: "rgba(239,68,68,0.45)" }}>
          Error: {state.status.error}
        </div>
      ) : null}

      {habits.length === 0 ? (
        <div className="card">
          <div className="card-title">No active habits yet</div>
          <div className="card-subtitle">Go to Habits to add your first habit.</div>
        </div>
      ) : (
        <div className="habit-list">
          {habits.map((h) => {
            const completed = Boolean(todayCompletedByHabitId[h.id]);
            const streaks = computeStreaksForHabit({
              habitId: h.id,
              checkinsByDate: byHabit[h.id] || {},
              todayKey,
            });

            return (
              <HabitCard
                key={h.id}
                habit={h}
                subtitle={h.description ? h.description : "Tap to check in for today."}
                actions={
                  <button
                    type="button"
                    className={completed ? "toggle toggle-on" : "toggle"}
                    onClick={() => toggleTodayCheckin(h.id)}
                    aria-label={completed ? `Mark ${h.name} incomplete for today` : `Mark ${h.name} complete for today`}
                  >
                    {completed ? "✓ Done" : "Check in"}
                  </button>
                }
              >
                <span className="badge badge-primary" aria-label={`Current streak ${streaks.currentStreak} days`}>
                  Current: {streaks.currentStreak}d
                </span>
                <span className="badge badge-success" aria-label={`Longest streak ${streaks.longestStreak} days`}>
                  Best: {streaks.longestStreak}d
                </span>
              </HabitCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
