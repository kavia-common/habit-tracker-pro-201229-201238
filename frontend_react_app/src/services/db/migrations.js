/**
 * IndexedDB schema migrations. Keep migrations additive where possible.
 */

export const DB_NAME = "habitTrackerDB";
export const DB_VERSION = 2;

/**
 * Each migration step corresponds to the db "upgrade" event.
 * The idb library provides (db, oldVersion, newVersion, transaction).
 */

// PUBLIC_INTERFACE
export function runMigrations(db, oldVersion, transaction, logger) {
  /** Apply sequential schema upgrades from oldVersion to current DB_VERSION. */
  const log = logger || console;

  // v1: initial stores
  if (oldVersion < 1) {
    log.info?.("[db] Migrating to v1: creating stores");

    const habits = db.createObjectStore("habits", { keyPath: "id" });
    habits.createIndex("status", "status");
    habits.createIndex("categoryId", "categoryId");
    habits.createIndex("createdAt", "createdAt");

    const checkins = db.createObjectStore("checkins", { keyPath: "key" });
    checkins.createIndex("habitId", "habitId");
    checkins.createIndex("date", "date");

    const categories = db.createObjectStore("categories", { keyPath: "id" });
    categories.createIndex("sortOrder", "sortOrder");

    db.createObjectStore("appMeta", { keyPath: "key" });
  }

  // v2: ensure index on checkins.date exists (explicitly called out in plan).
  // If it already exists, idb/IDB will throw; guard by checking indexNames.
  if (oldVersion < 2) {
    log.info?.("[db] Migrating to v2: ensuring checkins.date index");
    const store = transaction.objectStore("checkins");
    if (!store.indexNames.contains("date")) {
      store.createIndex("date", "date");
    }
  }
}
