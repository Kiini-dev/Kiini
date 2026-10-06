/**
 * Kiini Mobile App
 * React Native Expo App Entry Point
 */

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { AppProvider } from "./context/AppContext";
import { storage } from "./utils/storage";
import { API_URL, STORAGE_KEYS } from "./config/constants";

// Keep splash screen visible while we load
SplashScreen.preventAutoHideAsync();

// TRPC Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const trpcClient = createTRPCReact<any>();

async function getAuthToken() {
  try {
    return await storage.getSecure(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
}

const trpc = trpcClient.createClient({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      async headers() {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
  transformer: superjson,
});

export default function App() {
  useEffect(() => {
    // Hide splash screen after app is ready
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1000);
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <trpcClient.Provider client={trpc} queryClient={queryClient}>
          <AuthProvider>
            <OnboardingProvider>
              <AppProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </AppProvider>
            </OnboardingProvider>
          </AuthProvider>
        </trpcClient.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
