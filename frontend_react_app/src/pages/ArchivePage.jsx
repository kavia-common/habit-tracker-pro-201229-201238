import React from "react";
import { useAppActions, useAppState } from "../app/store/store";
import { selectArchivedHabits } from "../app/store/selectors";
import HabitCard from "../components/habits/HabitCard";

// PUBLIC_INTERFACE
export default function ArchivePage() {
  /** Archived habits view with unarchive actions. */
  const state = useAppState();
  const { unarchiveHabit } = useAppActions();

  const archived = selectArchivedHabits(state);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Archive</h1>
          <p className="page-desc">Archived habits are hidden from Today and active lists.</p>
        </div>
      </div>

      {archived.length === 0 ? (
        <div className="card">
          <div className="card-title">No archived habits</div>
          <div className="card-subtitle">Archive a habit from Habits to see it here.</div>
        </div>
      ) : (
        <div className="habit-list">
          {archived.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              subtitle="Archived"
              actions={
                <button className="btn btn-secondary" type="button" onClick={() => unarchiveHabit(h.id)}>
                  Unarchive
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
