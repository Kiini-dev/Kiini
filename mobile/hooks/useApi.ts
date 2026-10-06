/**
 * useApi Hook
 * Custom hook for making API calls with error handling and token refresh
 */

import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { API_URL, STORAGE_KEYS } from "../config/constants";
import { storage } from "../utils/storage";

interface UseApiState {
  loading: boolean;
  error: string | null;
  data: any;
}

interface UseApiResult extends UseApiState {
  execute: (endpoint: string, config?: AxiosRequestConfig) => Promise<any>;
  reset: () => void;
}

export function useApi(): UseApiResult {
  const [state, setState] = useState<UseApiState>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (endpoint: string, config?: AxiosRequestConfig) => {
      setState({ loading: true, error: null, data: null });
      try {
        const token = await storage.getSecure(STORAGE_KEYS.AUTH_TOKEN);
        const response = await axios.get(`${API_URL}${endpoint}`, {
          ...config,
          headers: {
            ...config?.headers,
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        setState({ loading: false, error: null, data: response.data });
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
