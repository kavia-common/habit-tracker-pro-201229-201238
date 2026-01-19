import React from "react";
import { useTheme } from "../hooks/useTheme";
import { useAppActions } from "../app/store/store";
import { isFeatureEnabled } from "../app/config";

// PUBLIC_INTERFACE
export default function SettingsPage() {
  /** Settings: theme and build-time feature flags visibility (optional features are gated). */
  const { theme, toggleTheme } = useTheme();
  const { config } = useAppActions();

  const notificationsEnabled = isFeatureEnabled(config, "notifications");
  const exportEnabled = isFeatureEnabled(config, "export");
  const gamificationEnabled = isFeatureEnabled(config, "gamification");

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Preferences and optional feature flags.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Theme</div>
        <div className="card-subtitle">Current: {theme}</div>
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" type="button" onClick={toggleTheme}>
            Toggle theme
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Feature flags</div>
        <div className="card-subtitle">Optional features are disabled by default unless enabled via REACT_APP_FEATURE_FLAGS.</div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div className={notificationsEnabled ? "badge badge-success" : "badge"}>Notifications: {String(notificationsEnabled)}</div>
          <div className={exportEnabled ? "badge badge-success" : "badge"}>Export: {String(exportEnabled)}</div>
          <div className={gamificationEnabled ? "badge badge-success" : "badge"}>Gamification: {String(gamificationEnabled)}</div>
        </div>
      </div>
    </div>
  );
}
