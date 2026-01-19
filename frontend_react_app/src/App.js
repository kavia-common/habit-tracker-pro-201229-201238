import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppStoreProvider } from "./app/store/store";
import AppShell from "./app/AppShell";
import "./styles/theme.css";
import "./styles/components.css";

// PUBLIC_INTERFACE
function App() {
  /** App entry component: provides global store and routing shell. */
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppStoreProvider>
  );
}

export default App;
