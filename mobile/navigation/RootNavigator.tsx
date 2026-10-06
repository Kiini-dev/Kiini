/**
 * Root Navigator
 * Handles navigation between Auth, Onboarding, and App stacks based on authentication and onboarding state
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useOnboarding } from "../context/OnboardingContext";

import AuthStack from "./stacks/AuthStack";
import AppStack from "./stacks/AppStack";
import OnboardingNavigator from "./OnboardingNavigator";
import LoadingScreen from "../screens/LoadingScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isOnboarding, hasCompletedOnboarding } = useOnboarding();

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {isAuthenticated ? (
        isOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="App" component={AppStack} />
        )
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
