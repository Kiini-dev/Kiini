export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Kiini: One Hub. Total Control";
export const APP_TAGLINE = "One Hub. Total Control.";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/logo.png";

// Keep all production authentication on the primary domain.
export const getLoginUrl = (hostname = typeof window !== "undefined" ? window.location.hostname : "") => {
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local")) {
    return "/login";
  }
  return "https://kiini.africa/login";
};
