import { openDB } from "idb";
import { DB_NAME, DB_VERSION, runMigrations } from "./migrations";

// PUBLIC_INTERFACE
export async function getDb(logger) {
  /** Open (and migrate) the app's IndexedDB database. */
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(dbInstance, oldVersion, newVersion, transaction) {
      runMigrations(dbInstance, oldVersion, transaction, logger);
      // Track schema version in appMeta (best-effort; store may not exist pre-v1).
      try {
        const metaStore = transaction.objectStore("appMeta");
        metaStore.put({ key: "schemaVersion", value: newVersion, updatedAt: Date.now() });
        metaStore.put({ key: "lastMigrationAt", value: Date.now(), updatedAt: Date.now() });
      } catch {
        // ignore; will exist after v1
      }
    },
  });

  return db;
}
