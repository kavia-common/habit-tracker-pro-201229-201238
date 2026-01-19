import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export default function Drawer({ open, title, children, onClose }) {
  /** Right-side drawer for mobile UI; Esc closes; click overlay closes. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-wrap" role="presentation">
      <div className="drawer-overlay" onMouseDown={onClose} role="button" tabIndex={-1} aria-label="Close drawer overlay" />
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="row" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>{title}</div>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
