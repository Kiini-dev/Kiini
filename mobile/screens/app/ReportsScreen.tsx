/**
 * Reports Screen
 * Analytics and reporting dashboard
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useApi } from "../../hooks";

interface ReportData {
  totalRevenue: number;
  activeProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  totalClients: number;
  revenueGrowth: number;
}

export default function ReportsScreen() {
  const { execute, loading, data: reportData } = useApi();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      await execute("/api/reports/dashboard");
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const report = reportData as ReportData | undefined;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadReports}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Revenue Card */}
      <View style={[styles.card, styles.largeCard]}>
        <Text style={styles.cardLabel}>Total Revenue</Text>
        <Text style={styles.largeNumber}>
          ${report?.totalRevenue?.toLocaleString() || "0"}
        </Text>
        <Text style={styles.growth}>
          ↑ {report?.revenueGrowth || 0}% from last month
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={[styles.card, styles.gridCard]}>
          <Text style={styles.number}>{report?.activeProjects || 0}</Text>
          <Text style={styles.label}>Active Projects</Text>
        </View>
        <View style={[styles.card, styles.gridCard]}>
          <Text style={styles.number}>{report?.completedProjects || 0}</Text>
          <Text style={styles.label}>Completed</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, styles.gridCard]}>
          <Text style={styles.number}>{report?.pendingInvoices || 0}</Text>
          <Text style={styles.label}>Pending Invoices</Text>
        </View>
        <View style={[styles.card, styles.gridCard]}>
          <Text style={styles.number}>{report?.totalClients || 0}</Text>
          <Text style={styles.label}>Total Clients</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Export Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
        >
          <Text style={styles.secondaryButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  largeCard: {
    backgroundColor: "#3b82f6",
  },
  cardLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 8,
  },
  largeNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  growth: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  grid: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  number: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3b82f6",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
  },
  secondaryButtonText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 14,
  },
});
