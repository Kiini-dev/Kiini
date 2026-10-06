import { useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

const VISITOR_KEY = "kiini-website-visitor-id";
const SESSION_KEY = "kiini-website-session-id";

function getOrCreateId(key: string, prefix: string) {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = `${prefix}_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
  window.localStorage.setItem(key, id);
  return id;
}

export function useWebsiteAnalytics(options?: { trackPageView?: boolean }) {
  const { mutate: trackMutation } = trpc.websiteAdmin.trackEvent.useMutation();
  const visitorId = useRef("");
  const sessionId = useRef("");

  useEffect(() => {
    visitorId.current = getOrCreateId(VISITOR_KEY, "visitor");
    sessionId.current = getOrCreateId(SESSION_KEY, "session");
  }, []);

  const track = useCallback((eventName: string, metadata?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    trackMutation({
      eventName,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      visitorId: visitorId.current || getOrCreateId(VISITOR_KEY, "visitor"),
      sessionId: sessionId.current || getOrCreateId(SESSION_KEY, "session"),
      metadata,
    });
  }, [trackMutation]);

  useEffect(() => {
    if (options?.trackPageView !== false) track("page_view");
  }, [options?.trackPageView, track]);

  return { track };
}
