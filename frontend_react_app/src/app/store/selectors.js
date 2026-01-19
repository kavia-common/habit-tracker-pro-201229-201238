import { getLastNDaysKeys, getTodayKey } from "../../services/time/dates";

// PUBLIC_INTERFACE
export function selectActiveHabits(state) {
  /** Get active habits array, filtered by UI activeCategoryId when set. */
  const all = Object.values(state.entities.habitsById || {}).filter(
    (h) => (h.archivedAt ? "archived" : "active") === "active"
  );
  const catId = state.ui.activeCategoryId || "";
  return catId ? all.filter((h) => (h.categoryId || "") === catId) : all;
}

// PUBLIC_INTERFACE
export function selectArchivedHabits(state) {
  /** Get archived habits array. */
  return Object.values(state.entities.habitsById || {}).filter((h) => Boolean(h.archivedAt));
}

// PUBLIC_INTERFACE
export function selectCategories(state) {
  /** Get categories array ordered by sortOrder. */
  const cats = Object.values(state.entities.categoriesById || {});
  return cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

// PUBLIC_INTERFACE
export function selectTodayCheckinByHabitId(state) {
  /** Map of habitId -> completed(boolean) for today's date. */
  const todayKey = getTodayKey();
  const map = {};
  for (const c of state.checkins.items || []) {
    if (c.date === todayKey) map[c.habitId] = Boolean(c.completed);
  }
  return map;
}

// PUBLIC_INTERFACE
export function computeDailyCompletion({ habits, todayCompletedByHabitId }) {
  /** Compute completion ratio and counts for today based on active habits. */
  const total = habits.length;
  const completed = habits.filter((h) => Boolean(todayCompletedByHabitId[h.id])).length;
  const rate = total === 0 ? 0 : completed / total;
  return { total, completed, rate };
}

// PUBLIC_INTERFACE
export function computeStreaksForHabit({ habitId, checkinsByDate, todayKey = getTodayKey() }) {
  /**
   * Compute current streak and longest streak for a habit.
   * Streak is consecutive days with completed=true up to today (inclusive if completed today).
   */
  const completedSet = new Set(
    Object.entries(checkinsByDate || {})
      .filter(([, c]) => c && c.completed)
      .map(([date]) => date)
  );

  // Current streak: walk backwards from today.
  const keys = getLastNDaysKeys(365, todayKey); // bounded window for MVP
  let current = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const k = keys[i];
    if (completedSet.has(k)) current += 1;
    else break;
  }

  // Longest streak within window.
  let longest = 0;
  let run = 0;
  for (const k of keys) {
    if (completedSet.has(k)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  return { habitId, currentStreak: current, longestStreak: longest };
}

// PUBLIC_INTERFACE
export function selectCheckinsByHabitId(state) {
  /** Build a nested map: habitId -> date -> checkin. */
  const map = {};
  for (const c of state.checkins.items || []) {
    if (!c?.habitId || !c?.date) continue;
    if (!map[c.habitId]) map[c.habitId] = {};
    map[c.habitId][c.date] = c;
  }
  return map;
}
