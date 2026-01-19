import React, { useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { getRoutes } from "./routes";
import { useTheme } from "../hooks/useTheme";
import { useAppActions, useAppState } from "./store/store";
import { selectCategories } from "./store/selectors";
import Drawer from "../components/common/Drawer";
import IconButton from "../components/common/IconButton";

const tabClass = ({ isActive }) => (isActive ? "tablink tablink-active" : "tablink");

// PUBLIC_INTERFACE
export default function AppShell() {
  /** Main layout: top tabs (FreeWWW-like) + responsive sidebar for categories + routed main content. */
  const routes = useMemo(() => getRoutes(), []);
  const { theme, toggleTheme } = useTheme();
  const { ui } = useAppState();
  const { setActiveCategory } = useAppActions();
  const categories = selectCategories(useAppState());

  // Separate drawers:
  // - filtersDrawerOpen: category filters (mobile)
  // - navDrawerOpen: primary navigation (mobile)
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  const categoryList = (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-title">Filter</div>
        <div className="chip-row">
          <button
            className={ui.activeCategoryId ? "chip" : "chip chip-active"}
            onClick={() => setActiveCategory("")}
            type="button"
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={ui.activeCategoryId === c.id ? "chip chip-active" : "chip"}
              onClick={() => setActiveCategory(c.id)}
              type="button"
              style={c.color ? { borderColor: c.color } : undefined}
              aria-label={`Filter by category ${c.name}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const primaryNavLinks = (
    <nav className="topnav-links" aria-label="Primary navigation links">
      <NavLink to="/" className={tabClass} end onClick={() => setNavDrawerOpen(false)}>
        Today
      </NavLink>
      <NavLink to="/habits" className={tabClass} onClick={() => setNavDrawerOpen(false)}>
        My Habits
      </NavLink>
      <NavLink to="/analytics" className={tabClass} onClick={() => setNavDrawerOpen(false)}>
        Statistics
      </NavLink>
      <NavLink to="/archive" className={tabClass} onClick={() => setNavDrawerOpen(false)}>
        Archive
      </NavLink>
      <NavLink to="/settings" className={tabClass} onClick={() => setNavDrawerOpen(false)}>
        Settings
      </NavLink>
    </nav>
  );

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-title">Free Habit Tracker</div>
            <div className="brand-subtitle">Daily check-ins, streaks, analytics</div>
          </div>

          <div className="topbar-actions">
            <IconButton
              className="mobile-only"
              ariaLabel="Open category filters"
              onClick={() => setFiltersDrawerOpen(true)}
            >
              ☰
            </IconButton>

            <IconButton
              className="mobile-only"
              ariaLabel="Open navigation menu"
              onClick={() => setNavDrawerOpen(true)}
            >
              ☷
            </IconButton>

            <button
              className="btn btn-secondary"
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {/* Desktop tabs */}
        <nav className="top-tabs desktop-only" aria-label="Primary">
          <NavLink to="/" className={tabClass} end>
            Today
          </NavLink>
          <NavLink to="/habits" className={tabClass}>
            My Habits
          </NavLink>
          <NavLink to="/analytics" className={tabClass}>
            Statistics
          </NavLink>
          <NavLink to="/archive" className={tabClass}>
            Archive
          </NavLink>
          <NavLink to="/settings" className={tabClass}>
            Settings
          </NavLink>
        </nav>
      </header>

      <div className="layout">
        <aside className="desktop-only">{categoryList}</aside>

        <main className="main" role="main">
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>

          <footer className="app-footer" aria-label="About and tips">
            <div style={{ marginTop: 18 }}>
              <strong>Tip:</strong> For best results, check in daily around the same time. Small consistent steps
              lead to big changes over time.
            </div>
            <div style={{ marginTop: 8 }}>
              Your data stays local in this browser (offline-first). Use Archive instead of Delete to preserve
              history.
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile drawers */}
      <Drawer open={filtersDrawerOpen} onClose={() => setFiltersDrawerOpen(false)} title="Filter">
        {categoryList}
      </Drawer>

      <Drawer open={navDrawerOpen} onClose={() => setNavDrawerOpen(false)} title="Menu">
        {primaryNavLinks}
      </Drawer>
    </div>
  );
}
