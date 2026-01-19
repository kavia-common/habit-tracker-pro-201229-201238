import { nanoid } from "nanoid";
import { getDb } from "./db";
import { getTodayKey } from "../time/dates";

const toStatus = (habit) => (habit.archivedAt ? "archived" : "active");

// PUBLIC_INTERFACE
export function createRepositories(logger) {
  /** Create repository functions bound to the application's IndexedDB. */
  const log = logger || console;

  const HabitsRepo = {
    // PUBLIC_INTERFACE
    async listAll() {
      /** List all habits. */
      const db = await getDb(log);
      return db.getAll("habits");
    },

    // PUBLIC_INTERFACE
    async listByStatus(status) {
      /** List habits filtered by computed status: 'active' or 'archived'. */
      const db = await getDb(log);
      const all = await db.getAll("habits");
      return all.filter((h) => toStatus(h) === status);
    },

    // PUBLIC_INTERFACE
    async getById(id) {
      /** Get a habit by id. */
      const db = await getDb(log);
      return db.get("habits", id);
    },

    // PUBLIC_INTERFACE
    async create({ name, description, categoryId, color }) {
      /** Create a new habit. */
      const now = Date.now();
      const habit = {
        id: nanoid(),
        name,
        description: description || "",
        categoryId: categoryId || "",
        color: color || "",
        createdAt: now,
        updatedAt: now,
        archivedAt: null,
        schedule: { type: "daily" },
        goal: { type: "checkin" },
        status: "active",
      };

      const db = await getDb(log);
      await db.put("habits", habit);
      return habit;
    },

    // PUBLIC_INTERFACE
    async update(id, patch) {
      /** Update an existing habit by id with a partial patch. */
      const db = await getDb(log);
      const existing = await db.get("habits", id);
      if (!existing) throw new Error("Habit not found");

      const updated = {
        ...existing,
        ...patch,
        updatedAt: Date.now(),
      };
      updated.status = toStatus(updated);

      await db.put("habits", updated);
      return updated;
    },

    // PUBLIC_INTERFACE
    async remove(id) {
      /** Hard delete a habit. (MVP allows hard delete per plan) */
      const db = await getDb(log);
      await db.delete("habits", id);
      // Note: checkins cleanup is intentionally not automatic for MVP; could be added later.
    },

    // PUBLIC_INTERFACE
    async archive(id) {
      /** Archive a habit (sets archivedAt). */
      return HabitsRepo.update(id, { archivedAt: Date.now() });
    },

    // PUBLIC_INTERFACE
    async unarchive(id) {
      /** Unarchive a habit (clears archivedAt). */
      return HabitsRepo.update(id, { archivedAt: null });
    },
  };

  const CheckinsRepo = {
    _key(habitId, dateKey) {
      return `${habitId}:${dateKey}`;
    },

    // PUBLIC_INTERFACE
    async get(habitId, dateKey) {
      /** Get check-in for a habit/date pair. */
      const db = await getDb(log);
      return db.get("checkins", this._key(habitId, dateKey));
    },

    // PUBLIC_INTERFACE
    async setCompleted(habitId, dateKey, completed) {
      /** Create/update a habit check-in for dateKey. */
      const db = await getDb(log);
      const key = this._key(habitId, dateKey);

      const existing = await db.get("checkins", key);
      const next = {
        key,
        habitId,
        date: dateKey,
        completed: Boolean(completed),
        completedAt: completed ? Date.now() : null,
      };

      // Preserve previous completedAt if toggling completed -> completed (rare)
      if (next.completed && existing?.completedAt) {
        next.completedAt = existing.completedAt;
      }

      await db.put("checkins", next);
      return next;
    },

    // PUBLIC_INTERFACE
    async toggleToday(habitId) {
      /** Toggle today's completion for a habit. */
      const todayKey = getTodayKey();
      const existing = await this.get(habitId, todayKey);
      const nextCompleted = !(existing?.completed);
      return this.setCompleted(habitId, todayKey, nextCompleted);
    },

    // PUBLIC_INTERFACE
    async listByDateRange({ startKey, endKey }) {
      /** List check-ins in a date range (inclusive). */
      const db = await getDb(log);
      const idx = db.transaction("checkins").store.index("date");
      return idx.getAll(IDBKeyRange.bound(startKey, endKey));
    },

    // PUBLIC_INTERFACE
    async listForHabitByDateRange({ habitId, startKey, endKey }) {
      /** List check-ins for a specific habit in a date range (inclusive). */
      const db = await getDb(log);
      const all = await db.getAllFromIndex("checkins", "habitId", habitId);
      return all.filter((c) => c.date >= startKey && c.date <= endKey);
    },
  };

  const CategoriesRepo = {
    // PUBLIC_INTERFACE
    async listAll() {
      /** List all categories ordered by sortOrder. */
      const db = await getDb(log);
      const cats = await db.getAll("categories");
      return cats.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },

    // PUBLIC_INTERFACE
    async seedDefaultsIfEmpty() {
      /** Seed default categories if none exist. */
      const db = await getDb(log);
      const existing = await db.getAll("categories");
      if (existing.length > 0) return existing;

      const defaults = [
        { id: nanoid(), name: "Health", color: "#22C55E", sortOrder: 1 },
        { id: nanoid(), name: "Mind", color: "#7C3AED", sortOrder: 2 },
        { id: nanoid(), name: "Work", color: "#06B6D4", sortOrder: 3 },
        { id: nanoid(), name: "Home", color: "#F59E0B", sortOrder: 4 },
      ];

      const tx = db.transaction("categories", "readwrite");
      for (const c of defaults) tx.store.put(c);
      await tx.done;
      return defaults;
    },

    // PUBLIC_INTERFACE
    async create({ name, color, sortOrder }) {
      /** Create a category. */
      const db = await getDb(log);
      const category = {
        id: nanoid(),
        name,
        color: color || "",
        sortOrder: typeof sortOrder === "number" ? sortOrder : Date.now(),
      };
      await db.put("categories", category);
      return category;
    },
  };

  return { HabitsRepo, CheckinsRepo, CategoriesRepo };
}
