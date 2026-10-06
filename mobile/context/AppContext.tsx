/**
 * App Context
 * Global app state for mobile, including user and onboarding progress
 */

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppState {
  onboardingCompleted: boolean;
  setOnboardingCompleted: (value: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  return (
    <AppContext.Provider value={{ onboardingCompleted, setOnboardingCompleted }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
