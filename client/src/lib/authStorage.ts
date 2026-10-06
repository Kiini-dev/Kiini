const AUTH_USER_KEY = "auth-user";
const AUTH_TOKEN_KEY = "auth-token";
const RUNTIME_USER_INFO_SUFFIX = "-runtime-user-info";
let logoutRedirectHandledForPage = false;

export function clearRuntimeUserInfo() {
  if (typeof window === "undefined") return;

  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    keys.forEach((key) => {
      if (key?.endsWith(RUNTIME_USER_INFO_SUFFIX)) localStorage.removeItem(key);
    });
  } catch {
    // Ignore blocked browser storage.
  }
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // The server logout still invalidates the shared session cookie.
  }
  clearRuntimeUserInfo();
}

export function clearAuthStorageForLogoutRedirect() {
  if (typeof window === "undefined") return false;
  if (logoutRedirectHandledForPage) return true;

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get("logout") !== "1") return false;

  logoutRedirectHandledForPage = true;
  clearAuthStorage();
  currentUrl.searchParams.delete("logout");
  window.history.replaceState(window.history.state, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
  return true;
}

function getPersistedAuthUser(user: unknown) {
  if (!user || typeof user !== "object") return null;

  const {
    photoUrl: _photoUrl,
    photoBase64: _photoBase64,
    avatar: _avatar,
    avatarUrl: _avatarUrl,
    imageData: _imageData,
    ...identity
  } = user as Record<string, unknown>;

  return identity;
}

export function saveAuthUser(user: unknown) {
  const identity = getPersistedAuthUser(user);
  if (!identity) return false;

  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(identity));
    return true;
  } catch (error) {
    // Keep authentication usable even when another app has filled browser storage.
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
        id: (identity as any).id,
        email: (identity as any).email,
        name: (identity as any).name,
        role: (identity as any).role,
        organizationId: (identity as any).organizationId,
      }));
      return true;
    } catch {
      console.warn("[Auth] Unable to persist user identity in browser storage", error);
      return false;
    }
  }
}
