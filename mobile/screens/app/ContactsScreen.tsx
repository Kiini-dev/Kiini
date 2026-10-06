/**
 * Contact list screen for mobile app
 */

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function ContactsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Customers</Text>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Jane Doe</Text>
        <Text style={styles.itemSubtitle}>jane.doe@example.com</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>Acme Corporation</Text>
        <Text style={styles.itemSubtitle}>Finance team</Text>
      </View>
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
});
