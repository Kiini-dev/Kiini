/**
 * Permissions Screen
 * Requests necessary app permissions
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Button, CheckBox } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useOnboarding } from "../../context/OnboardingContext";

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  granted: boolean;
}

export default function PermissionsScreen() {
  const { nextStep, previousStep } = useOnboarding();
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: "notifications",
      title: "Push Notifications",
      description: "Receive reminders for invoices, payments, and important updates",
      icon: "bell-outline",
      required: false,
      granted: false,
    },
    {
      id: "storage",
      title: "Storage Access",
      description: "Save and access files, documents, and offline data",
      icon: "folder-outline",
      required: true,
      granted: true, // Storage is usually granted by default
    },
  ]);

  const requestNotificationPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";

      setPermissions(prev =>
        prev.map(p =>
          p.id === "notifications" ? { ...p, granted } : p
        )
      );

      if (!granted) {
        Alert.alert(
          "Notifications Disabled",
          "You can enable notifications later in your device settings.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const handleContinue = () => {
    const requiredPermissions = permissions.filter(p => p.required && !p.granted);
    if (requiredPermissions.length > 0) {
      Alert.alert(
        "Required Permissions",
        "Please grant all required permissions to continue.",
        [{ text: "OK" }]
      );
      return;
    }
    nextStep();
  };

  const togglePermission = async (permissionId: string) => {
    if (permissionId === "notifications") {
      await requestNotificationPermission();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          Grant permissions to get the best experience
        </Text>
      </View>

      <View style={styles.permissionsContainer}>
        {permissions.map((permission) => (
          <View key={permission.id} style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={permission.icon as any}
                  size={24}
                  color="#3b82f6"
                />
              </View>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionTitle}>
                  {permission.title}
                  {permission.required && <Text style={styles.required}>*</Text>}
                </Text>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
              </View>
            </View>

            <CheckBox
              checked={permission.granted}
              onPress={() => togglePermission(permission.id)}
              checkedColor="#3b82f6"
              containerStyle={styles.checkbox}
            />
          </View>
        ))}
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.note}>
          * Required permissions are necessary for core app functionality
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Previous"
          type="outline"
          buttonStyle={styles.secondaryButton}
          titleStyle={styles.secondaryButtonText}
          onPress={previousStep}
          containerStyle={styles.buttonWrapper}
        />
        <Button
          title="Continue"
          buttonStyle={styles.primaryButton}
          titleStyle={styles.primaryButtonText}
          onPress={handleContinue}
          containerStyle={styles.buttonWrapper}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  permissionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  permissionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  required: {
    color: "#ef4444",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  checkbox: {
    backgroundColor: "transparent",
    borderWidth: 0,
    margin: 0,
    padding: 0,
  },
  noteContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  note: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    justifyContent: "space-between",
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
});