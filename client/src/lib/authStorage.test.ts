import { beforeEach, describe, expect, it } from "vitest";
import { clearAuthStorage, clearAuthStorageForLogoutRedirect } from "./authStorage";

describe("auth storage", () => {
  beforeEach(() => {
    localStorage.setItem("auth-token", "token");
    localStorage.setItem("auth-user", '{"id":"user-1"}');
    localStorage.setItem("legacy-runtime-user-info", '{"id":"user-1"}');
  });

  it("removes persisted identity during logout", () => {
    clearAuthStorage();

    expect(localStorage.getItem("auth-token")).toBeNull();
    expect(localStorage.getItem("auth-user")).toBeNull();
    expect(localStorage.getItem("legacy-runtime-user-info")).toBeNull();
  });

  it("clears auth from the primary origin and removes the one-time logout marker", () => {
    window.history.replaceState({}, "", "/login?logout=1&next=%2Fcrm-home");

    expect(clearAuthStorageForLogoutRedirect()).toBe(true);
    expect(localStorage.getItem("auth-token")).toBeNull();
    expect(localStorage.getItem("auth-user")).toBeNull();
    expect(window.location.search).toBe("?next=%2Fcrm-home");
  });
});