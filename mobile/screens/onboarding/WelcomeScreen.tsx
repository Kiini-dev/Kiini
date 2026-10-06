/**
 * Welcome Screen
 * First screen in the onboarding flow
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { Button } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOnboarding } from "../../context/OnboardingContext";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { nextStep, skipOnboarding } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="office-building"
            size={80}
            color="#3b82f6"
          />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Welcome to Kiini</Text>
          <Text style={styles.subtitle}>
            Your comprehensive CRM and business management solution
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color="#6b7280"
            />
            <Text style={styles.featureText}>Manage invoices & payments</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="contacts-outline"
              size={24}
              color="#6b7280"
            />
            <Text style={styles.featureText}>Track clients & contacts</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={24}
              color="#6b7280"
            />
            <Text style={styles.featureText}>Organize projects & tasks</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            buttonStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonText}
            onPress={nextStep}
            containerStyle={styles.buttonWrapper}
          />
          <Button
            title="Skip for now"
            type="outline"
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
            onPress={skipOnboarding}
            containerStyle={styles.buttonWrapper}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 16,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 40,
  },
  buttonWrapper: {
    marginVertical: 8,
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