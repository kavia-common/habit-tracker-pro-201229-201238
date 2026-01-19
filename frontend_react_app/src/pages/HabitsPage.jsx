import React, { useMemo, useState } from "react";
import { useAppActions, useAppState } from "../app/store/store";
import { selectActiveHabits, selectCategories } from "../app/store/selectors";
import HabitCard from "../components/habits/HabitCard";
import Modal from "../components/common/Modal";
import HabitForm from "../components/habits/HabitForm";

// PUBLIC_INTERFACE
export default function HabitsPage() {
  /** Habit CRUD page with add/edit/delete and archive actions. */
  const state = useAppState();
  const actions = useAppActions();

  const habits = selectActiveHabits(state);
  const categories = selectCategories(state);

  const categoryNameById = useMemo(() => {
    const map = {};
    for (const c of categories) map[c.id] = c.name;
    return map;
  }, [categories]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (habit) => {
    setEditing(habit);
    setModalOpen(true);
  };

  const close = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const submit = async (values) => {
    if (editing) {
      await actions.updateHabit(editing.id, values);
    } else {
      await actions.createHabit(values);
    }
    close();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Habits</h1>
          <p className="page-desc">Create, edit, and organize your daily habits.</p>
        </div>

        <button className="btn" type="button" onClick={openAdd}>
          ➕ Add New Habit
        </button>
      </div>

      {state.status.loading && !state.status.hydrated ? <div className="card">Loading…</div> : null}

      {habits.length === 0 ? (
        <div className="card">
          <div className="card-title">No habits created yet</div>
          <div className="card-subtitle">Use the button above to create your first habit and start tracking!</div>
        </div>
      ) : (
        <div className="habit-list" aria-label="Habits list">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              subtitle={
                (h.categoryId && categoryNameById[h.categoryId] ? `Category: ${categoryNameById[h.categoryId]}` : null) ||
                (h.description || "")
              }
              actions={
                <>
                  <button className="btn btn-secondary" type="button" onClick={() => openEdit(h)}>
                    Edit
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={() => actions.archiveHabit(h.id)}>
                    Archive
                  </button>
                  <button className="btn btn-danger" type="button" onClick={() => actions.deleteHabit(h.id)}>
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Edit habit" : "Add habit"} onClose={close}>
        <HabitForm initialHabit={editing} onCancel={close} onSubmit={submit} />
      </Modal>
    </div>
  );
}
