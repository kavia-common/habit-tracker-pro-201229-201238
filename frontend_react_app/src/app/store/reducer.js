import { actionTypes } from "./actions";

export const initialState = {
  ui: {
    theme: "light",
    activeCategoryId: "",
    featureFlags: {},
  },
  entities: {
    habitsById: {},
    categoriesById: {},
  },
  checkins: {
    items: [],
  },
  status: {
    hydrated: false,
    loading: false,
    error: "",
  },
};

const upsertById = (map, entity) => ({ ...map, [entity.id]: entity });

// PUBLIC_INTERFACE
export function appReducer(state, action) {
  /** Main app reducer. */
  switch (action.type) {
    case actionTypes.HYDRATE_START:
      return { ...state, status: { ...state.status, loading: true, error: "" } };

    case actionTypes.HYDRATE_SUCCESS:
      return {
        ...state,
        ui: { ...state.ui, ...action.payload.ui },
        entities: action.payload.entities,
        checkins: action.payload.checkins,
        status: { hydrated: true, loading: false, error: "" },
      };

    case actionTypes.HYDRATE_ERROR:
      return {
        ...state,
        status: { hydrated: false, loading: false, error: action.payload.error || "Hydration failed" },
      };

    case actionTypes.SET_THEME:
      return { ...state, ui: { ...state.ui, theme: action.payload.theme } };

    case actionTypes.SET_ACTIVE_CATEGORY:
      return { ...state, ui: { ...state.ui, activeCategoryId: action.payload.categoryId } };

    case actionTypes.UPSERT_HABIT:
      return {
        ...state,
        entities: {
          ...state.entities,
          habitsById: upsertById(state.entities.habitsById, action.payload.habit),
        },
      };

    case actionTypes.REMOVE_HABIT: {
      const next = { ...state.entities.habitsById };
      delete next[action.payload.habitId];
      return { ...state, entities: { ...state.entities, habitsById: next } };
    }

    case actionTypes.UPSERT_CATEGORY:
      return {
        ...state,
        entities: {
          ...state.entities,
          categoriesById: upsertById(state.entities.categoriesById, action.payload.category),
        },
      };

    case actionTypes.SET_CATEGORIES: {
      const byId = {};
      for (const c of action.payload.categories || []) byId[c.id] = c;
      return { ...state, entities: { ...state.entities, categoriesById: byId } };
    }

    case actionTypes.SET_CHECKINS:
      return { ...state, checkins: { items: action.payload.items || [] } };

    case actionTypes.UPSERT_CHECKIN: {
      const next = [...(state.checkins.items || [])];
      const idx = next.findIndex((c) => c.key === action.payload.checkin.key);
      if (idx >= 0) next[idx] = action.payload.checkin;
      else next.push(action.payload.checkin);
      return { ...state, checkins: { items: next } };
    }

    default:
      return state;
  }
}
