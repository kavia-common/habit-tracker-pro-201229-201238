import React, { useMemo, useState } from "react";
import { useAppState } from "../../app/store/store";
import { selectCategories } from "../../app/store/selectors";

const COLORS = [
  { label: "Neon Violet", value: "#7C3AED" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Green", value: "#22C55E" },
  { label: "Red", value: "#EF4444" },
];

// PUBLIC_INTERFACE
export default function HabitForm({ initialHabit, onCancel, onSubmit }) {
  /** Habit create/edit form. Name is required. */
  const categories = selectCategories(useAppState());
  const initial = useMemo(
    () => ({
      name: initialHabit?.name || "",
      description: initialHabit?.description || "",
      categoryId: initialHabit?.categoryId || "",
      color: initialHabit?.color || "",
    }),
    [initialHabit]
  );

  const [values, setValues] = useState(initial);
  const [error, setError] = useState("");

  const setField = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }

    await onSubmit?.({
      name: values.name.trim(),
      description: values.description,
      categoryId: values.categoryId,
      color: values.color,
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <label className="label" htmlFor="habit-name">
          Name *
        </label>
        <input
          id="habit-name"
          className="input"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g., Drink water"
          required
        />
      </div>

      <div className="form-row">
        <label className="label" htmlFor="habit-desc">
          Description
        </label>
        <textarea
          id="habit-desc"
          className="textarea"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Optional notes"
        />
      </div>

      <div className="form-row">
        <label className="label" htmlFor="habit-category">
          Category
        </label>
        <select
          id="habit-category"
          className="select"
          value={values.categoryId}
          onChange={(e) => setField("categoryId", e.target.value)}
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="helper">Used for filtering and analytics grouping (MVP: filtering).</div>
      </div>

      <div className="form-row">
        <label className="label" htmlFor="habit-color">
          Color
        </label>
        <select
          id="habit-color"
          className="select"
          value={values.color}
          onChange={(e) => setField("color", e.target.value)}
        >
          <option value="">Default</option>
          {COLORS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="badge" role="alert" style={{ borderColor: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.12)" }}>
          {error}
        </div>
      ) : null}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn">
          Save
        </button>
      </div>
    </form>
  );
}
