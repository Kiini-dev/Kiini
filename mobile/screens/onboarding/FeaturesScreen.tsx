/**
 * Features Screen
 * Shows key features of the app
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOnboarding } from "../../context/OnboardingContext";

const { width } = Dimensions.get("window");

const features = [
  {
    icon: "file-document-outline",
    title: "Invoice Management",
    description: "Create, send, and track invoices with automated payment reminders",
  },
  {
    icon: "contacts-outline",
    title: "Client Management",
    description: "Maintain detailed client profiles and communication history",
  },
  {
    icon: "briefcase-outline",
    title: "Project Tracking",
    description: "Organize projects, assign tasks, and monitor progress",
  },
  {
    icon: "chart-line",
    title: "Business Analytics",
    description: "Get insights into your business performance and trends",
  },
  {
    icon: "office-building",
    title: "Multi-Organization",
    description: "Manage multiple organizations and switch between them",
  },
  {
    icon: "cog-outline",
    title: "Advanced Settings",
    description: "Customize workflows, templates, and system preferences",
  },
];

export default function FeaturesScreen() {
  const { nextStep, previousStep } = useOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Kiini</Text>
        <Text style={styles.subtitle}>
          Powerful features to streamline your business operations
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <MaterialCommunityIcons
                name={feature.icon as any}
                size={32}
                color="#3b82f6"
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

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
          onPress={nextStep}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
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