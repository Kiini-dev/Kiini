/**
 * Projects list screen for mobile app
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function ProjectsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Website redesign</Text>
        <Text style={styles.itemSubtitle}>In progress • Due May 24</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Payroll automation</Text>
        <Text style={styles.itemSubtitle}>Pending approval • 5 tasks</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add new project</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  itemSubtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  button: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
