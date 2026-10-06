/**
 * App Stack Navigator
 * Bottom tab navigation for authenticated users
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../../screens/app/DashboardScreen";
import InvoicesScreen from "../../screens/app/InvoicesScreen";
import ContactsScreen from "../../screens/app/ContactsScreen";
import ProjectsScreen from "../../screens/app/ProjectsScreen";
import OrganizationsScreen from "../../screens/app/OrganizationsScreen";
import ReportsScreen from "../../screens/app/ReportsScreen";
import SettingsScreen from "../../screens/app/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardList"
        component={DashboardScreen}
        options={{ headerTitle: "Dashboard" }}
      />
    </Stack.Navigator>
  );
}

function InvoicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InvoicesList"
        component={InvoicesScreen}
        options={{ headerTitle: "Invoices" }}
      />
    </Stack.Navigator>
  );
}

function ContactsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ContactsList"
        component={ContactsScreen}
        options={{ headerTitle: "Contacts" }}
      />
    </Stack.Navigator>
  );
}

function ProjectsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsScreen}
        options={{ headerTitle: "Projects" }}
      />
    </Stack.Navigator>
  );
}

function OrganizationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrganizationsList"
        component={OrganizationsScreen}
        options={{ headerTitle: "Organizations" }}
      />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReportsList"
        component={ReportsScreen}
        options={{ headerTitle: "Reports" }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsList"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
    </Stack.Navigator>
  );
}

export default function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "home";

          if (route.name === "Dashboard") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Invoices") {
            iconName = focused ? "file-document" : "file-document-outline";
          } else if (route.name === "Contacts") {
            iconName = focused ? "contacts" : "contacts-outline";
          } else if (route.name === "Projects") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          } else if (route.name === "Organizations") {
            iconName = focused ? "office-building" : "office-building-outline";
          } else if (route.name === "Reports") {
            iconName = focused ? "chart-line" : "chart-line";
          } else if (route.name === "Settings") {
            iconName = focused ? "cog" : "cog-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Organizations"
        component={OrganizationsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
