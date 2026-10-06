/**
 * useOfflineQueue Hook
 * Manages offline requests that will be synced when connection is restored
 */

import { useCallback, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QueuedRequest {
  id: string;
  method: string;
  endpoint: string;
  data: any;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = "offline_queue";

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedRequest[]>([]);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  // Load queue from storage
  useEffect(() => {
    async function loadQueue() {
      try {
        const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading queue:", error);
      }
    }

    loadQueue();
  }, []);

  // Save queue to storage
  useEffect(() => {
    async function saveQueue() {
      try {
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
      } catch (error) {
        console.error("Error saving queue:", error);
      }
    }

    saveQueue();
  }, [queue]);

  const addToQueue = useCallback(
    (method: string, endpoint: string, data: any) => {
      const request: QueuedRequest = {
        id: `${Date.now()}-${Math.random()}`,
        method,
        endpoint,
        data,
        timestamp: Date.now(),
      };
      setQueue((prev) => [...prev, request]);
      return request.id;
    },
    []
  );

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((req) => req.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    isOnline,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
}
