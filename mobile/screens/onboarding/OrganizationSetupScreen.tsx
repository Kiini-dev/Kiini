/**
 * Organization Setup Screen
 * Allows user to set up their organization or join existing one
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Button, Input, Card } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboarding } from "../../context/OnboardingContext";
import { STORAGE_KEYS } from "../../config/constants";

type SetupMode = "create" | "join";

export default function OrganizationSetupScreen() {
  const { completeOnboarding, previousStep } = useOnboarding();
  const [setupMode, setSetupMode] = useState<SetupMode>("create");
  const [isLoading, setIsLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    industry: "",
    size: "",
  });

  const [joinForm, setJoinForm] = useState({
    inviteCode: "",
  });

  const handleCreateInputChange = (field: string, value: string) => {
    setCreateForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJoinInputChange = (field: string, value: string) => {
    setJoinForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCreateForm = () => {
    if (!createForm.name.trim()) {
      Alert.alert("Validation Error", "Organization name is required");
      return false;
    }
    return true;
  };

  const validateJoinForm = () => {
    if (!joinForm.inviteCode.trim()) {
      Alert.alert("Validation Error", "Invite code is required");
      return false;
    }
    return true;
  };

  const handleCreateOrganization = async () => {
    if (!validateCreateForm()) return;

    setIsLoading(true);
    try {
      // Save organization setup preference
      const orgData = {
        setupMode: "create",
        organization: {
          name: createForm.name.trim(),
          industry: createForm.industry.trim(),
          size: createForm.size.trim(),
        },
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.ORGANIZATION_SETUP,
        JSON.stringify(orgData)
      );

      await completeOnboarding();
    } catch (error) {
      console.error("Error creating organization:", error);
      Alert.alert("Error", "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!validateJoinForm()) return;

    setIsLoading(true);
    try {
      // Save organization setup preference
      const orgData = {
        setupMode: "join",
        inviteCode: joinForm.inviteCode.trim(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.ORGANIZATION_SETUP,
        JSON.stringify(orgData)
      );

      await completeOnboarding();
    } catch (error) {
      console.error("Error joining organization:", error);
      Alert.alert("Error", "Failed to join organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Organization</Text>
            <Text style={styles.subtitle}>
              Create a new organization or join an existing one
            </Text>
          </View>

          <View style={styles.modeSelector}>
            <Button
              title="Create New"
              type={setupMode === "create" ? "solid" : "outline"}
              buttonStyle={
                setupMode === "create" ? styles.activeModeButton : styles.inactiveModeButton
              }
              titleStyle={
                setupMode === "create" ? styles.activeModeText : styles.inactiveModeText
              }
              onPress={() => setSetupMode("create")}
              containerStyle={styles.modeButtonContainer}
            />
            <Button
              title="Join Existing"
              type={setupMode === "join" ? "solid" : "outline"}
              buttonStyle={
                setupMode === "join" ? styles.activeModeButton : styles.inactiveModeButton
              }
              titleStyle={
                setupMode === "join" ? styles.activeModeText : styles.inactiveModeText
              }
              onPress={() => setSetupMode("join")}
              containerStyle={styles.modeButtonContainer}
            />
          </View>

          {setupMode === "create" ? (
            <Card containerStyle={styles.formCard}>
              <Card.Title style={styles.cardTitle}>Create Organization</Card.Title>
              <Card.Divider />

              <Input
                label="Organization Name *"
                placeholder="Enter organization name"
                value={createForm.name}
                onChangeText={(value) => handleCreateInputChange("name", value)}
                containerStyle={styles.inputContainer}
                inputStyle={styles.input}
                labelStyle={styles.inputLabel}
              />

              <Input
                label="Industry"
                placeholder="e.g. Technology, Healthcare, Finance"
                value={createForm.industry}
                onChangeText={(value) => handleCreateInputChange("industry", value)}
                containerStyle={styles.inputContainer}
                inputStyle={styles.input}
                labelStyle={styles.inputLabel}
              />

              <Input
                label="Company Size"
                placeholder="e.g. 1-10, 11-50, 51-200"
                value={createForm.size}
                onChangeText={(value) => handleCreateInputChange("size", value)}
                containerStyle={styles.inputContainer}
                inputStyle={styles.input}
                labelStyle={styles.inputLabel}
              />

              <Button
                title="Create Organization"
                buttonStyle={styles.primaryButton}
                titleStyle={styles.primaryButtonText}
                onPress={handleCreateOrganization}
                containerStyle={styles.formButton}
                loading={isLoading}
                disabled={isLoading}
              />
            </Card>
          ) : (
            <Card containerStyle={styles.formCard}>
              <Card.Title style={styles.cardTitle}>Join Organization</Card.Title>
              <Card.Divider />

              <Input
                label="Invite Code *"
                placeholder="Enter invite code"
                value={joinForm.inviteCode}
                onChangeText={(value) => handleJoinInputChange("inviteCode", value)}
                containerStyle={styles.inputContainer}
                inputStyle={styles.input}
                labelStyle={styles.inputLabel}
              />

              <Text style={styles.helpText}>
                Ask your organization admin for an invite code
              </Text>

              <Button
                title="Join Organization"
                buttonStyle={styles.primaryButton}
                titleStyle={styles.primaryButtonText}
                onPress={handleJoinOrganization}
                containerStyle={styles.formButton}
                loading={isLoading}
                disabled={isLoading}
              />
            </Card>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Previous"
            type="outline"
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
            onPress={previousStep}
            containerStyle={styles.buttonWrapper}
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  modeSelector: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modeButtonContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  activeModeButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 12,
  },
  inactiveModeButton: {
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 12,
  },
  activeModeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  inactiveModeText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  formCard: {
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: "#1f2937",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  formButton: {
    marginTop: 20,
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "#ffffff",
  },
  buttonWrapper: {
    marginHorizontal: 8,
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