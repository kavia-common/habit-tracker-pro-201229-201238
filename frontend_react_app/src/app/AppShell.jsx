import React, { useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { getRoutes } from "./routes";
import { useTheme } from "../hooks/useTheme";
import { useAppActions, useAppState } from "./store/store";
import { selectCategories } from "./store/selectors";
import Drawer from "../components/common/Drawer";
import IconButton from "../components/common/IconButton";

const linkClass = ({ isActive }) => (isActive ? "navlink navlink-active" : "navlink");

// PUBLIC_INTERFACE
export default function AppShell() {
  /** Main layout: top nav + responsive sidebar for categories + routed main content. */
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
        <div className="sidebar-title">Categories</div>
        <div className="chip-row">
          <button
            className={ui.activeCategoryId ? "chip" : "chip chip-active"}
            onClick={() => setActiveCategory("")}
            type="button"
          >
            All
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
      <NavLink to="/" className={linkClass} end onClick={() => setNavDrawerOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/habits" className={linkClass} onClick={() => setNavDrawerOpen(false)}>
        Habits
      </NavLink>
      <NavLink to="/analytics" className={linkClass} onClick={() => setNavDrawerOpen(false)}>
        Analytics
      </NavLink>
      <NavLink to="/archive" className={linkClass} onClick={() => setNavDrawerOpen(false)}>
        Archive
      </NavLink>
      <NavLink to="/settings" className={linkClass} onClick={() => setNavDrawerOpen(false)}>
        Settings
      </NavLink>
    </nav>
  );

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="topbar-left">
          <IconButton
            className="mobile-only"
            ariaLabel="Open category filters"
            onClick={() => setFiltersDrawerOpen(true)}
          >
            ☰
          </IconButton>
          <div className="brand">
            <div className="brand-title">Habit Tracker</div>
            <div className="brand-subtitle">Daily check-ins, streaks, analytics</div>
          </div>
        </div>

        {/* Desktop primary navigation */}
        <nav className="topnav" aria-label="Primary">
          <NavLink to="/" className={linkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/habits" className={linkClass}>
            Habits
          </NavLink>
          <NavLink to="/analytics" className={linkClass}>
            Analytics
          </NavLink>
          <NavLink to="/archive" className={linkClass}>
            Archive
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
        </nav>

        <div className="topbar-right">
          {/* Mobile primary navigation menu */}
          <IconButton
            className="mobile-only"
            ariaLabel="Open navigation menu"
            onClick={() => setNavDrawerOpen(true)}
          >
            ☰
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
      </header>

      <div className="layout">
        <aside className="desktop-only">{categoryList}</aside>

        <main className="main" role="main">
          <Routes>
            {routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </main>
      </div>

      {/* Mobile drawers */}
      <Drawer open={filtersDrawerOpen} onClose={() => setFiltersDrawerOpen(false)} title="Filters">
        {categoryList}
      </Drawer>

      <Drawer open={navDrawerOpen} onClose={() => setNavDrawerOpen(false)} title="Menu">
        {primaryNavLinks}
      </Drawer>
    </div>
  );
}
