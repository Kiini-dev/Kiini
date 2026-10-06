/**
 * Dashboard / Home screen for mobile app
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.subheading}>
        {user?.name || "Your team"}, here are your latest insights.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invoices overview</Text>
        <Text style={styles.cardText}>Open invoices, overdue balances, and recent payments.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tasks & projects</Text>
        <Text style={styles.cardText}>Track project status and overdue tasks in one place.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer activity</Text>
        <Text style={styles.cardText}>Latest contact interactions and sales opportunities.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  cardText: {
    color: "#4b5563",
    lineHeight: 22,
  },
});
