import React, { useMemo } from "react";
import { useAppActions, useAppState } from "../app/store/store";
import {
  computeDailyCompletion,
  computeStreaksForHabit,
  selectActiveHabits,
  selectCheckinsByHabitId,
  selectTodayCheckinByHabitId,
} from "../app/store/selectors";
import HabitTile from "../components/habits/HabitTile";
import { getTodayKey } from "../services/time/dates";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard "Today" view: check-ins, completion KPI, streak indicators (FreeWWW-like tiles). */
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

  const activeStreaks = useMemo(() => {
    let count = 0;
    for (const h of habits) {
      const s = computeStreaksForHabit({
        habitId: h.id,
        checkinsByDate: byHabit[h.id] || {},
        todayKey,
      });
      if (s.currentStreak > 0) count += 1;
    }
    return count;
  }, [habits, byHabit, todayKey]);

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Today</h1>
        <p className="page-desc">{todayKey}</p>
      </div>

      <div className="stat-grid" aria-label="Today summary statistics">
        <div className="stat-tile">
          <div className="stat-title">Completed Today</div>
          <div className="stat-value">{completion.completed}</div>
          <div className="stat-hint">Habits marked done</div>
        </div>

        <div className="stat-tile">
          <div className="stat-title">Total Habits</div>
          <div className="stat-value">{completion.total}</div>
          <div className="stat-hint">Active habits</div>
        </div>

        <div className="stat-tile">
          <div className="stat-title">Completion Rate</div>
          <div className="stat-value">{Math.round(completion.rate * 100)}%</div>
          <div className="stat-hint">Today</div>
        </div>

        <div className="stat-tile">
          <div className="stat-title">Active Streaks</div>
          <div className="stat-value">{activeStreaks}</div>
          <div className="stat-hint">Habits with a streak</div>
        </div>
      </div>

      {state.status.loading && !state.status.hydrated ? <div className="card">Loading your data…</div> : null}

      {state.status.error ? (
        <div className="card" role="alert" style={{ borderColor: "rgba(239,68,68,0.45)" }}>
          Error: {state.status.error}
        </div>
      ) : null}

      {habits.length === 0 ? (
        <div className="card">
          <div className="card-title">🎯 No habits yet!</div>
          <div className="card-subtitle">
            Start building better routines by adding your first habit. Small steps lead to big changes!
          </div>
        </div>
      ) : (
        <div className="habit-list" aria-label="Today habits list">
          {habits.map((h) => {
            const completed = Boolean(todayCompletedByHabitId[h.id]);
            const streaks = computeStreaksForHabit({
              habitId: h.id,
              checkinsByDate: byHabit[h.id] || {},
              todayKey,
            });

            const subtitle = h.description ? h.description : "Tap to check in for today.";

            return (
              <HabitTile
                key={h.id}
                habit={h}
                subtitle={subtitle}
                completed={completed}
                onToggle={() => toggleTodayCheckin(h.id)}
                meta={
                  <>
                    <span className="badge badge-primary" aria-label={`Current streak ${streaks.currentStreak} days`}>
                      Current: {streaks.currentStreak}d
                    </span>
                    <span className="badge badge-success" aria-label={`Longest streak ${streaks.longestStreak} days`}>
                      Best: {streaks.longestStreak}d
                    </span>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
