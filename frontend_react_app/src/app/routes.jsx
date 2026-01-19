import React from "react";
import { Navigate } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import HabitsPage from "../pages/HabitsPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ArchivePage from "../pages/ArchivePage";
import SettingsPage from "../pages/SettingsPage";

// PUBLIC_INTERFACE
export function getRoutes() {
  /** Return route config for the app shell. */
  return [
    { path: "/", element: <DashboardPage /> },
    { path: "/habits", element: <HabitsPage /> },
    { path: "/analytics", element: <AnalyticsPage /> },
    { path: "/archive", element: <ArchivePage /> },
    { path: "/settings", element: <SettingsPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
  ];
}
