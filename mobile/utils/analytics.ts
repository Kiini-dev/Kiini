/**
 * Analytics Utility
 * Centralized analytics tracking for mobile app
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private batchSize = 10;
  private flushInterval = 60000; // 1 minute

  constructor() {
    // Auto-flush events periodically
    setInterval(() => this.flush(), this.flushInterval);
  }

  track(name: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Flush when batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    try {
      const batch = [...this.events];
      this.events = [];

      // Store batch for later sync
      const stored = await AsyncStorage.getItem("analytics_queue");
      const queue = stored ? JSON.parse(stored) : [];
      queue.push(...batch);
      await AsyncStorage.setItem("analytics_queue", JSON.stringify(queue));

      // TODO: Send to analytics server when online
    } catch (error) {
      console.error("Error flushing analytics:", error);
    }
  }

  async sendPendingEvents() {
    try {
      const stored = await AsyncStorage.getItem("analytics_queue");
      if (!stored) return;

      const queue = JSON.parse(stored);
      // TODO: Send to analytics server
      // await api.post("/analytics/events", { events: queue });

      await AsyncStorage.removeItem("analytics_queue");
    } catch (error) {
      console.error("Error sending pending analytics:", error);
    }
  }
}

export const analytics = new AnalyticsService();
