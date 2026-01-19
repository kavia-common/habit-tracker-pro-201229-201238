import React from "react";

// PUBLIC_INTERFACE
export default function IconButton({ children, onClick, ariaLabel, className = "" }) {
  /** Accessible icon-style button with minimum touch target and focus ring. */
  return (
    <button type="button" className={`iconbtn ${className}`} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
