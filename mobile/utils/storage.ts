/**
 * Storage Utility
 * Secure storage for sensitive data with optional encryption
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

class StorageService {
  // Store sensitive data securely
  async setSecure(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        // Fallback to AsyncStorage for web
        await AsyncStorage.setItem(`secure_${key}`, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error storing secure value (${key}):`, error);
    }
  }

  // Retrieve securely stored data
  async getSecure(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(`secure_${key}`);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error retrieving secure value (${key}):`, error);
      return null;
    }
  }

  // Remove securely stored data
  async removeSecure(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing secure value (${key}):`, error);
    }
  }

  // Store regular data
  async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing value (${key}):`, error);
    }
  }

  // Retrieve regular data
  async get(key: string): Promise<any> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error retrieving value (${key}):`, error);
      return null;
    }
  }

  // Remove regular data
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing value (${key}):`, error);
    }
  }

  // Clear all storage
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }
}

export const storage = new StorageService();
