import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { PUBLIC_ROUTES } from "@/lib/permissions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { SystemSettingsProvider } from "./contexts/SystemSettingsContext";
import { getLoginUrl } from "./const";
import "./index.css";

// ensure the Download icon is available globally in case a bundle chunk
// accidentally references it as a global variable (observed in production)
import { Download } from "lucide-react";
;(window as any).Download = Download;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const isPublicPath = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/" || pathname.startsWith("/?");
    }
    return (
      pathname === route ||
      pathname.startsWith(route + "/") ||
      pathname.startsWith(route + "?")
    );
  });
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized =
    error.message === UNAUTHED_ERR_MSG ||
    error.message === "UNAUTHORIZED" ||
    (error.data as any)?.code === "UNAUTHORIZED";
  if (!isUnauthorized) return;

  const pathname = window.location.pathname;
  if (isPublicPath(pathname)) return;

  // If localStorage still has both a user and a token, this UNAUTHORIZED is likely a
  // stale pre-login query completing after the user just logged in, or a race on
  // page load. Bail out — useAuthWithPersistence handles real auth failures.
  const localUser = localStorage.getItem("auth-user");
  const localToken = localStorage.getItem("auth-token");
  if (localUser && localToken) {
    console.warn("[Auth] Ignoring UNAUTHORIZED error — user and token still present in localStorage (stale query).");
    return;
  }

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Log initialization status
console.log("[App Init] Starting React app initialization...");
console.log("[App Init] VITE_API_URL env var:", import.meta.env.VITE_API_URL);
console.log("[App Init] Root element:", document.getElementById("root"));

// Initialize tRPC using the same origin as the page so it always hits the
// correct backend regardless of which port the dev/prod server is running on.
const trpcEndpoint = `${window.location.origin}/api/trpc`;

const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcEndpoint,
      maxURLLength: 2048,
      transformer: superjson,
      fetch(input, init) {
        const headers = {
          ...(init?.headers ?? {}),
        } as Record<string,string>;
        // Send token from localStorage as Authorization header ALWAYS for tRPC
        const localToken = localStorage.getItem("auth-token");
        const url = String(input);
        
        // ALWAYS add token if present - don't check URL
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`;
          console.log('[tRPC fetch] Token added to all requests, URL:', url.substring(0, 60));
        } else {
          console.log('[tRPC fetch] NO token in localStorage - URL:', url.substring(0, 60));
        }
        
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers,
        });
      },
    }),
  ],
});

console.log("[App Init] tRPC client created");

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found in DOM");
  }

  console.log("[App Init] Creating React root...");
  
  createRoot(root).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SystemSettingsProvider>
          <App />
        </SystemSettingsProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
  
  console.log("[App Init] React app rendered successfully");
} catch (error) {
  console.error("[App Init] FATAL ERROR", error);
  document.body.innerHTML = `
    <div style="color: red; font-family: monospace; padding: 20px;">
      <h2>Application initialization failed</h2>
      <pre>${String(error)}</pre>
    </div>
  `;
}
