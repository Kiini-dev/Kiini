/**
 * Profile Setup Screen
 * Allows user to set up their profile information
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
import { Button, Input } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useOnboarding } from "../../context/OnboardingContext";
import { STORAGE_KEYS } from "../../config/constants";

export default function ProfileSetupScreen() {
  const { nextStep, previousStep } = useOnboarding();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Validation Error", "First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Validation Error", "Last name is required");
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Save profile data to storage
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        jobTitle: formData.jobTitle.trim(),
        phone: formData.phone.trim(),
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profileData)
      );

      nextStep();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile information");
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
            <Text style={styles.title}>Set Up Your Profile</Text>
            <Text style={styles.subtitle}>
              Tell us a bit about yourself to personalize your experience
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={48}
                  color="#9ca3af"
                />
              </View>
              <Text style={styles.avatarText}>Profile Picture</Text>
            </View>

            <Input
              label="First Name *"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange("firstName", value)}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.inputLabel}
            />

            <Input
              label="Last Name *"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange("lastName", value)}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.inputLabel}
            />

            <Input
              label="Job Title"
              placeholder="e.g. Sales Manager, Accountant"
              value={formData.jobTitle}
              onChangeText={(value) => handleInputChange("jobTitle", value)}
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.inputLabel}
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange("phone", value)}
              keyboardType="phone-pad"
              containerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.inputLabel}
            />
          </View>
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
          <Button
            title="Continue"
            buttonStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonText}
            onPress={handleContinue}
            containerStyle={styles.buttonWrapper}
            loading={isLoading}
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
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 14,
    color: "#6b7280",
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
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
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