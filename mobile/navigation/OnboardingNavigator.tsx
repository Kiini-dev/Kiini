/**
 * Onboarding Navigator
 * Manages the onboarding flow screens
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useOnboarding } from "../context/OnboardingContext";

import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import FeaturesScreen from "../screens/onboarding/FeaturesScreen";
import PermissionsScreen from "../screens/onboarding/PermissionsScreen";
import ProfileSetupScreen from "../screens/onboarding/ProfileSetupScreen";
import OrganizationSetupScreen from "../screens/onboarding/OrganizationSetupScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  const { currentStep } = useOnboarding();

  const getCurrentScreen = () => {
    switch (currentStep) {
      case 0:
        return "Welcome";
      case 1:
        return "Features";
      case 2:
        return "Permissions";
      case 3:
        return "ProfileSetup";
      case 4:
        return "OrganizationSetup";
      default:
        return "Welcome";
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: false, // Disable swipe gestures during onboarding
      }}
      initialRouteName={getCurrentScreen()}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Features" component={FeaturesScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="OrganizationSetup" component={OrganizationSetupScreen} />
    </Stack.Navigator>
  );
}