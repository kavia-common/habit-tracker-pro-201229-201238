import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { appReducer, initialState } from "./reducer";
import { actionTypes } from "./actions";
import { createRepositories } from "../../services/db/repositories";
import { getAppConfig } from "../config";
import { createLogger } from "../logger";
import { getTodayKey, getLastNDaysKeys } from "../../services/time/dates";

const AppStateContext = createContext(null);
const AppActionsContext = createContext(null);

const LS_KEYS = {
  theme: "ht_theme",
  activeCategoryId: "ht_activeCategoryId",
};

const safeGet = (key, fallback = "") => {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

// PUBLIC_INTERFACE
export function AppStoreProvider({ children }) {
  /** Top-level provider: hydrates from storage and exposes actions. */
  const config = useMemo(() => getAppConfig(), []);
  const logger = useMemo(() => createLogger(config.logLevel), [config.logLevel]);
  const repos = useMemo(() => createRepositories(logger), [logger]);

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hydrate on mount
  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      dispatch({ type: actionTypes.HYDRATE_START });

      try {
        const theme = safeGet(LS_KEYS.theme, "light");
        const activeCategoryId = safeGet(LS_KEYS.activeCategoryId, "");

        const categories = await repos.CategoriesRepo.seedDefaultsIfEmpty();
        const habits = await repos.HabitsRepo.listAll();

        // For MVP, load a bounded window of checkins for analytics + today.
        const endKey = getTodayKey();
        const startKey = getLastNDaysKeys(30, endKey)[0] || endKey;
        const checkins = await repos.CheckinsRepo.listByDateRange({ startKey, endKey });

        const habitsById = {};
        for (const h of habits) habitsById[h.id] = h;

        const categoriesById = {};
        for (const c of categories) categoriesById[c.id] = c;

        if (cancelled) return;

        dispatch({
          type: actionTypes.HYDRATE_SUCCESS,
          payload: {
            ui: { theme, activeCategoryId, featureFlags: config.featureFlags },
            entities: { habitsById, categoriesById },
            checkins: { items: checkins },
          },
        });
      } catch (e) {
        logger.error("[hydrate] failed", e);
        if (!cancelled) {
          dispatch({ type: actionTypes.HYDRATE_ERROR, payload: { error: e?.message || String(e) } });
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [repos, config.featureFlags, logger]);

  // Persist theme changes
  useEffect(() => {
    safeSet(LS_KEYS.theme, state.ui.theme);
  }, [state.ui.theme]);

  // Persist active category changes
  useEffect(() => {
    safeSet(LS_KEYS.activeCategoryId, state.ui.activeCategoryId || "");
  }, [state.ui.activeCategoryId]);

  const actions = useMemo(() => {
    const createHabit = async ({ name, description, categoryId, color }) => {
      if (!name || !name.trim()) throw new Error("Habit name is required");
      const habit = await repos.HabitsRepo.create({ name: name.trim(), description, categoryId, color });
      dispatch({ type: actionTypes.UPSERT_HABIT, payload: { habit } });
      return habit;
    };

    const updateHabit = async (habitId, patch) => {
      const updated = await repos.HabitsRepo.update(habitId, patch);
      dispatch({ type: actionTypes.UPSERT_HABIT, payload: { habit: updated } });
      return updated;
    };

    const deleteHabit = async (habitId) => {
      await repos.HabitsRepo.remove(habitId);
      dispatch({ type: actionTypes.REMOVE_HABIT, payload: { habitId } });
    };

    const archiveHabit = async (habitId) => {
      const updated = await repos.HabitsRepo.archive(habitId);
      dispatch({ type: actionTypes.UPSERT_HABIT, payload: { habit: updated } });
      return updated;
    };

    const unarchiveHabit = async (habitId) => {
      const updated = await repos.HabitsRepo.unarchive(habitId);
      dispatch({ type: actionTypes.UPSERT_HABIT, payload: { habit: updated } });
      return updated;
    };

    const toggleTodayCheckin = async (habitId) => {
      const checkin = await repos.CheckinsRepo.toggleToday(habitId);
      dispatch({ type: actionTypes.UPSERT_CHECKIN, payload: { checkin } });
      return checkin;
    };

    const setTheme = (theme) => dispatch({ type: actionTypes.SET_THEME, payload: { theme } });

    const setActiveCategory = (categoryId) =>
      dispatch({ type: actionTypes.SET_ACTIVE_CATEGORY, payload: { categoryId } });

    return {
      createHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      unarchiveHabit,
      toggleTodayCheckin,
      setTheme,
      setActiveCategory,
      logger,
      config,
    };
  }, [repos]);

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>{children}</AppActionsContext.Provider>
    </AppStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Hook to access global app state. */
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStoreProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function useAppActions() {
  /** Hook to access global app actions. */
  const ctx = useContext(AppActionsContext);
  if (!ctx) throw new Error("useAppActions must be used within AppStoreProvider");
  return ctx;
}
