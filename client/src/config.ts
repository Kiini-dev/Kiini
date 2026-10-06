// Central client-side configuration
// Use Vite env variable VITE_SIMULATE_NETWORK=true to enable simulated delays in dev/demo
export const SIMULATE_NETWORK = (import.meta.env?.VITE_SIMULATE_NETWORK === 'true');

export default {
  SIMULATE_NETWORK,
};
