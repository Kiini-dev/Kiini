/**
 * Invoice list screen for mobile app
 */

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

export default function InvoicesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Invoices</Text>
      <View style={styles.item}> 
        <Text style={styles.itemTitle}>INV-0001</Text>
        <Text style={styles.itemSubtitle}>Due in 7 days • KES 53,000</Text>
      </View>
      <View style={styles.item}> 
        <Text style={styles.itemTitle}>INV-0002</Text>
        <Text style={styles.itemSubtitle}>Overdue • KES 14,500</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Create new invoice</Text>
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
