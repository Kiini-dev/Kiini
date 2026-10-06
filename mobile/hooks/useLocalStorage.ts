/**
 * useLocalStorage Hook
 * Persistent storage hook for mobile using AsyncStorage
 */

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from storage on mount
  useEffect(() => {
    async function loadValue() {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading from storage (${key}):`, error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadValue();
  }, [key]);

  // Write to storage
  const setValue = async (value: T) => {
    try {
      setStoredValue(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  };

  return [storedValue, setValue];
}
