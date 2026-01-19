import { useEffect } from "react";
import { useAppActions, useAppState } from "../app/store/store";

// PUBLIC_INTERFACE
export function useTheme() {
  /** Manage and apply theme (light/dark) to document element. */
  const { setTheme } = useAppActions();
  const { ui } = useAppState();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", ui.theme);
  }, [ui.theme]);

  return {
    theme: ui.theme,
    setTheme,
    toggleTheme: () => setTheme(ui.theme === "light" ? "dark" : "light"),
  };
}
