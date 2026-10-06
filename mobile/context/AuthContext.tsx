/**
 * Authentication Context
 * Stores authentication state and handles login/logout operations
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/constants";
import { storage } from "../utils/storage";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, any> | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    async function restoreAuth() {
      try {
        const token = await storage.getSecure(STORAGE_KEYS.AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        setIsAuthenticated(!!token);
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error("Error restoring auth state:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    restoreAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: replace with a real authentication request to the backend
    const token = "mock-token";
    await storage.setSecure(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify({ email, name: "Mobile User" })
    );
    setUser({ email, name: "Mobile User" });
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await storage.removeSecure(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      signIn,
      signOut,
    }),
    [isAuthenticated, isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
