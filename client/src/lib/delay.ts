import { SIMULATE_NETWORK } from "@/config";

// Helper to optionally delay when running in demo/simulate mode.
export const maybeDelay = (ms: number) => {
  if (!SIMULATE_NETWORK) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export default maybeDelay;
